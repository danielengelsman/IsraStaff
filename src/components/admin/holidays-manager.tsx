"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createHoliday, updateHoliday, deleteHoliday } from "@/lib/actions/holidays";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Holiday } from "@/types/database";

type HolidaysManagerProps = {
  holidays: Holiday[];
};

export function HolidaysManager({ holidays }: HolidaysManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const router = useRouter();

  // Get unique years from holidays for the filter
  const years = useMemo(() => {
    const yearSet = new Set(holidays.map((h) => h.date.split("-")[0]));
    const currentYear = new Date().getFullYear().toString();
    yearSet.add(currentYear);
    return Array.from(yearSet).sort().reverse();
  }, [holidays]);

  const filtered = useMemo(() => {
    if (yearFilter === "all") return holidays;
    return holidays.filter((h) => h.date.startsWith(yearFilter));
  }, [holidays, yearFilter]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await createHoliday({
      name: form.get("name") as string,
      date: form.get("date") as string,
      country: (form.get("country") as string) || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Holiday added");
      setCreateOpen(false);
      router.refresh();
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await updateHoliday(id, {
      name: form.get("name") as string,
      date: form.get("date") as string,
      country: (form.get("country") as string) || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Holiday updated");
      setEditId(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this holiday?")) return;
    const result = await deleteHoliday(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Holiday deleted");
      router.refresh();
    }
  }

  function HolidayForm({
    onSubmit,
    defaultValues,
  }: {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    defaultValues?: { name: string; date: string; country: string };
  }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Holiday Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Independence Day"
            defaultValue={defaultValues?.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultValues?.date}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            placeholder="IL"
            defaultValue={defaultValues?.country ?? "IL"}
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Holiday</DialogTitle>
            </DialogHeader>
            <HolidayForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No holidays found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell className="text-sm">
                    {format(parseISO(holiday.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {holiday.country}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog
                        open={editId === holiday.id}
                        onOpenChange={(open) => setEditId(open ? holiday.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Holiday</DialogTitle>
                          </DialogHeader>
                          <HolidayForm
                            onSubmit={(e) => handleUpdate(e, holiday.id)}
                            defaultValues={{
                              name: holiday.name,
                              date: holiday.date,
                              country: holiday.country,
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600"
                        onClick={() => handleDelete(holiday.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
