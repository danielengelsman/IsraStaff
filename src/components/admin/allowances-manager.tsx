"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { upsertAllowance, initializeYearAllowances } from "@/lib/actions/allowances";
import { toast } from "sonner";
import { Save, Wand2 } from "lucide-react";

type AllowanceRow = {
  id: string;
  profile_id: string;
  year: number;
  total_days: number;
  used_days: number;
  profiles: {
    full_name: string;
    email: string;
    department_id: string | null;
    departments: { name: string } | null;
  };
};

type AllowancesManagerProps = {
  allowances: AllowanceRow[];
  initialYear: number;
};

export function AllowancesManager({ allowances, initialYear }: AllowancesManagerProps) {
  const [year, setYear] = useState(initialYear);
  const [initOpen, setInitOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedRows, setEditedRows] = useState<Record<string, {
    total_days: number;
  }>>({});
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  function handleEdit(id: string, field: string, value: number) {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  }

  async function handleSave(allowance: AllowanceRow) {
    const edits = editedRows[allowance.id];
    if (!edits) return;

    setLoading(true);
    const result = await upsertAllowance({
      profile_id: allowance.profile_id,
      year: allowance.year,
      total_days: edits.total_days ?? allowance.total_days,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Allowance updated");
      setEditedRows((prev) => {
        const next = { ...prev };
        delete next[allowance.id];
        return next;
      });
      router.refresh();
    }
  }

  async function handleInitialize(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await initializeYearAllowances(year, {
      total_days: Number(form.get("default_vacation")),
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || `Initialized ${result.count} employee(s)`);
      setInitOpen(false);
      router.refresh();
    }
  }

  function handleYearChange(newYear: string) {
    setYear(Number(newYear));
    // Navigate to refresh data for new year
    router.push(`/admin/allowances?year=${newYear}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={String(year)} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={initOpen} onOpenChange={setInitOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Wand2 className="mr-1 h-4 w-4" />
              Initialize Year
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initialize {year} Allowances</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInitialize} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create default allowances for employees who don&apos;t have one yet for {year}.
              </p>
              <div className="space-y-2">
                <Label htmlFor="default_vacation">Vacation Days</Label>
                <Input id="default_vacation" name="default_vacation" type="number" defaultValue={12} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Initializing..." : "Initialize"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Vacation Days</TableHead>
              <TableHead className="text-center">Used</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {allowances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No allowances for {year}. Click &quot;Initialize Year&quot; to create them.
                </TableCell>
              </TableRow>
            ) : (
              allowances.map((a) => {
                const edits = editedRows[a.id];
                const hasEdits = !!edits;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.profiles.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.profiles.departments?.name || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        step="0.5"
                        className="mx-auto h-8 w-16 text-center"
                        defaultValue={a.total_days}
                        onChange={(e) => handleEdit(a.id, "total_days", Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {a.used_days}
                    </TableCell>
                    <TableCell>
                      {hasEdits && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleSave(a)}
                          disabled={loading}
                        >
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                      )}
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
