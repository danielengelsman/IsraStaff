import { createClient } from "@/lib/supabase/server";

export async function getAllowancesForYear(year: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vacation_allowances")
    .select("*, profiles(full_name, email, department_id, departments(name))")
    .eq("year", year)
    .order("profiles(full_name)");

  if (error) console.error("getAllowancesForYear error:", error);

  return data ?? [];
}
