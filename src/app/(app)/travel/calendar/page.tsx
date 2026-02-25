import { format, startOfMonth, endOfMonth } from "date-fns";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getCalendarEvents } from "@/lib/queries/calendar";
import { getDepartments } from "@/lib/queries/departments";
import { CalendarView } from "@/components/calendar/calendar-view";
import { PageHeader } from "@/components/shared/page-header";

export default async function TravelCalendarPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin" && !profile.can_access_travel) redirect("/dashboard");

  const now = new Date();
  const start = format(startOfMonth(now), "yyyy-MM-dd");
  const end = format(endOfMonth(now), "yyyy-MM-dd");

  const [events, departments] = await Promise.all([
    getCalendarEvents(start, end, "travel"),
    profile.role === "admin" ? getDepartments() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Travel Calendar"
        description="View upcoming business trips across the organization"
      />
      <CalendarView
        events={events}
        departments={departments}
        showDepartmentFilter={profile.role === "admin"}
      />
    </div>
  );
}
