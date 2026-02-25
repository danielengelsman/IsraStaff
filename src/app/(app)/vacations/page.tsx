import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getVacationBalance, getVacationRequests } from "@/lib/queries/vacations";
import { PageHeader } from "@/components/shared/page-header";
import { VacationBalanceCards } from "@/components/dashboard/vacation-balance-cards";
import { VacationRequestForm } from "@/components/vacations/vacation-request-form";
import { VacationRequestsTable } from "@/components/vacations/vacation-requests-table";
import type { UserRole } from "@/types";

export default async function VacationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const role = profile.role as UserRole;

  const [allowance, requests] = await Promise.all([
    getVacationBalance(profile.id),
    getVacationRequests(
      role === "employee" ? { profileId: profile.id } : undefined
    ),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vacation Management"
        description="Request time off and manage your vacation days"
      >
        <VacationRequestForm allowance={allowance} />
      </PageHeader>

      <VacationBalanceCards allowance={allowance} />

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {role === "employee" ? "My Requests" : "All Requests"}
        </h2>
        <VacationRequestsTable
          requests={requests}
          currentUserId={profile.id}
          userRole={role}
        />
      </div>
    </div>
  );
}
