import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane } from "lucide-react";
import { formatDateRange } from "@/lib/utils/dates";
import { StatusBadge } from "@/components/shared/status-badge";
import type { BusinessTrip } from "@/types/database";

type ActiveTripsProps = {
  trips: BusinessTrip[];
};

export function ActiveTrips({ trips }: ActiveTripsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plane className="h-4 w-4" />
          Active Business Trips
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active business trips.</p>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {trip.destination}, {trip.country}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </p>
                </div>
                <StatusBadge status={trip.status} type="trip" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
