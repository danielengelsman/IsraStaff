"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createVacationRequest } from "@/lib/actions/vacations";
import { calculateBusinessDays } from "@/lib/utils/dates";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { VacationAllowance } from "@/types/database";

type VacationRequestFormProps = {
  allowance: VacationAllowance | null;
};

export function VacationRequestForm({ allowance }: VacationRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const router = useRouter();

  const businessDays =
    startDate && endDate
      ? calculateBusinessDays(new Date(startDate), new Date(endDate))
      : 0;

  const remaining = allowance
    ? allowance.total_days - allowance.used_days
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await createVacationRequest({
      start_date: startDate,
      end_date: endDate,
      type: "vacation" as const,
      notes: notes || undefined,
    });

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Vacation request submitted");
    setOpen(false);
    setStartDate("");
    setEndDate("");
    setNotes("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Request Time Off
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogDescription>
            Submit a new vacation day request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          </div>

          {businessDays > 0 && (
            <div className="rounded-md border p-3 text-sm">
              <p>
                <span className="font-medium">{businessDays}</span> business day
                {businessDays !== 1 ? "s" : ""}
              </p>
              {allowance && (
                <p className="text-muted-foreground">
                  {remaining} vacation days remaining
                  {businessDays > remaining && (
                    <span className="ml-1 text-red-600">(exceeds balance!)</span>
                  )}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || businessDays === 0}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
