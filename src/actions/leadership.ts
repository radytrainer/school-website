"use server";

import { createServerClient } from "@/lib/supabase";
import { leadershipSchema, type LeadershipInput } from "@/lib/validations";
import type { ActionResult, Leadership } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

// The admin panel's browser client uses the anon key, which is subject to
// the public "is_active only" RLS policy — so a hidden leader would be
// invisible to the admin list/edit pages too. These reads go through the
// service-role client instead, matching the write actions below.
export async function getAdminLeadershipList(): Promise<Leadership[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("leadership").select("*").order("sort_order");
  return (data ?? []) as Leadership[];
}

export async function getAdminLeadershipById(id: string): Promise<Leadership | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("leadership").select("*").eq("id", id).single();
  return (data as Leadership | null) ?? null;
}

export async function createLeadership(data: LeadershipInput): Promise<ActionResult<void>> {
  const parsed = leadershipSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("leadership").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("leadership");
  return { success: true };
}

export async function updateLeadershipMember(
  id: string,
  data: LeadershipInput
): Promise<ActionResult<void>> {
  const parsed = leadershipSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("leadership")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("leadership");
  return { success: true };
}

export async function deleteLeadership(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("leadership").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("leadership");
  return { success: true };
}
