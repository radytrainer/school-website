"use server";

import { createServerClient } from "@/lib/supabase";
import { bankAccountSchema, donationUseSchema, type BankAccountInput, type DonationUseInput } from "@/lib/validations";
import type { ActionResult, BankAccount, DonationUse } from "@/types";
import { revalidatePath, revalidateTag } from "next/cache";

// The admin panel's browser client uses the anon key, which is subject to
// the public "is_active only" RLS policy — so a hidden bank/use case would
// be invisible to the admin list/edit pages too. These reads go through the
// service-role client instead, matching the write actions below.

// ─── Bank Accounts ──────────────────────────────────────────────

export async function getAdminBankAccountsList(): Promise<BankAccount[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("bank_accounts").select("*").order("sort_order");
  return (data ?? []) as BankAccount[];
}

export async function getAdminBankAccountById(id: string): Promise<BankAccount | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("bank_accounts").select("*").eq("id", id).single();
  return (data as BankAccount | null) ?? null;
}

export async function createBankAccount(data: BankAccountInput): Promise<ActionResult<void>> {
  const parsed = bankAccountSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("bank_accounts").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("bank_accounts");
  return { success: true };
}

export async function updateBankAccount(id: string, data: BankAccountInput): Promise<ActionResult<void>> {
  const parsed = bankAccountSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("bank_accounts")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("bank_accounts");
  return { success: true };
}

export async function deleteBankAccount(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("bank_accounts");
  return { success: true };
}

// ─── Donation Uses ──────────────────────────────────────────────

export async function getAdminDonationUsesList(): Promise<DonationUse[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("donation_uses").select("*").order("sort_order");
  return (data ?? []) as DonationUse[];
}

export async function getAdminDonationUseById(id: string): Promise<DonationUse | null> {
  const supabase = createServerClient();
  const { data } = await supabase.from("donation_uses").select("*").eq("id", id).single();
  return (data as DonationUse | null) ?? null;
}

export async function createDonationUse(data: DonationUseInput): Promise<ActionResult<void>> {
  const parsed = donationUseSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("donation_uses").insert(parsed.data);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_uses");
  return { success: true };
}

export async function updateDonationUse(id: string, data: DonationUseInput): Promise<ActionResult<void>> {
  const parsed = donationUseSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("donation_uses")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_uses");
  return { success: true };
}

export async function deleteDonationUse(id: string): Promise<ActionResult<void>> {
  const supabase = createServerClient();
  const { error } = await supabase.from("donation_uses").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/[locale]/(public)/donate", "page");
  revalidateTag("donation_uses");
  return { success: true };
}
