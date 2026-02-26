"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types";
import type { Department } from "@/types/database";

type CalendarViewProps = {
  events: CalendarEvent[];
  departments?: Department[];
  showDepartmentFilter?: boolean;
  onMonthChange?: (start: string, end: string) => void;
};

const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  vacation: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  business_trip: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
};

export function CalendarView({
  events,
  departments,
  showDepartmentFilter,
  onMonthChange,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function navigateMonth(direction: "prev" | "next") {
    const newDate = direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDay(null);
    if (onMonthChange) {
      const start = format(startOfMonth(newDate), "yyyy-MM-dd");
      const end = format(endOfMonth(newDate), "yyyy-MM-dd");
      onMonthChange(start, end);
    }
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDay(null);
  }

  function getEventsForDay(day: Date): CalendarEvent[] {
    return events.filter((event) => {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
    });
  }

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return getEventsForDay(selectedDay);
  }, [selectedDay, events]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[180px] text-center text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {showDepartmentFilter && departments && (
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
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
          )}
          {/* Legend */}
          <div className="hidden items-center gap-3 text-xs sm:flex">
            {Object.entries(EVENT_COLORS).map(([key, colors]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                <span className="capitalize">{key.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "relative min-h-[80px] border-b border-r p-1 text-left transition-colors hover:bg-accent/50",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isSelected && "bg-accent",
                  idx % 7 === 0 && "border-l-0"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday(day) && "bg-primary text-primary-foreground font-bold"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => {
                    const colors = EVENT_COLORS[event.type] ?? EVENT_COLORS.vacation;
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                          colors.bg,
                          colors.text,
                          event.status === "pending" && "opacity-60"
                        )}
                      >
                        {event.profileName.split(" ")[0]}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="mb-3 font-semibold">
              {format(selectedDay, "EEEE, MMMM d, yyyy")}
            </h3>
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events on this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map((event) => {
                  const colors = EVENT_COLORS[event.type] ?? EVENT_COLORS.vacation;
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-center gap-3 rounded-md p-2",
                        colors.bg
                      )}
                    >
                      <div className={cn("h-3 w-3 rounded-full", colors.dot)} />
                      <div>
                        <p className={cn("text-sm font-medium", colors.text)}>
                          {event.profileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.title} {event.status === "pending" ? "(Pending)" : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
