"use server";

import { createServerClient } from "@/lib/supabase";
import { heroSlideSchema, type HeroSlideInput } from "@/lib/validations";
import type { ActionResult, HeroSlide } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getAdminHeroSlidesList(): Promise<HeroSlide[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as HeroSlide[];
}

export async function getAdminHeroSlideById(id: string): Promise<HeroSlide | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("hero_slides").select("*").eq("id", id).single();
  return (data as HeroSlide | null) ?? null;
}

export async function createHeroSlide(data: HeroSlideInput): Promise<ActionResult<void>> {
  const parsed = heroSlideSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("hero_slides").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("hero_slides");
  return { success: true };
}

export async function updateHeroSlide(id: string, data: HeroSlideInput): Promise<ActionResult<void>> {
  const parsed = heroSlideSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("hero_slides")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("hero_slides");
  return { success: true };
}

export async function deleteHeroSlide(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("hero_slides");
  return { success: true };
}
