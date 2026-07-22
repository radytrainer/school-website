"use client";

import { useEffect, useRef } from "react";
import { incrementNewsView } from "@/actions/news";

// Fires once on real client mount — never during a Link-hover/viewport
// prefetch, since prefetch only fetches the RSC payload and never runs
// client effects. The ref guards against React StrictMode's dev-only
// double-invoke of effects, which would otherwise double-count locally.
export default function ViewTracker({ newsId }: { newsId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    incrementNewsView(newsId);
  }, [newsId]);

  return null;
}
