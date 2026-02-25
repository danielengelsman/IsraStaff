import { createClient } from "@/lib/supabase/server";
import type { Department } from "@/types/database";
import type { DepartmentWithManager } from "@/types";

export async function getDepartments(): Promise<DepartmentWithManager[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select(`
      *,
      manager:profiles!fk_departments_manager(id, full_name, email)
    `)
    .order("name");

  if (error) {
    console.error("getDepartments error:", error);
    return [];
  }

  return (data as unknown as DepartmentWithManager[]) ?? [];
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}
