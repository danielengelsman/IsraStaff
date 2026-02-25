"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateEmployee(
  profileId: string,
  data: { role?: "employee" | "manager" | "admin"; department_id?: string | null }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", profileId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/employees");
  revalidatePath("/dashboard");
  return { success: true };
}
