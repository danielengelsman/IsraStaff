import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { formatDateRange } from "@/lib/utils/dates";
import { VACATION_TYPES } from "@/lib/utils/constants";
import type { VacationRequest } from "@/types/database";

type UpcomingVacationsProps = {
  vacations: VacationRequest[];
};

export function UpcomingVacations({ vacations }: UpcomingVacationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4" />
          Upcoming Time Off
        </CardTitle>
      </CardHeader>
      <CardContent>
        {vacations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming time off scheduled.</p>
        ) : (
          <div className="space-y-3">
            {vacations.map((v) => {
              const typeConfig = VACATION_TYPES[v.type];
              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatDateRange(v.start_date, v.end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {v.total_days} day{v.total_days !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={typeConfig.textColor}>
                    {typeConfig.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
