import { createClient } from "@/lib/supabase/server";
import type { VacationAllowance } from "@/types/database";

export async function getEmployeeAllowances(year: number): Promise<Record<string, VacationAllowance>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vacation_allowances")
    .select("*")
    .eq("year", year);

  if (error) console.error("getEmployeeAllowances error:", error);

  const map: Record<string, VacationAllowance> = {};
  for (const a of (data ?? []) as VacationAllowance[]) {
    map[a.profile_id] = a;
  }
  return map;
}
