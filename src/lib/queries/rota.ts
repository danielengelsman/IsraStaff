import { createClient } from "@/lib/supabase/server";
import type { RotaDefault, RotaOverride } from "@/types/database";
import type { RotaWeekEntry, OfficePresence, RotaLocation } from "@/types";

/**
 * Get default weekly patterns for one or more profiles.
 */
export async function getRotaDefaults(
  profileIds?: string[]
): Promise<RotaDefault[]> {
  const supabase = await createClient();

  let query = supabase
    .from("rota_defaults")
    .select("*")
    .order("day_of_week");

  if (profileIds && profileIds.length > 0) {
    query = query.in("profile_id", profileIds);
  }

  const { data, error } = await query;
  if (error) console.error("getRotaDefaults error:", error);
  return (data ?? []) as RotaDefault[];
}

/**
 * Get overrides for a date range.
 */
export async function getRotaOverrides(
  startDate: string,
  endDate: string,
  profileIds?: string[]
): Promise<RotaOverride[]> {
  const supabase = await createClient();

  let query = supabase
    .from("rota_overrides")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate);

  if (profileIds && profileIds.length > 0) {
    query = query.in("profile_id", profileIds);
  }

  const { data, error } = await query;
  if (error) console.error("getRotaOverrides error:", error);
  return (data ?? []) as RotaOverride[];
}

/**
 * Resolve a week view: for each profile, compute the effective location
 * per day for a given Sun–Thu week.
 * weekStartDate should be the Sunday ISO date string.
 */
export async function getRotaWeek(
  weekStartDate: string,
  departmentId?: string
): Promise<RotaWeekEntry[]> {
  const supabase = await createClient();

  // Get profiles (optionally filtered by department)
  let profileQuery = supabase
    .from("profiles")
    .select("id, full_name, avatar_url, departments!profiles_department_id_fkey(name)")
    .order("full_name");

  if (departmentId) {
    profileQuery = profileQuery.eq("department_id", departmentId);
  }

  const { data: profiles, error: profileError } = await profileQuery;
  if (profileError) {
    console.error("getRotaWeek profiles error:", profileError);
    return [];
  }
  if (!profiles || profiles.length === 0) return [];

  const profileIds = profiles.map((p) => p.id);

  // Calculate the 5 dates (Sun–Thu) from the week start
  const weekDates: string[] = [];
  const startDate = new Date(weekStartDate + "T00:00:00");
  for (let i = 0; i < 5; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  const endDate = weekDates[4];

  // Fetch defaults and overrides in parallel
  const [defaults, overrides] = await Promise.all([
    getRotaDefaults(profileIds),
    getRotaOverrides(weekDates[0], endDate, profileIds),
  ]);

  // Index defaults: profileId -> dayOfWeek -> location
  const defaultMap = new Map<string, Map<number, RotaLocation>>();
  for (const d of defaults) {
    if (!defaultMap.has(d.profile_id)) defaultMap.set(d.profile_id, new Map());
    defaultMap.get(d.profile_id)!.set(d.day_of_week, d.location as RotaLocation);
  }

  // Index overrides: profileId -> date -> location
  const overrideMap = new Map<string, Map<string, RotaLocation>>();
  for (const o of overrides) {
    if (!overrideMap.has(o.profile_id)) overrideMap.set(o.profile_id, new Map());
    overrideMap.get(o.profile_id)!.set(o.date, o.location as RotaLocation);
  }

  // Build the result
  return profiles.map((p) => {
    const days: Record<string, { location: RotaLocation; isOverride: boolean }> = {};

    for (let i = 0; i < 5; i++) {
      const dateStr = weekDates[i];
      const profileOverrides = overrideMap.get(p.id);
      const profileDefaults = defaultMap.get(p.id);

      if (profileOverrides?.has(dateStr)) {
        days[dateStr] = {
          location: profileOverrides.get(dateStr)!,
          isOverride: true,
        };
      } else if (profileDefaults?.has(i)) {
        days[dateStr] = {
          location: profileDefaults.get(i)!,
          isOverride: false,
        };
      } else {
        // No default set — assume office
        days[dateStr] = { location: "office", isOverride: false };
      }
    }

    const dept = (p as Record<string, unknown>).departments as { name: string } | null;
    return {
      profileId: p.id,
      profileName: p.full_name,
      avatarUrl: p.avatar_url,
      departmentName: dept?.name ?? null,
      days,
    };
  });
}

/**
 * Get who's in the office today (for the dashboard widget).
 * Resolves overrides > defaults for today's date.
 */
export async function getOfficePresenceToday(): Promise<OfficePresence[]> {
  const supabase = await createClient();
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun ... 6=Sat

  // If today is Friday (5) or Saturday (6), return empty — not a work day
  if (dayOfWeek === 5 || dayOfWeek === 6) return [];

  const todayStr = today.toISOString().split("T")[0];

  // Fetch all profiles
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, departments!profiles_department_id_fkey(name)")
    .order("full_name");

  if (profileError || !profiles) {
    console.error("getOfficePresenceToday profiles error:", profileError);
    return [];
  }

  const profileIds = profiles.map((p) => p.id);

  const [{ data: defaults, error: defError }, { data: overrides, error: ovrError }] = await Promise.all([
    supabase
      .from("rota_defaults")
      .select("*")
      .in("profile_id", profileIds)
      .eq("day_of_week", dayOfWeek),
    supabase
      .from("rota_overrides")
      .select("*")
      .in("profile_id", profileIds)
      .eq("date", todayStr),
  ]);

  if (defError) console.error("getOfficePresenceToday defaults error:", defError);
  if (ovrError) console.error("getOfficePresenceToday overrides error:", ovrError);

  const defaultMap = new Map<string, RotaLocation>();
  for (const d of (defaults ?? []) as RotaDefault[]) {
    defaultMap.set(d.profile_id, d.location as RotaLocation);
  }

  const overrideMap = new Map<string, RotaLocation>();
  for (const o of (overrides ?? []) as RotaOverride[]) {
    overrideMap.set(o.profile_id, o.location as RotaLocation);
  }

  return profiles.map((p) => {
    const dept = (p as Record<string, unknown>).departments as { name: string } | null;
    const location: RotaLocation =
      overrideMap.get(p.id) ??
      defaultMap.get(p.id) ??
      "office"; // default if nothing set

    return {
      profileId: p.id,
      profileName: p.full_name,
      avatarUrl: p.avatar_url,
      departmentName: dept?.name ?? null,
      location,
    };
  });
}
