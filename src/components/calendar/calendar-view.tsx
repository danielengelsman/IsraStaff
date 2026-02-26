"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCalendarEvents } from "@/lib/actions/calendar";
import type { CalendarEvent } from "@/types";
import type { Department } from "@/types/database";

type CalendarViewProps = {
  initialEvents: CalendarEvent[];
  eventType: "vacations" | "travel" | "all";
  departments?: Department[];
  showDepartmentFilter?: boolean;
};

const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  vacation: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  business_trip: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  holiday: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export function CalendarView({
  initialEvents,
  eventType,
  departments,
  showDepartmentFilter,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const loadEvents = useCallback(
    (date: Date) => {
      const start = format(startOfMonth(date), "yyyy-MM-dd");
      const end = format(endOfMonth(date), "yyyy-MM-dd");
      startTransition(async () => {
        const newEvents = await fetchCalendarEvents(start, end, eventType);
        setEvents(newEvents);
      });
    },
    [eventType]
  );

  function navigateMonth(direction: "prev" | "next") {
    const newDate = direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDay(null);
    loadEvents(newDate);
  }

  function goToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(null);
    loadEvents(today);
  }

  function getEventsForDay(day: Date): CalendarEvent[] {
    const dayEvents = events.filter((event) => {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
    });
    // Sort holidays first so they appear at the top
    return dayEvents.sort((a, b) => {
      if (a.type === "holiday" && b.type !== "holiday") return -1;
      if (a.type !== "holiday" && b.type === "holiday") return 1;
      return 0;
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
            {isPending && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}
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
      <div className={cn("rounded-lg border", isPending && "opacity-60")}>
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
                        {event.type === "holiday" ? event.title : event.profileName.split(" ")[0]}
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
                        {event.type === "holiday" ? (
                          <p className={cn("text-sm font-medium", colors.text)}>
                            {event.title}
                          </p>
                        ) : (
                          <>
                            <p className={cn("text-sm font-medium", colors.text)}>
                              {event.profileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.title} {event.status === "pending" ? "(Pending)" : ""}
                            </p>
                          </>
                        )}
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
