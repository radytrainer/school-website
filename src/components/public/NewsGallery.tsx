"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { cn, resolveImageUrl } from "@/lib/utils";

interface NewsGalleryProps {
  images: string[];
  alt: string;
  km: boolean;
}

export default function NewsGallery({ images, alt, km }: NewsGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, prev, next]);

  if (!images || images.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Images className="w-5 h-5 text-school-blue-800" />
        <h2 className={cn("text-xl font-bold text-gray-900", km && "font-khmer")}>
          {km ? "វិចិត្រសាលរូបភាព" : "Photo Gallery"}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative w-full h-32 sm:h-40 rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
          >
            <Image
              src={resolveImageUrl(url)}
              alt={`${alt} ${i + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            aria-label={km ? "បិទ" : "Close"}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-7 h-7" />
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label={km ? "រូបមុន" : "Previous photo"}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-9 h-9" />
            </button>
          )}

          <div
            className="relative w-full max-w-4xl aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={resolveImageUrl(images[openIndex])}
              alt={`${alt} ${openIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label={km ? "រូបបន្ទាប់" : "Next photo"}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-9 h-9" />
            </button>
          )}

          <div className="absolute bottom-4 text-white/60 text-sm tabular-nums">
            {openIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
