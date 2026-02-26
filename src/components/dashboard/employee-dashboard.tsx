import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { VacationBalanceCards } from "@/components/dashboard/vacation-balance-cards";
import { UpcomingVacations } from "@/components/dashboard/upcoming-vacations";
import { ActiveTrips } from "@/components/dashboard/active-trips";
import { OfficeToday } from "@/components/dashboard/office-today";
import { Plus, Plane } from "lucide-react";
import type { Profile, VacationAllowance, VacationRequest, BusinessTrip } from "@/types/database";
import type { OfficePresence } from "@/types";

type EmployeeDashboardProps = {
  profile: Profile;
  allowance: VacationAllowance | null;
  upcomingVacations: VacationRequest[];
  activeTrips: BusinessTrip[];
  canAccessTravel: boolean;
  officePresence: OfficePresence[];
};

export function EmployeeDashboard({
  profile,
  allowance,
  upcomingVacations,
  activeTrips,
  canAccessTravel,
  officePresence,
}: EmployeeDashboardProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${profile.full_name.split(" ")[0]}`}
        description="Here's an overview of your time off and travel"
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

      {/* Vacation Balance */}
      <VacationBalanceCards allowance={allowance} />

      {/* Who's in the Office Today */}
      <OfficeToday presence={officePresence} />

      {/* Upcoming Vacations + Active Trips */}
      <div className={`grid gap-6 ${canAccessTravel ? "lg:grid-cols-2" : ""}`}>
        <UpcomingVacations vacations={upcomingVacations} />
        {canAccessTravel && <ActiveTrips trips={activeTrips} />}
      </div>
    </div>
  );
}
