"use client";

import dynamic from "next/dynamic";
import type { DailyVisitorStats } from "@/lib/analytics";

const VisitorChart = dynamic(() => import("./VisitorChart"), { ssr: false });

export default function VisitorChartWrapper({ data }: { data: DailyVisitorStats[] }) {
  return <VisitorChart data={data} />;
}
