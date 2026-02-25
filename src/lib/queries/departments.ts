import { createClient } from "@/lib/supabase/server";
import type { Department } from "@/types/database";
import type { DepartmentWithManager } from "@/types";

export async function getDepartments(): Promise<DepartmentWithManager[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("departments")
    .select(`
      *,
      manager:profiles!departments_manager_id_fkey(id, full_name, email)
    `)
    .order("name");

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
