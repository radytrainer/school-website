"use server";

import { createServerClient } from "@/lib/supabase";
import { noticeSchema, type NoticeInput } from "@/lib/validations";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function createNotice(
  data: NoticeInput
): Promise<ActionResult<void>> {
  const parsed = noticeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("notices").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  return { success: true };
}

export async function updateNotice(
  id: string,
  data: NoticeInput
): Promise<ActionResult<void>> {
  const parsed = noticeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("notices")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  return { success: true };
}

export async function deleteNotice(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  return { success: true };
}
