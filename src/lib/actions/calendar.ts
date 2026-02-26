"use server";

import { getCalendarEvents } from "@/lib/queries/calendar";
import type { CalendarEvent } from "@/types";

export async function fetchCalendarEvents(
  startDate: string,
  endDate: string,
  type: "vacations" | "travel" | "all" = "all"
): Promise<CalendarEvent[]> {
  return getCalendarEvents(startDate, endDate, type);
}
