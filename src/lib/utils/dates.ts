import { eachDayOfInterval, isWeekend, format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval } from "date-fns";

export function calculateBusinessDays(startDate: Date, endDate: Date, holidays: string[] = []): number {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter((day) => {
    if (isWeekend(day)) return false;
    if (holidays.includes(format(day, "yyyy-MM-dd"))) return false;
    return true;
  }).length;
}

export function formatDateRange(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  if (isSameDay(s, e)) {
    return format(s, "MMM d, yyyy");
  }
  if (isSameMonth(s, e)) {
    return `${format(s, "MMM d")} - ${format(e, "d, yyyy")}`;
  }
  return `${format(s, "MMM d")} - ${format(e, "MMM d, yyyy")}`;
}

export function getMonthRange(date: Date) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getAdjacentMonths(date: Date) {
  return {
    prev: subMonths(date, 1),
    next: addMonths(date, 1),
  };
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end });
}

export function getDaysInMonth(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
}
