"use server";

import { createServerClient } from "@/lib/supabase";
import { newsSchema, type NewsInput } from "@/lib/validations";
import type { ActionResult, News } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

// The admin panel's browser client uses the anon key, which is subject to
// the public "published only" RLS policy on `news` — so it can never see
// drafts, including ones an admin just created. These reads go through the
// service-role client instead, same as the write actions below, since the
// admin routes that call them are already gated by Firebase auth.
export async function getAdminNewsList(): Promise<News[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("news")
    .select("*, category:news_categories(*)")
    .order("created_at", { ascending: false });
  return (data ?? []) as News[];
}

export async function getAdminNewsById(id: string): Promise<News | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("news").select("*").eq("id", id).single();
  return (data as News | null) ?? null;
}

// The category select's "No category" option and an empty datetime-local
// input both submit "" — invalid for the underlying UUID/timestamptz
// columns, which need NULL instead.
function sanitizeNews(data: NewsInput) {
  return {
    ...data,
    category_id: data.category_id || null,
    publish_date: data.publish_date || null,
    images: (data.images ?? []).map((url) => url.trim()).filter(Boolean),
  };
}

export async function createNews(data: NewsInput): Promise<ActionResult<void>> {
  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("news").insert(sanitizeNews(parsed.data));
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}

export async function updateNews(
  id: string,
  data: NewsInput
): Promise<ActionResult<void>> {
  const parsed = newsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("news")
    .update({ ...sanitizeNews(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}

export async function deleteNews(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/news", "page");
  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("news");
  return { success: true };
}

export async function incrementNewsView(id: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.rpc("increment_news_view", { news_id: id });
  revalidateTag("news");
}
