import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { VacationBalanceCards } from "@/components/dashboard/vacation-balance-cards";
import { UpcomingVacations } from "@/components/dashboard/upcoming-vacations";
import { ActiveTrips } from "@/components/dashboard/active-trips";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getVacationBalance, getUpcomingVacations, getVacationRequests } from "@/lib/queries/vacations";
import { getActiveTrips } from "@/lib/queries/travel";
import { Plus, Plane, Users, Building2, CalendarDays } from "lucide-react";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [allowance, upcoming, activeTrips] = await Promise.all([
    getVacationBalance(profile.id),
    getUpcomingVacations(profile.id),
    getActiveTrips(profile.id),
  ]);

  const isManagerOrAdmin = profile.role === "manager" || profile.role === "admin";

  let pendingRequests: Awaited<ReturnType<typeof getVacationRequests>> = [];
  if (isManagerOrAdmin) {
    pendingRequests = await getVacationRequests({ status: "pending" });
  }

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
        <Link href="/travel">
          <Button size="sm" variant="outline">
            <Plane className="mr-1 h-4 w-4" />
            New Trip
          </Button>
        </Link>
      </PageHeader>

      {/* Vacation Balance */}
      <VacationBalanceCards allowance={allowance} />

      {/* Quick Stats for Admin */}
      {profile.role === "admin" && (
        <div className="grid gap-4 sm:grid-cols-4">
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
          <Link href="/admin/allowances">
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Allowances</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Configure</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingVacations vacations={upcoming} />
        <ActiveTrips trips={activeTrips} />
      </div>

      {/* Pending Approvals for Manager/Admin */}
      {isManagerOrAdmin && pendingRequests.length > 0 && (
        <PendingApprovals requests={pendingRequests} />
      )}
    </div>
  );
}
