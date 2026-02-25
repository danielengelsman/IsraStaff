import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Palmtree, Thermometer, User } from "lucide-react";
import type { VacationAllowance } from "@/types/database";

type VacationBalanceCardsProps = {
  allowance: VacationAllowance | null;
};

export function VacationBalanceCards({ allowance }: VacationBalanceCardsProps) {
  if (!allowance) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No vacation allowance set for this year. Contact your admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories = [
    {
      label: "Vacation Days",
      total: allowance.total_days,
      used: allowance.used_days,
      icon: Palmtree,
      color: "text-blue-600",
      progressColor: "bg-blue-600",
    },
    {
      label: "Sick Days",
      total: allowance.sick_days,
      used: allowance.used_sick,
      icon: Thermometer,
      color: "text-red-600",
      progressColor: "bg-red-600",
    },
    {
      label: "Personal Days",
      total: allowance.personal_days,
      used: allowance.used_personal,
      icon: User,
      color: "text-green-600",
      progressColor: "bg-green-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {categories.map((cat) => {
        const remaining = cat.total - cat.used;
        const percentage = cat.total > 0 ? (cat.used / cat.total) * 100 : 0;

        return (
          <Card key={cat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {cat.label}
              </CardTitle>
              <cat.icon className={`h-4 w-4 ${cat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{remaining}</div>
              <p className="text-xs text-muted-foreground">
                of {cat.total} remaining ({cat.used} used)
              </p>
              <Progress value={percentage} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
