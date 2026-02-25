"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateEmployee(
  profileId: string,
  data: {
    role?: "employee" | "manager" | "admin";
    department_id?: string | null;
    can_access_travel?: boolean;
  }
) {
  const supabase = await createClient();

  // Admins always get travel access
  if (data.role === "admin") {
    data.can_access_travel = true;
  }

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", profileId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/employees");
  revalidatePath("/dashboard");
  revalidatePath("/travel");
  return { success: true };
}
