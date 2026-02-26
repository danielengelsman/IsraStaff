"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Set or replace all 5 weekday defaults for one employee.
 * Uses upsert with on-conflict on (profile_id, day_of_week).
 */
export async function setRotaDefaults(input: {
  profile_id: string;
  defaults: { day_of_week: number; location: "office" | "home" }[];
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const rows = input.defaults.map((d) => ({
    profile_id: input.profile_id,
    day_of_week: d.day_of_week,
    location: d.location,
  }));

  const { error } = await supabase
    .from("rota_defaults")
    .upsert(rows, { onConflict: "profile_id,day_of_week" });

  if (error) {
    console.error("setRotaDefaults error:", error);
    return { error: error.message };
  }

  revalidatePath("/rota");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Set or update an override for a specific date.
 * Uses upsert with on-conflict on (profile_id, date).
 */
export async function setRotaOverride(input: {
  profile_id: string;
  date: string;
  location: "office" | "home";
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("rota_overrides")
    .upsert(
      {
        profile_id: input.profile_id,
        date: input.date,
        location: input.location,
        created_by: user.id,
      },
      { onConflict: "profile_id,date" }
    );

  if (error) {
    console.error("setRotaOverride error:", error);
    return { error: error.message };
  }

  revalidatePath("/rota");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Remove a specific override (reverts to the default pattern).
 */
export async function removeRotaOverride(profileId: string, date: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("rota_overrides")
    .delete()
    .eq("profile_id", profileId)
    .eq("date", date);

  if (error) {
    console.error("removeRotaOverride error:", error);
    return { error: error.message };
  }

  revalidatePath("/rota");
  revalidatePath("/dashboard");
  return { success: true };
}
