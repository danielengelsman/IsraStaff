import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getRotaWeek, getRotaDefaults } from "@/lib/queries/rota";
import { getDepartments } from "@/lib/queries/departments";
import { formatDateLocal, getIsraelToday } from "@/lib/date-utils";
import { PageHeader } from "@/components/shared/page-header";
import { RotaWeekGrid } from "@/components/rota/rota-week-grid";
import type { UserRole } from "@/types";

export default async function RotaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; department?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const params = await searchParams;
  const role = profile.role as UserRole;
  const canEdit = role === "manager" || role === "admin";

  // Determine the current week's Sunday (using Israel timezone for correct day)
  const { dateStr: todayStr, dayOfWeek: todayDow } = getIsraelToday();
  const todayDate = new Date(todayStr + "T12:00:00");
  todayDate.setDate(todayDate.getDate() - todayDow);
  const weekStart = params.week ?? formatDateLocal(todayDate);

  const departmentFilter = params.department ?? undefined;

  const [weekData, departments, allDefaults] = await Promise.all([
    getRotaWeek(weekStart, departmentFilter),
    getDepartments(),
    canEdit ? getRotaDefaults() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Office Rota"
        description="See who's working from the office or home each day"
      />
      <RotaWeekGrid
        entries={weekData}
        weekStart={weekStart}
        departments={departments}
        selectedDepartment={departmentFilter}
        canEdit={canEdit}
        allDefaults={allDefaults}
      />
    </div>
  );
}
