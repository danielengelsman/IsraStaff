import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getRotaWeek, getRotaDefaults } from "@/lib/queries/rota";
import { getDepartments } from "@/lib/queries/departments";
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

  // Determine the current week's Sunday
  const today = new Date();
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());
  const weekStart = params.week ?? currentSunday.toISOString().split("T")[0];

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
