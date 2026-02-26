import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { formatDateRange } from "@/lib/utils/dates";
import type { TeamMemberWithStatus } from "@/types";

type TeamOverviewProps = {
  departmentName: string;
  members: TeamMemberWithStatus[];
};

export function TeamOverview({ departmentName, members }: TeamOverviewProps) {
  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            My Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No team assigned. Contact your admin to be assigned as a department manager.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          {departmentName}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            ({members.length} {members.length === 1 ? "member" : "members"})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => {
            const isOnVacation = !!member.current_vacation;
            const allowance = member.vacation_allowance;
            const remaining = allowance ? allowance.total_days - allowance.used_days : 0;
            const total = allowance?.total_days ?? 0;
            const percentage = total > 0 ? (allowance!.used_days / total) * 100 : 0;
            const nextVacation = member.upcoming_vacations[0];

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                {/* Avatar with initials */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {member.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>

                {/* Name + Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                    {isOnVacation ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        On Vacation
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Available
                      </span>
                    )}
                  </div>
                  {isOnVacation && member.current_vacation && (
                    <p className="text-[10px] text-muted-foreground">
                      {formatDateRange(member.current_vacation.start_date, member.current_vacation.end_date)}
                    </p>
                  )}
                  {!isOnVacation && nextVacation && (
                    <p className="text-[10px] text-muted-foreground">
                      Next: {formatDateRange(nextVacation.start_date, nextVacation.end_date)}
                    </p>
                  )}
                </div>

                {/* Vacation balance */}
                {allowance && (
                  <div className="shrink-0 w-24 text-right">
                    <p className="text-xs font-medium">{remaining}/{total}</p>
                    <p className="text-[10px] text-muted-foreground">days left</p>
                    <Progress value={percentage} className="mt-1 h-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
