import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getTeamMembersWithStatus } from "@/lib/queries/profiles";
import { getVacationBalance, getUpcomingVacations, getVacationRequests } from "@/lib/queries/vacations";
import { getActiveTrips } from "@/lib/queries/travel";
import { getManagedDepartment } from "@/lib/queries/departments";
import { getOfficePresenceToday } from "@/lib/queries/rota";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { ManagerDashboard } from "@/components/dashboard/manager-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const canAccessTravel = profile.role === "admin" || profile.can_access_travel;

  // Data common to all roles: own balance, own upcoming vacations, own active trips, office presence
  const [allowance, upcoming, activeTrips, officePresence] = await Promise.all([
    getVacationBalance(profile.id),
    getUpcomingVacations(profile.id),
    canAccessTravel ? getActiveTrips(profile.id) : Promise.resolve([]),
    getOfficePresenceToday(),
  ]);

  // --- Employee ---
  if (profile.role === "employee") {
    return (
      <EmployeeDashboard
        profile={profile}
        allowance={allowance}
        upcomingVacations={upcoming}
        activeTrips={activeTrips}
        canAccessTravel={canAccessTravel}
        officePresence={officePresence}
      />
    );
  }

  // --- Manager ---
  if (profile.role === "manager") {
    const managedDept = await getManagedDepartment(profile.id);

    const [teamMembers, pendingRequests] = await Promise.all([
      managedDept ? getTeamMembersWithStatus(managedDept.id) : Promise.resolve([]),
      getVacationRequests({ status: "pending" }),
    ]);

    return (
      <ManagerDashboard
        profile={profile}
        allowance={allowance}
        upcomingVacations={upcoming}
        activeTrips={activeTrips}
        canAccessTravel={canAccessTravel}
        departmentName={managedDept?.name ?? "Your Team"}
        teamMembers={teamMembers}
        pendingRequests={pendingRequests}
        officePresence={officePresence}
      />
    );
  }

  // --- Admin ---
  const pendingRequests = await getVacationRequests({ status: "pending" });

  return (
    <AdminDashboard
      profile={profile}
      allowance={allowance}
      upcomingVacations={upcoming}
      activeTrips={activeTrips}
      canAccessTravel={canAccessTravel}
      pendingRequests={pendingRequests}
      officePresence={officePresence}
    />
  );
}
