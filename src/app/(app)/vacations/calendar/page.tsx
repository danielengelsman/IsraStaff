import { format, startOfMonth, endOfMonth } from "date-fns";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getCalendarEvents } from "@/lib/queries/calendar";
import { getDepartments } from "@/lib/queries/departments";
import { CalendarView } from "@/components/calendar/calendar-view";
import { PageHeader } from "@/components/shared/page-header";
import { redirect } from "next/navigation";

export default async function VacationCalendarPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const now = new Date();
  const start = format(startOfMonth(now), "yyyy-MM-dd");
  const end = format(endOfMonth(now), "yyyy-MM-dd");

  const [events, departments] = await Promise.all([
    getCalendarEvents(start, end, "vacations"),
    profile.role === "admin" ? getDepartments() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vacation Calendar"
        description="View team vacation schedules at a glance"
      />
      <CalendarView
        initialEvents={events}
        eventType="vacations"
        departments={departments}
        showDepartmentFilter={profile.role === "admin"}
      />
    </div>
  );
}
