import { getHolidays } from "@/lib/queries/holidays";
import { PageHeader } from "@/components/shared/page-header";
import { HolidaysManager } from "@/components/admin/holidays-manager";

export default async function HolidaysPage() {
  const holidays = await getHolidays();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holidays"
        description="Manage bank holidays and office closure days"
      />
      <HolidaysManager holidays={holidays} />
    </div>
  );
}
