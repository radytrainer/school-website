"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Mail, Clock, Send, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, resolveImageUrl } from "@/lib/utils";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { submitContactMessage } from "@/actions/contact";
import TiktokIcon from "@/components/icons/TiktokIcon";

interface ContactPageClientProps {
  address: string;
  phone: string;
  email: string;
  hours: string;
  facebook: string;
  tiktok: string;
  imageUrl: string;
}

export default function ContactPageClient({ address, phone, email, hours, facebook, tiktok, imageUrl }: ContactPageClientProps) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const km = locale === "km";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    const result = await submitContactMessage(data);
    if (result.success) {
      toast.success(t("success"));
      reset();
    } else {
      toast.error(result.error ?? t("error"));
    }
  };

  const contactInfo = [
    { icon: MapPin, label: t("address"), value: address },
    { icon: Phone, label: t("phone"), value: phone },
    { icon: Mail, label: t("email"), value: email },
    { icon: Clock, label: t("working_hours"), value: hours },
  ];

  // Pinned to the school's actual verified location (resolved from its
  // Google Maps place link) rather than the free-text address setting,
  // which may just be a generic city name.
  const mapSrc = "https://www.google.com/maps?q=Kamrieng+High+School&ll=13.0855486,102.483699&z=17&output=embed";

  return (
    <div className="min-h-screen" style={{ background: "#f8f9ff" }}>
      {/* ── Hero ── */}
      <section
        className="pt-24 pb-24"
        style={{ background: "linear-gradient(135deg, #001f45 0%, #00376f 55%, #1e4e8c 100%)" }}
      >
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="font-khmer text-2xl md:text-3xl mb-3" style={{ color: "#fdbc13" }}>
            ទំនាក់ទំនងសាលារៀន
          </p>
          <h1 className={cn("text-4xl md:text-5xl font-bold text-white mb-5", km && "font-khmer")}>
            {t("title")}
          </h1>
          <p className={cn("text-base md:text-lg text-white/70 leading-relaxed", km && "font-khmer")}>
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* ── Quick info cards, floating over the hero edge ── */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-12 relative z-10">
          {contactInfo.map((info, i) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 flex items-start gap-3"
                style={{ boxShadow: "0px 8px 30px rgba(30,78,140,0.10)" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0,55,111,0.08)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#00376f" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs mb-1" style={{ color: "#8993a3" }}>
                    {info.label}
                  </p>
                  <p className={cn("text-sm font-semibold leading-snug break-words", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                    {info.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Image + Social / Form ── */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Campus image + social */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div
              className="relative rounded-2xl overflow-hidden flex-1 min-h-[280px]"
              style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
            >
              <Image
                src={resolveImageUrl(imageUrl)}
                alt={km ? "សាលារៀន" : "Our campus"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div
                className="absolute inset-x-0 bottom-0 p-5"
                style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,20,45,0.75) 100%)" }}
              >
                <p className={cn("text-white font-semibold text-lg", km && "font-khmer")}>
                  {km ? "ស្វាគមន៍មកកាន់សាលារៀន" : "Come visit our campus"}
                </p>
                <p className={cn("text-white/70 text-sm mt-0.5", km && "font-khmer")}>
                  {km ? "យើងរីករាយស្វាគមន៍ការចូលទស្សនារបស់អ្នក" : "We'd love to show you around in person"}
                </p>
              </div>
            </div>

            {/* Social */}
            <div
              className="bg-white rounded-2xl p-5"
              style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
            >
              <p className={cn("text-sm font-semibold mb-3", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
                {km ? "តាមដានយើងខ្ញុំ" : "Follow us"}
              </p>
              <div className="flex gap-3">
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: "#1877F2" }}
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: "#000000" }}
                >
                  <TiktokIcon className="w-4 h-4" />
                  TikTok
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-8"
            style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
          >
            <h2 className={cn("text-2xl font-bold mb-1", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {km ? "ផ្ញើសារមកយើង" : "Send us a message"}
            </h2>
            <p className={cn("text-sm mb-6", km && "font-khmer")} style={{ color: "#8993a3" }}>
              {km ? "យើងនឹងឆ្លើយតបក្នុងរយៈពេលដ៏ឆាប់រហ័ស" : "We'll get back to you as soon as possible"}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("name")} *</Label>
                  <Input id="name" {...register("name")} placeholder={km ? "ឈ្មោះ" : "John Doe"} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input id="phone" {...register("phone")} placeholder="+855 12 000 000" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t("email")} *</Label>
                <Input id="email" type="email" {...register("email")} placeholder="email@example.com" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">{t("subject")} *</Label>
                <Input id="subject" {...register("subject")} placeholder={km ? "ប្រធានបទ" : "Subject"} />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">{t("message")} *</Label>
                <Textarea
                  id="message"
                  {...register("message")}
                  placeholder={km ? "សាររបស់អ្នក..." : "Your message..."}
                  className="min-h-[120px]"
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-school-blue-800 hover:bg-school-blue-900"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? t("sending") : t("send")}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="container mx-auto px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h2 className={cn("text-2xl font-bold mb-1", km && "font-khmer")} style={{ color: "#0d1c2f" }}>
              {km ? "ទីតាំងសាលារៀន" : "Find us on the map"}
            </h2>
            <p className={cn("text-sm", km && "font-khmer")} style={{ color: "#8993a3" }}>
              {address}
            </p>
          </div>
          <div
            className="rounded-2xl overflow-hidden h-80 md:h-96"
            style={{ boxShadow: "0px 4px 20px rgba(30,78,140,0.07)" }}
          >
            <iframe
              src={mapSrc}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={km ? "ផែនទីទីតាំងសាលារៀន" : "School location map"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
