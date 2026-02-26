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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createEmployee, updateEmployee } from "@/lib/actions/employees";
import { upsertAllowance, initializeYearAllowances } from "@/lib/actions/allowances";
import { toast } from "sonner";
import { Search, Plus, Save, Wand2 } from "lucide-react";
import type { ProfileWithDepartment } from "@/types";
import type { Department, VacationAllowance } from "@/types/database";

type EmployeesManagerProps = {
  employees: ProfileWithDepartment[];
  departments: Department[];
  allowances: Record<string, VacationAllowance>;
  currentYear: number;
};

export function EmployeesManager({ employees, departments, allowances, currentYear }: EmployeesManagerProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [initOpen, setInitOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedAllowances, setEditedAllowances] = useState<Record<string, number>>({});
  const router = useRouter();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const roleVal = form.get("role") as string;
    const deptVal = form.get("department_id") as string;
    const travelVal = form.get("can_access_travel") === "on";

    const result = await createEmployee({
      full_name: form.get("full_name") as string,
      email: form.get("email") as string,
      password: form.get("password") as string,
      role: (roleVal && roleVal !== "employee" ? roleVal : undefined) as
        | "employee"
        | "manager"
        | "admin"
        | undefined,
      department_id: deptVal && deptVal !== "none" ? deptVal : undefined,
      can_access_travel: travelVal || undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Employee created");
      setCreateOpen(false);
      router.refresh();
    }
  }

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleRoleChange(profileId: string, role: "employee" | "manager" | "admin") {
    const result = await updateEmployee(profileId, { role });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Role updated");
      router.refresh();
    }
  }

  async function handleDepartmentChange(profileId: string, departmentId: string) {
    const result = await updateEmployee(profileId, {
      department_id: departmentId === "none" ? null : departmentId,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Department updated");
      router.refresh();
    }
  }

  async function handleTravelAccessChange(profileId: string, canAccessTravel: boolean) {
    const result = await updateEmployee(profileId, { can_access_travel: canAccessTravel });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(canAccessTravel ? "Travel access granted" : "Travel access revoked");
      router.refresh();
    }
  }

  function handleAllowanceEdit(profileId: string, value: number) {
    setEditedAllowances((prev) => ({ ...prev, [profileId]: value }));
  }

  async function handleAllowanceSave(profileId: string) {
    const totalDays = editedAllowances[profileId];
    if (totalDays === undefined) return;

    const result = await upsertAllowance({
      profile_id: profileId,
      year: currentYear,
      total_days: totalDays,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Allowance updated");
      setEditedAllowances((prev) => {
        const next = { ...prev };
        delete next[profileId];
        return next;
      });
      router.refresh();
    }
  }

  async function handleInitialize(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await initializeYearAllowances(currentYear, {
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

  const roleColors: Record<string, string> = {
    employee: "bg-gray-100 text-gray-700",
    manager: "bg-blue-100 text-blue-700",
    admin: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={initOpen} onOpenChange={setInitOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Wand2 className="mr-1 h-4 w-4" />
                Initialize {currentYear} Allowances
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Initialize {currentYear} Allowances</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInitialize} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create default vacation allowances for employees who don&apos;t have one yet for {currentYear}.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="default_vacation">Default Vacation Days</Label>
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
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="john@company.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password</Label>
                  <Input id="password" name="password" type="text" placeholder="Min 6 characters" minLength={6} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue="employee">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department</Label>
                    <Select name="department_id" defaultValue="none">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="can_access_travel" name="can_access_travel" />
                  <Label htmlFor="can_access_travel">Travel access</Label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Employee"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Vacation Days</TableHead>
              <TableHead className="text-center">Used</TableHead>
              <TableHead>Travel</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((emp) => {
              const allowance = allowances[emp.id];
              const hasEdit = editedAllowances[emp.id] !== undefined;
              return (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.full_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{emp.email}</TableCell>
                  <TableCell>
                    <Select
                      value={emp.role}
                      onValueChange={(v) => handleRoleChange(emp.id, v as "employee" | "manager" | "admin")}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue>
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${roleColors[emp.role]}`}>
                            {emp.role}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={emp.department_id ?? "none"}
                      onValueChange={(v) => handleDepartmentChange(emp.id, v)}
                    >
                      <SelectTrigger className="w-[180px] h-8">
                        <SelectValue>
                          {emp.departments?.name || "Unassigned"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      step="0.5"
                      className="mx-auto h-8 w-16 text-center"
                      defaultValue={allowance?.total_days ?? ""}
                      placeholder="-"
                      onChange={(e) => handleAllowanceEdit(emp.id, Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {allowance ? allowance.used_days : "-"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={emp.role === "admin" || emp.can_access_travel}
                      disabled={emp.role === "admin"}
                      onCheckedChange={(checked) => handleTravelAccessChange(emp.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {hasEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleAllowanceSave(emp.id)}
                      >
                        <Save className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
