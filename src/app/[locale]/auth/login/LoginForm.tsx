"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  backgroundImageUrl: string;
}

export default function LoginForm({ backgroundImageUrl }: LoginFormProps) {
  const { signInWithEmail, resetPassword, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const redirect = searchParams.get("redirect") ?? `/${locale}/admin`;

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [user, loading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmail(email, password, rememberMe);
      router.replace(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password") || msg.includes("user-not-found")) {
        setError("Invalid email or password.");
      } else if (msg.includes("No account found")) {
        setError("No admin account found for this email.");
      } else if (msg.includes("deactivated")) {
        setError("Your account has been deactivated. Contact an administrator.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError("");
    setSubmitting(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send reset email";
      setError(msg.includes("user-not-found") ? "No account found for this email." : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: "login" | "reset") => {
    setMode(next);
    setError("");
    setResetSent(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1b38]">
        <Loader2 className="w-8 h-8 animate-spin text-white/70" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#0d1b38]">
      {/* Background photo */}
      {backgroundImageUrl && (
        <Image
          src={backgroundImageUrl}
          alt=""
          fill
          priority
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b38]/55 via-[#0d1b38]/30 to-[#0d1b38]/65" />
      <div className="absolute inset-0 bg-gradient-to-tr from-school-blue-900/25 via-transparent to-transparent" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl p-8 border border-white/40"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            boxShadow: "0px 24px 60px rgba(13,27,56,0.35)",
          }}
        >
          {/* Logo + header */}
          <div className="text-center mb-7">
            <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-white shadow-sm">
              <Image src="/images/logo/logo.png" alt="School logo" fill className="object-cover" sizes="64px" />
            </div>
            <h1 className="font-khmer-title text-2xl md:text-3xl" style={{ color: "#00376f" }}>
              {process.env.NEXT_PUBLIC_SCHOOL_NAME_KM}
            </h1>
            <p className="font-normal text-base mt-1" style={{ color: "#8892a0" }}>
              {process.env.NEXT_PUBLIC_SCHOOL_NAME_EN ?? "School Management"}
            </p>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase mt-2" style={{ color: "#9aa3b4" }}>
              {mode === "login" ? "Management System Login" : "Reset Your Password"}
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: "#fef2f2", color: "#dc2626" }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {mode === "reset" ? (
            resetSent ? (
              <div className="text-center py-2">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#ecfdf5" }}
                >
                  <CheckCircle2 className="w-6 h-6" style={{ color: "#059669" }} />
                </div>
                <p className="text-sm mb-6" style={{ color: "#434750" }}>
                  If an account exists for <strong>{email}</strong>, a password reset link has been sent.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-sm font-semibold"
                  style={{ color: "#00376f" }}
                >
                  Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium mb-1.5" style={{ color: "#434750" }}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9aa3b4" }} />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: "#e0e6f0", color: "#0d1c2f", background: "#fafbff" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#00376f")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e6f0")}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !email}
                  className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#00376f", color: "#fff" }}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="w-full text-center text-sm font-medium pt-1"
                  style={{ color: "#8892a0" }}
                >
                  Back to login
                </button>
              </form>
            )
          ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "#434750" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9aa3b4" }} />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: "#e0e6f0", color: "#0d1c2f", background: "#fafbff" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#00376f")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e6f0")}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-sm font-medium" style={{ color: "#434750" }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode("reset")}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: "#00376f" }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9aa3b4" }} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-11 pl-10 pr-11 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: "#e0e6f0", color: "#0d1c2f", background: "#fafbff" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#00376f")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e6f0")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "#8892a0" }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "#00376f" }}
                  />
                  <span className="text-sm" style={{ color: "#434750" }}>
                    Remember me on this device
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !email || !password}
                  className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 group"
                  style={{ background: "#00376f", color: "#fff" }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#002d5a"; }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#00376f"; }}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Login
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center gap-5 mt-7 pt-5 border-t" style={{ borderColor: "#eef1f7" }}>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-school-blue-800"
              style={{ color: "#8892a0" }}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Support
            </Link>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-school-blue-800"
              style={{ color: "#8892a0" }}
            >
              <Info className="w-3.5 h-3.5" />
              About Portal
            </Link>
          </div>
          <p className="text-center text-[11px] mt-3" style={{ color: "#c0c8d4" }}>
            For authorized school staff only
          </p>
        </div>

        <p className="text-center text-xs mt-4 text-white/60">
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SCHOOL_NAME_EN}
        </p>
      </div>
    </div>
  );
}
