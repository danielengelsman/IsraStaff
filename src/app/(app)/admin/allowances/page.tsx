import { PageHeader } from "@/components/shared/page-header";
import { AllowancesManager } from "@/components/admin/allowances-manager";
import { getAllowancesForYear } from "@/lib/queries/allowances";

export default async function AllowancesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  const allowances = await getAllowancesForYear(year);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vacation Allowances"
        description="Set and manage employee vacation day quotas per year"
      />
      <AllowancesManager
        allowances={allowances as never[]}
        initialYear={year}
      />
    </div>
  );
}
