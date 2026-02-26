import { createClient } from "@/lib/supabase/server";
import type { Profile, VacationAllowance, VacationRequest } from "@/types/database";
import type { ProfileWithDepartment, TeamMemberWithStatus } from "@/types";

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

export async function getTeamMembersWithStatus(departmentId: string): Promise<TeamMemberWithStatus[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();

  // Get team members
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("department_id", departmentId)
    .order("full_name");

  if (!members || members.length === 0) return [];

  const memberIds = members.map((m) => m.id);

  // Fetch allowances, current vacations, and upcoming vacations in parallel
  const [{ data: allowances }, { data: currentVacations }, { data: upcomingVacations }] =
    await Promise.all([
      supabase
        .from("vacation_allowances")
        .select("*")
        .in("profile_id", memberIds)
        .eq("year", currentYear),
      supabase
        .from("vacation_requests")
        .select("*")
        .in("profile_id", memberIds)
        .eq("status", "approved")
        .lte("start_date", today)
        .gte("end_date", today),
      supabase
        .from("vacation_requests")
        .select("*")
        .in("profile_id", memberIds)
        .eq("status", "approved")
        .gt("start_date", today)
        .order("start_date")
        .limit(30),
    ]);

  // Index by profile_id for fast lookup
  const allowanceMap = new Map(
    (allowances ?? []).map((a: VacationAllowance) => [a.profile_id, a])
  );
  const currentVacMap = new Map(
    (currentVacations ?? []).map((v: VacationRequest) => [v.profile_id, v])
  );

  // Group upcoming vacations by profile, take first 3 per person
  const upcomingMap = new Map<string, VacationRequest[]>();
  for (const v of (upcomingVacations ?? []) as VacationRequest[]) {
    const list = upcomingMap.get(v.profile_id) ?? [];
    if (list.length < 3) list.push(v);
    upcomingMap.set(v.profile_id, list);
  }

  return members.map((m) => ({
    ...m,
    role: m.role as TeamMemberWithStatus["role"],
    vacation_allowance: allowanceMap.get(m.id) ?? null,
    current_vacation: currentVacMap.get(m.id) ?? null,
    upcoming_vacations: upcomingMap.get(m.id) ?? [],
  }));
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
