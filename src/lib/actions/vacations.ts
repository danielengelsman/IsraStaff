"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { vacationRequestSchema, type ReviewRequestInput } from "@/lib/validators/vacation";
import { calculateBusinessDays } from "@/lib/utils/dates";

export async function createVacationRequest(formData: {
  start_date: string;
  end_date: string;
  type: "vacation" | "sick" | "personal";
  notes?: string;
}) {
  const supabase = await createClient();

  const validated = vacationRequestSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const totalDays = calculateBusinessDays(
    new Date(validated.data.start_date),
    new Date(validated.data.end_date)
  );

  if (totalDays === 0) {
    return { error: "Selected dates contain no business days" };
  }

  const { error } = await supabase
    .from("vacation_requests")
    .insert({
      profile_id: user.id,
      start_date: validated.data.start_date,
      end_date: validated.data.end_date,
      type: validated.data.type,
      notes: validated.data.notes || null,
      total_days: totalDays,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/vacations");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function reviewVacationRequest(
  requestId: string,
  review: ReviewRequestInput
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("vacation_requests")
    .update({
      status: review.status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: review.review_notes || null,
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/vacations");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelVacationRequest(requestId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("vacation_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("profile_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/vacations");
  revalidatePath("/dashboard");
  return { success: true };
}
