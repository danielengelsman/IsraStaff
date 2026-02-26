"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertAllowance(data: {
  profile_id: string;
  year: number;
  total_days: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vacation_allowances")
    .upsert(
      {
        profile_id: data.profile_id,
        year: data.year,
        total_days: data.total_days,
      },
      { onConflict: "profile_id,year" }
    );

  if (error) return { error: error.message };

  revalidatePath("/admin/employees");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function initializeYearAllowances(
  year: number,
  defaults: { total_days: number }
) {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id");

  if (!profiles) return { error: "No profiles found" };

  const { data: existingAllowances } = await supabase
    .from("vacation_allowances")
    .select("profile_id")
    .eq("year", year);

  const existingIds = new Set(existingAllowances?.map((a) => a.profile_id) ?? []);
  const newAllowances = profiles
    .filter((p) => !existingIds.has(p.id))
    .map((p) => ({
      profile_id: p.id,
      year,
      total_days: defaults.total_days,
    }));

  if (newAllowances.length === 0) {
    return { success: true, message: "All employees already have allowances for this year" };
  }

  const { error } = await supabase
    .from("vacation_allowances")
    .insert(newAllowances);

  if (error) return { error: error.message };

  revalidatePath("/admin/employees");
  return { success: true, count: newAllowances.length };
}
