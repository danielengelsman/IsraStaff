import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import type { ProfileWithDepartment } from "@/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function getProfileWithDepartment(): Promise<ProfileWithDepartment | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*, departments!profiles_department_id_fkey(id, name)")
    .eq("id", user.id)
    .single();

  return data as ProfileWithDepartment | null;
}

export async function getTeamMembers(departmentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("department_id", departmentId)
    .order("full_name");

  return data ?? [];
}

export async function getAllProfiles(): Promise<ProfileWithDepartment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, departments!profiles_department_id_fkey(id, name)")
    .order("full_name");

  if (error) console.error("getAllProfiles error:", error);

  return (data as ProfileWithDepartment[]) ?? [];
}
