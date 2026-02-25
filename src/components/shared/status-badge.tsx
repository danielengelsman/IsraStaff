import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUSES, TRIP_STATUSES } from "@/lib/utils/constants";

type StatusBadgeProps = {
  status: string;
  type?: "request" | "trip";
};

export function StatusBadge({ status, type = "request" }: StatusBadgeProps) {
  const statuses = type === "trip" ? TRIP_STATUSES : REQUEST_STATUSES;
  const config = statuses[status as keyof typeof statuses];

  if (!config) {
    return <Badge variant="secondary">{status}</Badge>;
  }

  return (
    <Badge variant="outline" className={`${config.textColor} border-current`}>
      {config.label}
    </Badge>
  );
}
