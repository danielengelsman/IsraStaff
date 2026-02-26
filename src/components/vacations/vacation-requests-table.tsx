"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateRange } from "@/lib/utils/dates";
import { VACATION_TYPES } from "@/lib/utils/constants";
import { reviewVacationRequest, cancelVacationRequest } from "@/lib/actions/vacations";
import { toast } from "sonner";
import { Check, X, Ban } from "lucide-react";
import type { VacationRequestWithProfile } from "@/types";
import type { UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";

type VacationRequestsTableProps = {
  requests: VacationRequestWithProfile[];
  currentUserId: string;
  userRole: UserRole;
};

export function VacationRequestsTable({
  requests,
  currentUserId,
  userRole,
}: VacationRequestsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const canReview = userRole === "manager" || userRole === "admin";

  async function handleApprove(id: string) {
    const result = await reviewVacationRequest(id, { status: "approved" });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Request approved");
      router.refresh();
    }
  }

  async function handleReject(id: string) {
    const result = await reviewVacationRequest(id, { status: "rejected" });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Request rejected");
      router.refresh();
    }
  }

  async function handleCancel(id: string) {
    const result = await cancelVacationRequest(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Request cancelled");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {canReview && <TableHead>Employee</TableHead>}
              <TableHead>Dates</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canReview ? 7 : 6} className="text-center text-muted-foreground py-8">
                  No requests found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req) => {
                const typeConfig = VACATION_TYPES[req.type];
                const isOwn = req.profile_id === currentUserId;
                return (
                  <TableRow key={req.id}>
                    {canReview && (
                      <TableCell className="font-medium">
                        {req.profiles.full_name}
                      </TableCell>
                    )}
                    <TableCell>
                      {formatDateRange(req.start_date, req.end_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeConfig.textColor}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{req.total_days}</TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                      {req.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canReview && req.status === "pending" && !isOwn && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-green-600"
                              onClick={() => handleApprove(req.id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-600"
                              onClick={() => handleReject(req.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {isOwn && (req.status === "pending" || req.status === "approved") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            onClick={() => handleCancel(req.id)}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
