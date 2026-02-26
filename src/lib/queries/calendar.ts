import { createClient } from "@/lib/supabase/server";
import { getHolidaysInRange } from "@/lib/queries/holidays";
import type { CalendarEvent } from "@/types";

export async function getCalendarEvents(
  startDate: string,
  endDate: string,
  type: "vacations" | "travel" | "all" = "all"
): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const events: CalendarEvent[] = [];

  if (type === "vacations" || type === "all") {
    const { data: vacations } = await supabase
      .from("vacation_requests")
      .select("id, start_date, end_date, type, status, profile_id, profiles(full_name)")
      .in("status", ["approved", "pending"])
      .gte("end_date", startDate)
      .lte("start_date", endDate);

    if (vacations) {
      for (const v of vacations) {
        const profile = v.profiles as unknown as { full_name: string };
        events.push({
          id: v.id,
          title: `${profile?.full_name || "Unknown"} - ${v.type}`,
          start: v.start_date,
          end: v.end_date,
          type: v.type as "vacation",
          status: v.status,
          profileName: profile?.full_name || "Unknown",
          profileId: v.profile_id,
        });
      }
    }
  }

  if (type === "travel" || type === "all") {
    const { data: trips } = await supabase
      .from("business_trips")
      .select("id, start_date, end_date, destination, status, profile_id, profiles(full_name)")
      .in("status", ["approved", "in_progress", "planned"])
      .gte("end_date", startDate)
      .lte("start_date", endDate);

    if (trips) {
      for (const t of trips) {
        const profile = t.profiles as unknown as { full_name: string };
        events.push({
          id: t.id,
          title: `${profile?.full_name || "Unknown"} - ${t.destination}`,
          start: t.start_date,
          end: t.end_date,
          type: "business_trip",
          status: t.status,
          profileName: profile?.full_name || "Unknown",
          profileId: t.profile_id,
        });
      }
    }
  }

  // Always include holidays on all calendars
  const holidays = await getHolidaysInRange(startDate, endDate);
  for (const h of holidays) {
    events.push({
      id: h.id,
      title: h.name,
      start: h.date,
      end: h.date,
      type: "holiday",
      status: "approved",
      profileName: "",
      profileId: "",
    });
  }

  return events;
}
