import { getAllProfiles } from "@/lib/queries/profiles";
import { getDepartments } from "@/lib/queries/departments";
import { getEmployeeAllowances } from "@/lib/queries/allowances";
import { PageHeader } from "@/components/shared/page-header";
import { EmployeesManager } from "@/components/admin/employees-manager";

export default async function EmployeesPage() {
  const currentYear = new Date().getFullYear();
  const [employees, departments, allowances] = await Promise.all([
    getAllProfiles(),
    getDepartments(),
    getEmployeeAllowances(currentYear),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage employee roles, departments, and vacation allowances"
      />
      <EmployeesManager
        employees={employees}
        departments={departments}
        allowances={allowances}
        currentYear={currentYear}
      />
    </div>
  );
}
