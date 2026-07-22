import { createServerClient } from "./supabase";

export interface DailyVisitorStats {
  day: string;
  visitors: number;
  unique: number;
}

export async function recordPageview(visitorHash: string, day: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.rpc("record_page_visit", { visit_day: day, visitor_hash: visitorHash });
}

// Weekday label uses simple en-US short-weekday formatting — exact
// precision doesn't matter for a trend chart, only correct day ordering does.
export async function getVisitorStats(days = 7): Promise<DailyVisitorStats[]> {
  const today = new Date();

  const dayKeys = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });
  const startDay = dayKeys[0].key;

  const supabase = createServerClient();
  const [{ data: totals }, { data: uniques }] = await Promise.all([
    supabase.from("page_visit_totals").select("day, total").gte("day", startDay),
    supabase.from("page_visit_uniques").select("day").gte("day", startDay),
  ]);

  const totalsByDay = new Map<string, number>(
    (totals ?? []).map((row: { day: string; total: number }) => [row.day, row.total])
  );
  const uniqueCountByDay = new Map<string, number>();
  (uniques ?? []).forEach((row: { day: string }) => {
    uniqueCountByDay.set(row.day, (uniqueCountByDay.get(row.day) ?? 0) + 1);
  });

  return dayKeys.map(({ key, label }) => ({
    day: label,
    visitors: totalsByDay.get(key) ?? 0,
    unique: uniqueCountByDay.get(key) ?? 0,
  }));
}
