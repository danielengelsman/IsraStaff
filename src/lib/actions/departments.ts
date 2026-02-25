"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createDepartment(data: {
  name: string;
  description?: string;
  manager_id?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("departments").insert({
    name: data.name,
    description: data.description || null,
    manager_id: data.manager_id || null,
  });

  if (error) {
    console.error("Department create error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/departments");
  return { success: true };
}

export async function updateDepartment(
  id: string,
  data: { name?: string; description?: string; manager_id?: string | null }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("departments")
    .update(data)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/departments");
  return { success: true };
}

export async function deleteDepartment(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("departments").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/departments");
  return { success: true };
}
