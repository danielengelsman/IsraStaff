import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getAllTrips } from "@/lib/queries/travel";
import { PageHeader } from "@/components/shared/page-header";
import { TripCreateDialog } from "@/components/travel/trip-create-dialog";
import { TripsList } from "@/components/travel/trips-list";

export default async function TravelPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin" && !profile.can_access_travel) redirect("/dashboard");

  const trips = await getAllTrips();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Travel"
        description="Manage overseas business trips, itineraries, and expenses"
      >
        <TripCreateDialog />
      </PageHeader>
      <TripsList trips={trips} />
    </div>
  );
}
