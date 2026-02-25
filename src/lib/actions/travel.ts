"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tripSchema, tripEventSchema, tripExpenseSchema } from "@/lib/validators/travel";

export async function createTrip(formData: {
  destination: string;
  country: string;
  start_date: string;
  end_date: string;
  purpose: string;
  notes?: string;
  total_budget?: number;
  currency?: string;
}) {
  const supabase = await createClient();

  const validated = tripSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("business_trips")
    .insert({
      profile_id: user.id,
      destination: validated.data.destination,
      country: validated.data.country,
      start_date: validated.data.start_date,
      end_date: validated.data.end_date,
      purpose: validated.data.purpose,
      notes: validated.data.notes || null,
      total_budget: validated.data.total_budget || null,
      currency: validated.data.currency || "USD",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/travel");
  revalidatePath("/dashboard");
  return { success: true, tripId: data.id };
}

export async function updateTripStatus(
  tripId: string,
  status: "approved" | "in_progress" | "completed" | "cancelled"
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updateData: Record<string, unknown> = { status };
  if (status === "approved") {
    updateData.approved_by = user.id;
    updateData.approved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("business_trips")
    .update(updateData)
    .eq("id", tripId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/travel");
  revalidatePath(`/travel/${tripId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addTripEvent(formData: {
  trip_id: string;
  title: string;
  description?: string;
  event_type: "meeting" | "conference" | "workshop" | "site_visit" | "travel" | "other";
  location?: string;
  start_time: string;
  end_time?: string;
}) {
  const supabase = await createClient();

  const validated = tripEventSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase
    .from("trip_events")
    .insert({
      trip_id: validated.data.trip_id,
      title: validated.data.title,
      description: validated.data.description || null,
      event_type: validated.data.event_type,
      location: validated.data.location || null,
      start_time: validated.data.start_time,
      end_time: validated.data.end_time || null,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/travel/${formData.trip_id}`);
  return { success: true };
}

export async function deleteTripEvent(eventId: string, tripId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trip_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/travel/${tripId}`);
  return { success: true };
}

export async function addTripExpense(formData: {
  trip_id: string;
  expense_type: "flights" | "hotel" | "meals" | "transport" | "other";
  amount: number;
  currency?: string;
  description?: string;
  expense_date: string;
}) {
  const supabase = await createClient();

  const validated = tripExpenseSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase
    .from("trip_expenses")
    .insert({
      trip_id: validated.data.trip_id,
      expense_type: validated.data.expense_type,
      amount: validated.data.amount,
      currency: validated.data.currency || "USD",
      description: validated.data.description || null,
      expense_date: validated.data.expense_date,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/travel/${formData.trip_id}`);
  return { success: true };
}

export async function deleteTripExpense(expenseId: string, tripId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trip_expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/travel/${tripId}`);
  return { success: true };
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("business_trips")
    .delete()
    .eq("id", tripId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/travel");
  revalidatePath("/dashboard");
  return { success: true };
}
