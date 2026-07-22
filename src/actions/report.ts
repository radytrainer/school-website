"use server";

import { createServerClient } from "@/lib/supabase";
import { reportSectionSchema, reportMetaSchema, type ReportSectionInput, type ReportMetaInput } from "@/lib/validations";
import type { ActionResult, ReportSectionRecord } from "@/types";
import { SCHOOL_REPORT_META } from "@/lib/school-report-data";
import { revalidatePath, revalidateTag } from "next/cache";

// The admin panel's browser client uses the anon key, which is subject to
// the public "is_active only" RLS policy — so a hidden section would be
// invisible to the admin list/edit pages too. These reads go through the
// service-role client instead, matching the write actions below.

export async function getAdminReportSectionsList(): Promise<ReportSectionRecord[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("report_sections").select("*").order("number");
  return (data ?? []) as ReportSectionRecord[];
}

export async function getAdminReportSectionById(id: string): Promise<ReportSectionRecord | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("report_sections").select("*").eq("id", id).single();
  return (data as ReportSectionRecord | null) ?? null;
}

export async function createReportSection(data: ReportSectionInput): Promise<ActionResult<void>> {
  const parsed = reportSectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("report_sections").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/operation", "page");
  revalidateTag("report_sections");
  return { success: true };
}

export async function updateReportSection(id: string, data: ReportSectionInput): Promise<ActionResult<void>> {
  const parsed = reportSectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("report_sections")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/operation", "page");
  revalidateTag("report_sections");
  return { success: true };
}

export async function deleteReportSection(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("report_sections").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/operation", "page");
  revalidateTag("report_sections");
  return { success: true };
}

// ─── Report Meta (academic year / report date shown in the hero) ──

export async function getAdminReportMeta(): Promise<ReportMetaInput> {
  const supabase = createServerClient();
  const { data } = await supabase.from("settings").select("value").eq("key", "school_report_meta").maybeSingle();
  return (data?.value as ReportMetaInput | undefined) ?? SCHOOL_REPORT_META;
}

export async function updateReportMeta(data: ReportMetaInput): Promise<ActionResult<void>> {
  const parsed = reportMetaSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: "school_report_meta", value: parsed.data, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/operation", "page");
  revalidateTag("school_report_meta");
  return { success: true };
}
