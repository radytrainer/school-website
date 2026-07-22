"use server";

import { createServerClient } from "@/lib/supabase";
import type { ActionResult, Message } from "@/types";

// The admin panel's browser client uses the anon key, and `messages` has no
// public SELECT policy at all (only service-role and an INSERT-only policy
// for the contact form) — so the admin inbox is otherwise permanently
// empty regardless of how many messages actually exist.
export async function getAdminMessagesList(): Promise<Message[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Message[];
}

export async function markMessageRead(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("messages")
    .update({ status: "read" })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function markMessageReplied(
  id: string
): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("messages")
    .update({ status: "replied" })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteMessage(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
