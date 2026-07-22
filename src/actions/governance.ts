"use server";

import { createServerClient } from "@/lib/supabase";
import { governanceItemSchema, type GovernanceItemInput } from "@/lib/validations";
import type { ActionResult, GovernanceItem } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

// The admin panel's browser client uses the anon key, which is subject to
// the public "is_active only" RLS policy — so hidden items are invisible
// to the admin list/edit pages too. These reads go through the service-role
// client instead, matching the write actions below.
export async function getAdminGovernanceList(): Promise<GovernanceItem[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("governance_items")
    .select("*")
    .order("section")
    .order("sort_order");
  return (data ?? []) as GovernanceItem[];
}

export async function getAdminGovernanceItemById(id: string): Promise<GovernanceItem | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("governance_items").select("*").eq("id", id).single();
  return (data as GovernanceItem | null) ?? null;
}

export async function createGovernanceItem(
  data: GovernanceItemInput
): Promise<ActionResult<void>> {
  const parsed = governanceItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("governance_items").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/governance", "page");
  revalidateTag("governance");
  return { success: true };
}

export async function updateGovernanceItem(
  id: string,
  data: GovernanceItemInput
): Promise<ActionResult<void>> {
  const parsed = governanceItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("governance_items")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/governance", "page");
  revalidateTag("governance");
  return { success: true };
}

export async function deleteGovernanceItem(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("governance_items").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/governance", "page");
  revalidateTag("governance");
  return { success: true };
}
