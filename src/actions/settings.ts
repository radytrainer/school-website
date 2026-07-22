"use server";

import { createServerClient } from "@/lib/supabase";
import type { ActionResult, Leadership } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

// The admin panel's browser client uses the anon key, which is subject to
// the public "is_active only" RLS policy — so an inactive/hidden leader
// would be invisible in the admin Settings > Leadership tab too.
export async function getAdminLeadershipList(): Promise<Leadership[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("leadership").select("*").order("sort_order");
  return (data ?? []) as Leadership[];
}

export async function upsertSetting(
  key: string,
  value: string,
  description?: string
): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("settings")
    .upsert(
      { key, value, description, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)", "page");
  revalidateTag("settings");
  return { success: true };
}

export async function upsertSchoolInfo(
  section: string,
  contentKm: string,
  contentEn: string
): Promise<ActionResult<void>> {
  const supabase = createServerClient();

  // `section` has no unique constraint in the live schema, so a real
  // `.upsert(..., { onConflict: "section" })` fails with "there is no
  // unique or exclusion constraint matching the ON CONFLICT specification".
  // Look the row up manually instead and update or insert accordingly.
  const { data: existing } = await supabase
    .from("school_info")
    .select("id")
    .eq("section", section)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("school_info")
        .update({
          content_km: contentKm,
          content_en: contentEn,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    : await supabase.from("school_info").insert({
        section,
        content_km: contentKm,
        content_en: contentEn,
      });
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("school_info");
  return { success: true };
}

export async function updateLeadership(
  id: string,
  data: {
    name_km: string;
    name_en: string;
    position_km: string;
    position_en: string;
    bio_km?: string;
    bio_en?: string;
    photo_url?: string;
    sort_order: number;
    is_active: boolean;
  }
): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("leadership")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/about", "page");
  revalidateTag("leadership");
  return { success: true };
}
