"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Building2, Home, Settings } from "lucide-react";
import { setRotaOverride } from "@/lib/actions/rota";
import { toast } from "sonner";
import { RotaDefaultsDialog } from "./rota-defaults-dialog";
import type { RotaWeekEntry } from "@/types";
import type { Department, RotaDefault } from "@/types/database";

type RotaWeekGridProps = {
  entries: RotaWeekEntry[];
  weekStart: string;
  departments: Department[];
  selectedDepartment?: string;
  canEdit: boolean;
  allDefaults: RotaDefault[];
};

export function RotaWeekGrid({
  entries,
  weekStart,
  departments,
  selectedDepartment,
  canEdit,
  allDefaults,
}: RotaWeekGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [togglingCell, setTogglingCell] = useState<string | null>(null);

  // Calculate the 5 dates (Sun–Thu) from the week start
  const startDate = new Date(weekStart + "T00:00:00");
  const weekDates: { date: string; label: string; dayLabel: string }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu"];
  for (let i = 0; i < 5; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayNum = d.getDate();
    const monthShort = d.toLocaleDateString("en-US", { month: "short" });
    weekDates.push({
      date: dateStr,
      label: `${dayNum} ${monthShort}`,
      dayLabel: dayNames[i],
    });
  }

  // Week label
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4);
  const weekLabel = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  function navigateWeek(offset: number) {
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() + offset * 7);
    const newWeekStr = newStart.toISOString().split("T")[0];
    const params = new URLSearchParams();
    params.set("week", newWeekStr);
    if (selectedDepartment) params.set("department", selectedDepartment);
    startTransition(() => {
      router.push(`/rota?${params.toString()}`);
    });
  }

  function handleDepartmentChange(value: string) {
    const params = new URLSearchParams();
    params.set("week", weekStart);
    if (value !== "all") params.set("department", value);
    startTransition(() => {
      router.push(`/rota?${params.toString()}`);
    });
  }

  async function handleCellClick(profileId: string, dateStr: string, currentLocation: "office" | "home") {
    if (!canEdit) return;

    const cellKey = `${profileId}-${dateStr}`;
    setTogglingCell(cellKey);

    const newLocation = currentLocation === "office" ? "home" : "office";
    const result = await setRotaOverride({
      profile_id: profileId,
      date: dateStr,
      location: newLocation,
    });

    setTogglingCell(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateWeek(-1)}
            disabled={isPending}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[200px] text-center text-sm font-medium">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateWeek(1)}
            disabled={isPending}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={selectedDepartment ?? "all"}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-green-100">
            <Building2 className="h-3 w-3 text-green-700" />
          </div>
          Office
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-100">
            <Home className="h-3 w-3 text-blue-700" />
          </div>
          Home
        </div>
        {canEdit && (
          <span className="text-muted-foreground/60">
            Click a cell to toggle &middot; Use <Settings className="inline h-3 w-3" /> to set weekly defaults
          </span>
        )}
      </div>

      {/* Weekly grid table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Employee</TableHead>
              {weekDates.map((wd) => (
                <TableHead key={wd.date} className="text-center min-w-[80px]">
                  <div className="text-xs font-medium">{wd.dayLabel}</div>
                  <div className="text-[10px] text-muted-foreground">{wd.label}</div>
                </TableHead>
              ))}
              {canEdit && <TableHead className="w-[40px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.profileId}>
                  <TableCell>
                    <div className="font-medium text-sm">{entry.profileName}</div>
                    {entry.departmentName && (
                      <div className="text-xs text-muted-foreground">{entry.departmentName}</div>
                    )}
                  </TableCell>
                  {weekDates.map((wd) => {
                    const dayInfo = entry.days[wd.date];
                    const isOffice = dayInfo?.location === "office";
                    const isOverride = dayInfo?.isOverride ?? false;
                    const cellKey = `${entry.profileId}-${wd.date}`;
                    const isToggling = togglingCell === cellKey;

                    return (
                      <TableCell key={wd.date} className="text-center p-1">
                        <button
                          type="button"
                          disabled={!canEdit || isToggling}
                          onClick={() => handleCellClick(entry.profileId, wd.date, dayInfo?.location ?? "office")}
                          className={`
                            mx-auto flex h-8 w-8 items-center justify-center rounded transition-colors
                            ${isOffice
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }
                            ${canEdit ? "cursor-pointer" : "cursor-default"}
                            ${isToggling ? "opacity-50" : ""}
                            ${isOverride ? "ring-1 ring-offset-1 ring-amber-400" : ""}
                          `}
                          title={`${isOffice ? "Office" : "Home"}${isOverride ? " (override)" : " (default)"}`}
                        >
                          {isOffice ? (
                            <Building2 className="h-3.5 w-3.5" />
                          ) : (
                            <Home className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </TableCell>
                    );
                  })}
                  {canEdit && (
                    <TableCell className="p-1">
                      <RotaDefaultsDialog
                        profileId={entry.profileId}
                        profileName={entry.profileName}
                        currentDefaults={allDefaults.filter((d) => d.profile_id === entry.profileId)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
