"use server";

import { createServerClient } from "@/lib/supabase";
import { documentSchema, type DocumentInput } from "@/lib/validations";
import type { ActionResult, Document } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

// See achievements.ts for why admin reads go through the service-role
// client: the anon key is subject to the public "active only" RLS policy,
// so it can never see documents an admin just deactivated/created.
export async function getAdminDocumentsList(): Promise<Document[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Document[];
}

export async function getAdminDocumentById(id: string): Promise<Document | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("documents").select("*").eq("id", id).single();
  return (data as Document | null) ?? null;
}

export async function createDocument(data: DocumentInput): Promise<ActionResult<void>> {
  const parsed = documentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("documents").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("documents");
  return { success: true };
}

export async function updateDocument(id: string, data: DocumentInput): Promise<ActionResult<void>> {
  const parsed = documentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("documents")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("documents");
  return { success: true };
}

export async function deleteDocument(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("documents");
  return { success: true };
}
