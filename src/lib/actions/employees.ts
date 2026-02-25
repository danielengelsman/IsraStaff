"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createEmployee(formData: {
  full_name: string;
  email: string;
  password: string;
  role?: "employee" | "manager" | "admin";
  department_id?: string | null;
  can_access_travel?: boolean;
}) {
  // Verify the calling user is admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!callerProfile || callerProfile.role !== "admin") {
    return { error: "Only admins can create employees" };
  }

  // Validate inputs
  if (!formData.full_name.trim()) return { error: "Full name is required" };
  if (!formData.email.trim()) return { error: "Email is required" };
  if (!formData.password || formData.password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  // Create the auth user with the admin client
  const adminClient = createAdminClient();
  const { data: newUser, error: authError } =
    await adminClient.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: { full_name: formData.full_name },
    });

  if (authError) {
    return { error: authError.message };
  }

  // The handle_new_user trigger auto-creates the profile with defaults.
  // If admin chose non-default settings, update the profile now.
  const role = formData.role || "employee";
  const needsUpdate =
    role !== "employee" ||
    formData.department_id ||
    formData.can_access_travel;

  if (needsUpdate && newUser.user) {
    const updateData: Record<string, unknown> = {};
    if (role !== "employee") updateData.role = role;
    if (formData.department_id) updateData.department_id = formData.department_id;
    if (formData.can_access_travel) updateData.can_access_travel = true;
    if (role === "admin") updateData.can_access_travel = true;

    await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", newUser.user.id);
  }

  revalidatePath("/admin/employees");
  return { success: true };
}

export async function updateEmployee(
  profileId: string,
  data: {
    role?: "employee" | "manager" | "admin";
    department_id?: string | null;
    can_access_travel?: boolean;
  }
) {
  const supabase = await createClient();

  // Admins always get travel access
  if (data.role === "admin") {
    data.can_access_travel = true;
  }

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", profileId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/employees");
  revalidatePath("/dashboard");
  revalidatePath("/travel");
  return { success: true };
}
