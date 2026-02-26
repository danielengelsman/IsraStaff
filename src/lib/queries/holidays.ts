import { createClient } from "@/lib/supabase/server";
import type { Holiday } from "@/types/database";

export async function getHolidays(year?: number): Promise<Holiday[]> {
  const supabase = await createClient();

  let query = supabase.from("holidays").select("*").order("date");

  if (year) {
    query = query
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getHolidays error:", error);
    return [];
  }

  return data ?? [];
}

export async function getHolidaysInRange(
  startDate: string,
  endDate: string
): Promise<Holiday[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("holidays")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date");

  if (error) {
    console.error("getHolidaysInRange error:", error);
    return [];
  }

  return data ?? [];
}
