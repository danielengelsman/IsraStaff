import { getDepartments } from "@/lib/queries/departments";
import { getAllProfiles } from "@/lib/queries/profiles";
import { PageHeader } from "@/components/shared/page-header";
import { DepartmentsManager } from "@/components/admin/departments-manager";

export default async function DepartmentsPage() {
  const [departments, profiles] = await Promise.all([
    getDepartments(),
    getAllProfiles(),
  ]);

  const managerCandidates = profiles
    .filter((p) => p.role === "manager" || p.role === "admin")
    .map((p) => ({ id: p.id, full_name: p.full_name, email: p.email }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Create and manage company departments"
      />
      <DepartmentsManager departments={departments} managers={managerCandidates} />
    </div>
  );
}
