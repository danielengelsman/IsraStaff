import { createClient } from "@/lib/supabase/server";

export async function getAllowancesForYear(year: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vacation_allowances")
    .select("*, profiles(full_name, email, department_id, departments(name))")
    .eq("year", year);

  if (error) console.error("getAllowancesForYear error:", error);

  // Sort by employee name in JS (Supabase JS doesn't support ordering by foreign table columns directly)
  const sorted = (data ?? []).sort((a, b) => {
    const nameA = (a as any).profiles?.full_name ?? "";
    const nameB = (b as any).profiles?.full_name ?? "";
    return nameA.localeCompare(nameB);
  });

  return sorted;
}
