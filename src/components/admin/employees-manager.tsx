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
import { Badge } from "@/components/ui/badge";
import { updateEmployee } from "@/lib/actions/employees";
import { toast } from "sonner";
import { Search } from "lucide-react";
import type { ProfileWithDepartment } from "@/types";
import type { Department } from "@/types/database";

type EmployeesManagerProps = {
  employees: ProfileWithDepartment[];
  departments: Department[];
};

export function EmployeesManager({ employees, departments }: EmployeesManagerProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

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

  const roleColors: Record<string, string> = {
    employee: "bg-gray-100 text-gray-700",
    manager: "bg-blue-100 text-blue-700",
    admin: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">{emp.full_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{emp.email}</TableCell>
                <TableCell>
                  <Select
                    value={emp.role}
                    onValueChange={(v) => handleRoleChange(emp.id, v as "employee" | "manager" | "admin")}
                  >
                    <SelectTrigger className="w-[130px] h-8">
                      <Badge variant="secondary" className={`${roleColors[emp.role]} text-xs`}>
                        {emp.role}
                      </Badge>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
