"use server";

import { createServerClient } from "@/lib/supabase";
import { teacherSchema, type TeacherInput } from "@/lib/validations";
import type { ActionResult, Teacher } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

// The admin panel's browser client uses the anon key, which is subject to
// the public "is_active only" RLS policy — so inactive teachers are
// invisible to the admin list/edit pages too. These reads go through the
// service-role client instead, matching the write actions below.
export async function getAdminTeachersList(): Promise<Teacher[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("teachers").select("*").order("sort_order");
  return (data ?? []) as Teacher[];
}

export async function getAdminTeacherById(id: string): Promise<Teacher | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("teachers").select("*").eq("id", id).single();
  return (data as Teacher | null) ?? null;
}

export async function createTeacher(
  data: TeacherInput
): Promise<ActionResult<void>> {
  const parsed = teacherSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("teachers").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}

export async function updateTeacher(
  id: string,
  data: TeacherInput
): Promise<ActionResult<void>> {
  const parsed = teacherSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("teachers")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}

export async function deleteTeacher(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("teachers");
  return { success: true };
}
