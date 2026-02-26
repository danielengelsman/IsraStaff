import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { VacationBalanceCards } from "@/components/dashboard/vacation-balance-cards";
import { UpcomingVacations } from "@/components/dashboard/upcoming-vacations";
import { ActiveTrips } from "@/components/dashboard/active-trips";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { OfficeToday } from "@/components/dashboard/office-today";
import { Plus, Plane, Users, Building2, CalendarDays } from "lucide-react";
import type { Profile, VacationAllowance, VacationRequest, BusinessTrip } from "@/types/database";
import type { VacationRequestWithProfile, OfficePresence } from "@/types";

type AdminDashboardProps = {
  profile: Profile;
  allowance: VacationAllowance | null;
  upcomingVacations: VacationRequest[];
  activeTrips: BusinessTrip[];
  canAccessTravel: boolean;
  pendingRequests: VacationRequestWithProfile[];
  officePresence: OfficePresence[];
};

export function AdminDashboard({
  profile,
  allowance,
  upcomingVacations,
  activeTrips,
  canAccessTravel,
  pendingRequests,
  officePresence,
}: AdminDashboardProps) {
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

      {/* Admin Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Link href="/admin/departments">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/employees">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Who's in the Office Today */}
      <OfficeToday presence={officePresence} />

      {/* Main Content Grid */}
      <div className={`grid gap-6 ${canAccessTravel ? "lg:grid-cols-2" : ""}`}>
        <UpcomingVacations vacations={upcomingVacations} />
        {canAccessTravel && <ActiveTrips trips={activeTrips} />}
      </div>

      {/* Pending Approvals */}
      {pendingRequests.length > 0 && (
        <PendingApprovals requests={pendingRequests} />
      )}
    </div>
  );
}
