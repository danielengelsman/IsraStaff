"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createDepartment, updateDepartment, deleteDepartment } from "@/lib/actions/departments";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { DepartmentWithManager } from "@/types";
import type { Profile } from "@/types/database";

type DepartmentsManagerProps = {
  departments: DepartmentWithManager[];
  managers: Pick<Profile, "id" | "full_name" | "email">[];
};

export function DepartmentsManager({ departments, managers }: DepartmentsManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const managerId = form.get("manager_id") as string;
    const result = await createDepartment({
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      manager_id: managerId && managerId !== "none" ? managerId : undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Department created");
      setCreateOpen(false);
      router.refresh();
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const managerId = form.get("manager_id") as string;
    const result = await updateDepartment(id, {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      manager_id: managerId && managerId !== "none" ? managerId : null,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Department updated");
      setEditId(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this department? Members will be unassigned.")) return;
    const result = await deleteDepartment(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Department deleted");
      router.refresh();
    }
  }

  function DepartmentForm({
    onSubmit,
    defaultValues,
  }: {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    defaultValues?: { name: string; description: string | null; manager_id: string | null };
  }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={defaultValues?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={defaultValues?.description ?? ""} rows={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manager_id">Manager</Label>
          <Select name="manager_id" defaultValue={defaultValues?.manager_id ?? "none"}>
            <SelectTrigger>
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No manager</SelectItem>
              {managers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Department</DialogTitle>
            </DialogHeader>
            <DepartmentForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No departments. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {dept.description || "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {dept.manager?.full_name || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog
                        open={editId === dept.id}
                        onOpenChange={(open) => setEditId(open ? dept.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Department</DialogTitle>
                          </DialogHeader>
                          <DepartmentForm
                            onSubmit={(e) => handleUpdate(e, dept.id)}
                            defaultValues={{
                              name: dept.name,
                              description: dept.description,
                              manager_id: dept.manager_id,
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600"
                        onClick={() => handleDelete(dept.id)}
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
