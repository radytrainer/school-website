"use server";

import { createServerClient } from "@/lib/supabase";
import { milestoneSchema, type MilestoneInput } from "@/lib/validations";
import type { ActionResult, Milestone } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

// The admin panel's browser client uses the anon key, which is subject to
// the public "is_active only" RLS policy — so hidden milestones would be
// invisible to the admin list/edit pages too. These reads go through the
// service-role client instead, matching the write actions below.
export async function getAdminMilestonesList(): Promise<Milestone[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("milestones").select("*").order("sort_order");
  return (data ?? []) as Milestone[];
}

export async function getAdminMilestoneById(id: string): Promise<Milestone | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("milestones").select("*").eq("id", id).single();
  return (data as Milestone | null) ?? null;
}

export async function createMilestone(data: MilestoneInput): Promise<ActionResult<void>> {
  const parsed = milestoneSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("milestones").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("milestones");
  return { success: true };
}

export async function updateMilestone(
  id: string,
  data: MilestoneInput
): Promise<ActionResult<void>> {
  const parsed = milestoneSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("milestones")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("milestones");
  return { success: true };
}

export async function deleteMilestone(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("milestones");
  return { success: true };
}
