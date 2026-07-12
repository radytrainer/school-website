"use server";

import { createServerClient } from "@/lib/supabase";
import { adminAuth } from "@/lib/firebase-admin";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import type { ActionResult, User } from "@/types";
import type { z } from "zod";

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

// The admin panel's browser client uses the anon key, and `admin_users` has
// no public SELECT policy at all (only service-role) — so the User
// Management page is otherwise permanently empty regardless of how many
// admin accounts actually exist.
export async function getAdminUsersList(): Promise<User[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false });
  return (data ?? []) as User[];
}

export async function getAdminUserById(id: string): Promise<User | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("admin_users").select("*").eq("id", id).single();
  return (data as User | null) ?? null;
}

export async function createUser(
  data: CreateUserInput
): Promise<ActionResult<void>> {
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }
  const { password, ...rest } = parsed.data;

  let firebaseUid: string;
  try {
    const firebaseUser = await adminAuth.createUser({
      email: rest.email,
      password,
      displayName: rest.full_name,
    });
    firebaseUid = firebaseUser.uid;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create Firebase account";
    return { success: false, error: message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("admin_users").insert({ ...rest, firebase_uid: firebaseUid });
  if (error) {
    // Roll back the Firebase account so it doesn't become an orphaned login with no DB profile.
    await adminAuth.deleteUser(firebaseUid).catch(() => {});
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateUser(
  id: string,
  data: UpdateUserInput
): Promise<ActionResult<void>> {
  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function toggleUserActive(
  id: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteUser(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { data: existing } = await supabase.from("admin_users").select("firebase_uid").eq("id", id).single();

  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  if (existing?.firebase_uid && !existing.firebase_uid.startsWith("pending_")) {
    await adminAuth.deleteUser(existing.firebase_uid).catch(() => {});
  }

  return { success: true };
}
