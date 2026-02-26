import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { VacationBalanceCards } from "@/components/dashboard/vacation-balance-cards";
import { UpcomingVacations } from "@/components/dashboard/upcoming-vacations";
import { ActiveTrips } from "@/components/dashboard/active-trips";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { TeamOverview } from "@/components/dashboard/team-overview";
import { Plus, Plane } from "lucide-react";
import type { Profile, VacationAllowance, VacationRequest, BusinessTrip } from "@/types/database";
import type { TeamMemberWithStatus, VacationRequestWithProfile } from "@/types";

type ManagerDashboardProps = {
  profile: Profile;
  allowance: VacationAllowance | null;
  upcomingVacations: VacationRequest[];
  activeTrips: BusinessTrip[];
  canAccessTravel: boolean;
  departmentName: string;
  teamMembers: TeamMemberWithStatus[];
  pendingRequests: VacationRequestWithProfile[];
};

export function ManagerDashboard({
  profile,
  allowance,
  upcomingVacations,
  activeTrips,
  canAccessTravel,
  departmentName,
  teamMembers,
  pendingRequests,
}: ManagerDashboardProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${profile.full_name.split(" ")[0]}`}
        description="Here's your team overview and personal time off"
      >
        <Link href="/vacations">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Request Time Off
          </Button>
        </Link>
        {canAccessTravel && (
          <Link href="/travel">
            <Button size="sm" variant="outline">
              <Plane className="mr-1 h-4 w-4" />
              New Trip
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Own Vacation Balance */}
      <VacationBalanceCards allowance={allowance} />

      {/* Team Overview */}
      <TeamOverview departmentName={departmentName} members={teamMembers} />

      {/* Pending Approvals */}
      {pendingRequests.length > 0 && (
        <PendingApprovals requests={pendingRequests} />
      )}

      {/* Own Upcoming Vacations + Active Trips */}
      <div className={`grid gap-6 ${canAccessTravel ? "lg:grid-cols-2" : ""}`}>
        <UpcomingVacations vacations={upcomingVacations} />
        {canAccessTravel && <ActiveTrips trips={activeTrips} />}
      </div>
    </div>
  );
}
