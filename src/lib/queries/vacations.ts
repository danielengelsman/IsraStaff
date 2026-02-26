import { createClient } from "@/lib/supabase/server";
import type { VacationAllowance, VacationRequest } from "@/types/database";
import type { VacationRequestWithProfile } from "@/types";

export async function getVacationBalance(profileId: string, year?: number): Promise<VacationAllowance | null> {
  const supabase = await createClient();
  const currentYear = year ?? new Date().getFullYear();

  const { data, error } = await supabase
    .from("vacation_allowances")
    .select("*")
    .eq("profile_id", profileId)
    .eq("year", currentYear)
    .single();

  if (error) console.error("getVacationBalance error:", error);

  return data;
}

export async function getMyVacationRequests(profileId: string): Promise<VacationRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vacation_requests")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) console.error("getMyVacationRequests error:", error);

  return data ?? [];
}

export async function getVacationRequests(filters?: {
  status?: "pending" | "approved" | "rejected" | "cancelled";
  departmentId?: string;
  profileId?: string;
}): Promise<VacationRequestWithProfile[]> {
  const supabase = await createClient();

  let query = supabase
    .from("vacation_requests")
    .select(`
      *,
      profiles!vacation_requests_profile_id_fkey(full_name, email, avatar_url),
      reviewer:profiles!vacation_requests_reviewed_by_fkey(full_name)
    `)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.profileId) {
    query = query.eq("profile_id", filters.profileId);
  }

  const { data, error } = await query;

  if (error) console.error("getVacationRequests error:", error);

  return (data as unknown as VacationRequestWithProfile[]) ?? [];
}

export async function getPendingRequestsCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("vacation_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) console.error("getPendingRequestsCount error:", error);

  return count ?? 0;
}

export async function getUpcomingVacations(profileId: string, limit = 5): Promise<VacationRequest[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("vacation_requests")
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "approved")
    .gte("end_date", today)
    .order("start_date")
    .limit(limit);

  if (error) console.error("getUpcomingVacations error:", error);

  return data ?? [];
}
