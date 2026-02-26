"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createHoliday(data: {
  name: string;
  date: string;
  country?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("holidays").insert({
    name: data.name,
    date: data.date,
    country: data.country || "IL",
  });

  if (error) {
    console.error("Holiday create error:", error);
    if (error.code === "23505") {
      return { error: "A holiday already exists on this date" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/holidays");
  revalidatePath("/vacations/calendar");
  revalidatePath("/travel/calendar");
  return { success: true };
}

export async function updateHoliday(
  id: string,
  data: { name?: string; date?: string; country?: string }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("holidays")
    .update(data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A holiday already exists on this date" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/holidays");
  revalidatePath("/vacations/calendar");
  revalidatePath("/travel/calendar");
  return { success: true };
}

export async function deleteHoliday(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("holidays").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/holidays");
  revalidatePath("/vacations/calendar");
  revalidatePath("/travel/calendar");
  return { success: true };
}
