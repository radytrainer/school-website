"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types";

interface HeroSectionProps {
  slides?: HeroSlide[];
}

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback",
    title_km: "សូមស្វាគតម៌មកវិទ្យាល័យ",
    title_en: "Welcome to Our High School",
    subtitle_km: "ផ្ដល់ការអប់រំ ប្រកបដោយ គុណភាព វប្បធម៌ និងនវានុវត្ត",
    subtitle_en: "Empowering the next generation of Cambodian leaders through academic rigor, cultural integrity, and innovative learning.",
    gradient: "linear-gradient(135deg, #0d1b38 0%, #1e3a8a 55%, #1e3066 100%)",
    cta_primary_en: "Enroll Now",
    cta_primary_km: "ចុះឈ្មោះ",
    cta_secondary_en: "View Prospectus",
    cta_secondary_km: "មើលព័ត៌មាន",
    cta_primary_href: "/contact",
    cta_secondary_href: "/about",
    sort_order: 1,
    is_active: true,
  },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection({ slides }: HeroSectionProps) {
  const locale = useLocale();
  const activeSlides = (slides ?? []).filter((s) => s.is_active).slice(0, 5);
  const allSlides = activeSlides.length > 0 ? activeSlides : FALLBACK_SLIDES;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % allSlides.length, 1);
  }, [current, allSlides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + allSlides.length) % allSlides.length, -1);
  }, [current, allSlides.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (allSlides.length <= 1 || paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, allSlides.length, paused]);

  const slide = allSlides[current];

  return (
    <section
      className="relative h-screen min-h-[580px] max-h-[900px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ─── Background Slides ─── */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`bg-${current}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.title_en}
              fill
              className="object-cover"
              priority={current === 0}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: slide.gradient ?? "linear-gradient(135deg, #0d1b38 0%, #1e3a8a 100%)" }}
            >
              {/* Decorative geometry */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-white/5" />
                <div className="absolute bottom-10 left-1/3 w-48 h-48 rounded-full bg-school-gold-400/10" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-white/[0.03]" />
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 41px)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Dark gradient overlay — heavier on left for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ─── Content ─── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${current}`}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.45, ease: "easeOut" }}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              >
                {/* Khmer title — gold accent */}
                <motion.p
                  variants={contentVariants}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="font-khmer-title text-school-gold-400 text-lg md:text-xl mb-2 leading-relaxed"
                >
                  {slide.title_km}
                </motion.p>

                {/* English title — large white */}
                <motion.h1
                  variants={contentVariants}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
                >
                  {slide.title_en}
                </motion.h1>

                {/* Subtitle */}
                {(slide.subtitle_en || slide.subtitle_km) && (
                  <motion.p
                    variants={contentVariants}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className={cn(
                      "text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-xl",
                      locale === "km" ? "font-khmer" : ""
                    )}
                  >
                    {locale === "km"
                      ? (slide.subtitle_km ?? slide.subtitle_en)
                      : (slide.subtitle_en ?? slide.subtitle_km)}
                  </motion.p>
                )}

                {/* CTA Buttons */}
                <motion.div
                  variants={contentVariants}
                  transition={{ delay: 0.28, duration: 0.4 }}
                  className="flex flex-wrap gap-3"
                >
                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      "bg-white text-school-blue-900 hover:bg-white/90 font-semibold px-7 h-12 shadow-xl shadow-black/20 transition-all duration-200 group",
                      locale === "km" && "font-khmer"
                    )}
                  >
                    <Link href={`/${locale}${slide.cta_primary_href ?? "/contact"}`}>
                      {locale === "km"
                        ? (slide.cta_primary_km ?? "ចុះឈ្មោះ")
                        : (slide.cta_primary_en ?? "Enroll Now")}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      "bg-white/10 border border-white/25 text-white hover:bg-white/20 backdrop-blur-sm px-7 h-12 font-medium transition-all duration-200 group",
                      locale === "km" && "font-khmer"
                    )}
                  >
                    <Link href={`/${locale}${slide.cta_secondary_href ?? "/about"}`}>
                      <BookOpen className="mr-2 w-4 h-4 opacity-80" />
                      {locale === "km"
                        ? (slide.cta_secondary_km ?? "មើលព័ត៌មាន")
                        : (slide.cta_secondary_en ?? "View Prospectus")}
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Prev / Next arrows ─── */}
      {allSlides.length > 1 && (
        <>
          <button
            onClick={() => { prev(); setPaused(false); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { next(); setPaused(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ─── Dot indicators ─── */}
      {allSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {allSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className={cn(
                "rounded-full transition-all duration-400 border-0",
                i === current
                  ? "w-8 h-2.5 bg-school-gold-400"
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ─── Slide counter (top-right) ─── */}
      {allSlides.length > 1 && (
        <div className="absolute top-24 right-6 z-20 text-white/50 text-xs font-mono tabular-nums">
          {String(current + 1).padStart(2, "0")} / {String(allSlides.length).padStart(2, "0")}
        </div>
      )}

      {/* ─── Bottom wave divider ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path
            d="M0 56L1440 56L1440 16C1200 48 960 60 720 44C480 28 240 0 0 16L0 56Z"
            fill="rgb(249 250 251)"
          />
        </svg>
      </div>
    </section>
  );
}
