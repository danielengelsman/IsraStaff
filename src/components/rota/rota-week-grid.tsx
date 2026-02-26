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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Building2, Home, Settings, MessageSquare } from "lucide-react";
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
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  // Calculate the 5 dates (Sun-Thu) from the week start
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
  const weekLabel = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} \u2013 ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

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
            Click a cell to edit &middot; Use <Settings className="inline h-3 w-3" /> to set weekly defaults
          </span>
        )}
      </div>

      {/* Weekly grid table */}
      <div className="rounded-md border">
        <TooltipProvider>
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
                      const hasNotes = !!dayInfo?.notes;
                      const cellKey = `${entry.profileId}-${wd.date}`;
                      const isSaving = savingCell === cellKey;
                      const isOpen = openPopover === cellKey;

                      return (
                        <TableCell key={wd.date} className="text-center p-1">
                          {canEdit ? (
                            <CellPopover
                              isOpen={isOpen}
                              onOpenChange={(open) => setOpenPopover(open ? cellKey : null)}
                              profileId={entry.profileId}
                              dateStr={wd.date}
                              location={dayInfo?.location ?? "office"}
                              notes={dayInfo?.notes ?? ""}
                              isOffice={isOffice}
                              isOverride={isOverride}
                              hasNotes={hasNotes}
                              isSaving={isSaving}
                              onSave={async (location, notes) => {
                                setSavingCell(cellKey);
                                const result = await setRotaOverride({
                                  profile_id: entry.profileId,
                                  date: wd.date,
                                  location,
                                  notes: notes || undefined,
                                });
                                setSavingCell(null);
                                if (result.error) {
                                  toast.error(result.error);
                                } else {
                                  setOpenPopover(null);
                                  router.refresh();
                                }
                              }}
                            />
                          ) : (
                            <CellDisplay
                              isOffice={isOffice}
                              isOverride={isOverride}
                              hasNotes={hasNotes}
                              notes={dayInfo?.notes ?? null}
                            />
                          )}
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
        </TooltipProvider>
      </div>
    </div>
  );
}

/** Read-only cell display with tooltip for notes */
function CellDisplay({
  isOffice,
  isOverride,
  hasNotes,
  notes,
}: {
  isOffice: boolean;
  isOverride: boolean;
  hasNotes: boolean;
  notes: string | null;
}) {
  const cell = (
    <div
      className={`
        relative mx-auto flex h-8 w-8 items-center justify-center rounded cursor-default
        ${isOffice
          ? "bg-green-100 text-green-700"
          : "bg-blue-100 text-blue-700"
        }
        ${isOverride ? "ring-1 ring-offset-1 ring-amber-400" : ""}
      `}
    >
      {isOffice ? (
        <Building2 className="h-3.5 w-3.5" />
      ) : (
        <Home className="h-3.5 w-3.5" />
      )}
      {hasNotes && (
        <MessageSquare className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-600 fill-amber-200" />
      )}
    </div>
  );

  if (hasNotes && notes) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{cell}</TooltipTrigger>
        <TooltipContent>{notes}</TooltipContent>
      </Tooltip>
    );
  }

  return cell;
}

/** Editable cell with popover for location + notes */
function CellPopover({
  isOpen,
  onOpenChange,
  profileId,
  dateStr,
  location,
  notes,
  isOffice,
  isOverride,
  hasNotes,
  isSaving,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  dateStr: string;
  location: "office" | "home";
  notes: string;
  isOffice: boolean;
  isOverride: boolean;
  hasNotes: boolean;
  isSaving: boolean;
  onSave: (location: "office" | "home", notes: string) => Promise<void>;
}) {
  const [editLocation, setEditLocation] = useState(location);
  const [editNotes, setEditNotes] = useState(notes);

  // Reset state when popover opens
  function handleOpenChange(open: boolean) {
    if (open) {
      setEditLocation(location);
      setEditNotes(notes);
    }
    onOpenChange(open);
  }

  const cellButton = (
    <button
      type="button"
      className={`
        relative mx-auto flex h-8 w-8 items-center justify-center rounded transition-colors cursor-pointer
        ${isOffice
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }
        ${isSaving ? "opacity-50" : ""}
        ${isOverride ? "ring-1 ring-offset-1 ring-amber-400" : ""}
      `}
    >
      {isOffice ? (
        <Building2 className="h-3.5 w-3.5" />
      ) : (
        <Home className="h-3.5 w-3.5" />
      )}
      {hasNotes && (
        <MessageSquare className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-600 fill-amber-200" />
      )}
    </button>
  );

  // If popover is not open but cell has notes, wrap in tooltip
  if (!isOpen && hasNotes) {
    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              {cellButton}
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{notes}</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-56 p-3" align="center">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant={editLocation === "office" ? "default" : "outline"}
                  className="flex-1 h-7 text-xs"
                  onClick={() => setEditLocation("office")}
                >
                  <Building2 className="mr-1 h-3 w-3" />
                  Office
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={editLocation === "home" ? "default" : "outline"}
                  className="flex-1 h-7 text-xs"
                  onClick={() => setEditLocation("home")}
                >
                  <Home className="mr-1 h-3 w-3" />
                  Home
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Note</Label>
              <Input
                placeholder="e.g. arriving 11am"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <Button
              size="sm"
              className="w-full h-7 text-xs"
              disabled={isSaving}
              onClick={() => onSave(editLocation, editNotes)}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {cellButton}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="center">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <div className="flex gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={editLocation === "office" ? "default" : "outline"}
                className="flex-1 h-7 text-xs"
                onClick={() => setEditLocation("office")}
              >
                <Building2 className="mr-1 h-3 w-3" />
                Office
              </Button>
              <Button
                type="button"
                size="sm"
                variant={editLocation === "home" ? "default" : "outline"}
                className="flex-1 h-7 text-xs"
                onClick={() => setEditLocation("home")}
              >
                <Home className="mr-1 h-3 w-3" />
                Home
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Note</Label>
            <Input
              placeholder="e.g. arriving 11am"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <Button
            size="sm"
            className="w-full h-7 text-xs"
            disabled={isSaving}
            onClick={() => onSave(editLocation, editNotes)}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
