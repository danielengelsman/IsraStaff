import { getAllProfiles } from "@/lib/queries/profiles";
import { getDepartments } from "@/lib/queries/departments";
import { PageHeader } from "@/components/shared/page-header";
import { EmployeesManager } from "@/components/admin/employees-manager";

export default async function EmployeesPage() {
  const [employees, departments] = await Promise.all([
    getAllProfiles(),
    getDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage employee roles and department assignments"
      />
      <EmployeesManager employees={employees} departments={departments} />
    </div>
  );
}
