import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateRange } from "@/lib/utils/dates";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import type { BusinessTripWithDetails } from "@/types";

type TripsListProps = {
  trips: BusinessTripWithDetails[];
};

export function TripsList({ trips }: TripsListProps) {
  if (trips.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No business trips found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => {
        const totalExpenses = trip.trip_expenses?.reduce(
          (sum, e) => sum + Number(e.amount),
          0
        ) ?? 0;

        return (
          <Link key={trip.id} href={`/travel/${trip.id}`}>
            <Card className="transition-all hover:shadow-md hover:border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    {trip.destination}
                  </CardTitle>
                  <StatusBadge status={trip.status} type="trip" />
                </div>
                <p className="text-sm text-muted-foreground">{trip.country}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {trip.purpose}
                </p>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {trip.profiles.full_name}
                  </div>
                  {(totalExpenses > 0 || trip.total_budget) && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      {totalExpenses.toLocaleString()} {trip.currency}
                      {trip.total_budget && (
                        <span> / {Number(trip.total_budget).toLocaleString()} budget</span>
                      )}
                    </div>
                  )}
                </div>
                {trip.trip_events && trip.trip_events.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {trip.trip_events.length} event{trip.trip_events.length !== 1 ? "s" : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
