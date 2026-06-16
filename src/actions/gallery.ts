"use server";

import { createServerClient } from "@/lib/supabase";
import { gallerySchema, type GalleryInput } from "@/lib/validations";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function createGalleryItem(
  data: GalleryInput
): Promise<ActionResult<void>> {
  const parsed = gallerySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("gallery").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/gallery", "page");
  return { success: true };
}

export async function updateGalleryItem(
  id: string,
  data: GalleryInput
): Promise<ActionResult<void>> {
  const parsed = gallerySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("gallery")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/gallery", "page");
  return { success: true };
}

export async function deleteGalleryItem(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/gallery", "page");
  return { success: true };
}
