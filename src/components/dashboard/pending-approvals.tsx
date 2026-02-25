"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, X } from "lucide-react";
import { formatDateRange } from "@/lib/utils/dates";
import { VACATION_TYPES } from "@/lib/utils/constants";
import { reviewVacationRequest } from "@/lib/actions/vacations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { VacationRequestWithProfile } from "@/types";

type PendingApprovalsProps = {
  requests: VacationRequestWithProfile[];
};

export function PendingApprovals({ requests }: PendingApprovalsProps) {
  const router = useRouter();

  async function handleReview(requestId: string, status: "approved" | "rejected") {
    const result = await reviewVacationRequest(requestId, { status });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Request ${status}`);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Pending Approvals
          {requests.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {requests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const typeConfig = VACATION_TYPES[req.type];
              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{req.profiles.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateRange(req.start_date, req.end_date)} ({req.total_days}d)
                    </p>
                    <Badge variant="outline" className={`text-[10px] ${typeConfig.textColor}`}>
                      {typeConfig.label}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleReview(req.id, "approved")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleReview(req.id, "rejected")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
