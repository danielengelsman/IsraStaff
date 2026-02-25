import { createClient } from "@/lib/supabase/server";
import type { BusinessTrip } from "@/types/database";
import type { BusinessTripWithDetails } from "@/types";

export async function getMyTrips(profileId: string): Promise<BusinessTrip[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("business_trips")
    .select("*")
    .eq("profile_id", profileId)
    .order("start_date", { ascending: false });

  return data ?? [];
}

export async function getAllTrips(): Promise<BusinessTripWithDetails[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("business_trips")
    .select(`
      *,
      profiles(full_name, email, avatar_url),
      trip_events(*),
      trip_expenses(*)
    `)
    .order("start_date", { ascending: false });

  return (data as unknown as BusinessTripWithDetails[]) ?? [];
}

export async function getTripById(tripId: string): Promise<BusinessTripWithDetails | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("business_trips")
    .select(`
      *,
      profiles(full_name, email, avatar_url),
      trip_events(*),
      trip_expenses(*)
    `)
    .eq("id", tripId)
    .single();

  return data as unknown as BusinessTripWithDetails | null;
}

export async function getActiveTrips(profileId: string, limit = 5): Promise<BusinessTrip[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("business_trips")
    .select("*")
    .eq("profile_id", profileId)
    .in("status", ["planned", "approved", "in_progress"])
    .gte("end_date", today)
    .order("start_date")
    .limit(limit);

  return data ?? [];
}
