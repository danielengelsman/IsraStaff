import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { getTripById } from "@/lib/queries/travel";
import { TripDetailClient } from "@/components/travel/trip-detail-client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { UserRole } from "@/types";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin" && !profile.can_access_travel) redirect("/dashboard");

  const trip = await getTripById(id);
  if (!trip) notFound();

  return (
    <div className="space-y-4">
      <Link href="/travel">
        <Button variant="ghost" size="sm">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Trips
        </Button>
      </Link>
      <TripDetailClient
        trip={trip}
        userRole={profile.role as UserRole}
        currentUserId={profile.id}
      />
    </div>
  );
}
