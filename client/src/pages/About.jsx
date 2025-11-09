import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  QrCode,
  CreditCard,
  Users,
  Rocket,
  CalendarDays,
  Layers,
  Zap,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Cpu,
  Database,
  GitBranch,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function About() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const first =
    user?.fullname?.firstname || user?.firstName || user?.name || "";
  const last = user?.fullname?.lastname || user?.lastName || "";
  const avatarText =
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() ||
    (user?.email?.[0] || "U").toUpperCase();

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(900px_420px_at_84%_-10%,rgba(64,131,255,0.22),transparent_60%),radial-gradient(780px_360px_at_-18%_12%,rgba(0,174,255,0.12),transparent_60%)]" />
      <div
        aria-hidden="true"
        className="fixed right-[-14%] top-[-22%] w-[86%] h-[68%] opacity-45 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(120,150,255,.14) 0 1px, transparent 1px 32px),repeating-linear-gradient(90deg, rgba(120,150,255,.14) 0 1px, transparent 1px 32px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(72% 72% at 100% 0%, black 38%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(72% 72% at 100% 0%, black 38%, transparent 100%)",
        }}
      />

      {/* Content shell */}
      <div className="relative z-10 mx-auto w-[92%] max-w-[1100px] py-6 md:py-10">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-blue-500" />
              <span className="h-3 w-3 rounded bg-indigo-500" />
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">SuperPass</span>{" "}
              <span className="text-white/80">About</span>
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            >
              <CalendarDays className="h-4 w-4" />
              Events
            </Link>
            <Link
              to="/my-passes"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            >
              <QrCode className="h-4 w-4" />
              Passes
            </Link>
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-3 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <Rocket className="h-4 w-4" />
              Create Event
            </Link>

            {isAuthenticated && (
              <button
                onClick={() => navigate("/dashboard")}
                className="relative h-9 w-9 rounded-full grid place-items-center text-[13px] font-semibold select-none transition active:scale-95"
                aria-label="Open dashboard"
              >
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#19cfbc]/25 to-blue-500/20 opacity-60" />
                <span className="relative h-9 w-9 rounded-full bg-[#0b1020]/70 border border-white/10 backdrop-blur-sm">
                  <span className="absolute inset-0 grid place-items-center text-white/90">
                    {avatarText}
                  </span>
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="mt-8 md:mt-12 grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Our Mission
            </p>
            <h2 className="mt-2 text-[32px] md:text-[38px] leading-[1.1] font-semibold tracking-tight text-white/90">
              <span className="font-forum text-[#19cfbc]">SuperPass</span>
              <br />
              <span className="text-white/85">
                The fastest way to host events, sell tickets, and check in.
              </span>
            </h2>
            <p className="mt-4 text-white/70 max-w-[60ch]">
              SuperPass streamlines the entire event lifecycle—creation,
              payments, QR ticketing, and on-ground scanning—into one elegant,
              reliable web app. Built with a modern MERN stack and designed for
              speed, clarity, and delight.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/events/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
              >
                <Rocket className="h-4 w-4" />
                Create your first event
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
              >
                <ShieldCheck className="h-4 w-4" />
                Get Help
              </Link>
            </div>
          </div>

          {/* Feature bullets */}
          <div className="md:pl-6 grid gap-3">
            {[
              {
                icon: <CalendarDays className="h-5 w-5" />,
                title: "Create & publish fast",
                desc: "Set up titles, schedules, pricing, and capacity in minutes.",
              },
              {
                icon: <CreditCard className="h-5 w-5" />,
                title: "Secure payments",
                desc: "Integrated with Razorpay test/live modes for seamless checkout.",
              },
              {
                icon: <QrCode className="h-5 w-5" />,
                title: "QR tickets",
                desc: "Issue themed, branded QR passes that are hard to forge.",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Lightning check-ins",
                desc: "Camera scanning + manual code entry with instant validation.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-start gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
                  <span className="text-white/85">{f.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-white/90">{f.title}</p>
                  <p className="text-sm text-white/70 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base md:text-lg font-semibold text-white/90 inline-flex items-center gap-2">
              <Layers className="h-5 w-5" />
              How SuperPass Works
            </h3>
            <Link
              to="/events"
              className="text-sm text-white/85 hover:text-white inline-flex items-center gap-1"
            >
              Explore events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "1) Create",
                desc: "Add details, set schedule, choose ticket style.",
              },
              {
                title: "2) Sell",
                desc: "Enable payments (or free passes) and share the link.",
              },
              {
                title: "3) Issue",
                desc: "Users purchase; QR passes are generated instantly.",
              },
              {
                title: "4) Check-in",
                desc: "Scan at entry, view attendance and validation logs.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-4"
              >
                <p className="font-medium text-white/90">{s.title}</p>
                <p className="text-sm text-white/70 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech & Security */}
        <section className="mt-6 grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-white/90 inline-flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Tech Stack
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Frontend: React, Tailwind, Lucide Icons
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Backend: Node.js, Express, Mongoose
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Database: MongoDB (Atlas/local)
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Payments: Razorpay (test/live)
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                QR Scanning: html5-qrcode + secure signed payloads
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-white/90 inline-flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Security & Reliability
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-300" />
                Signed QR payloads to prevent tampering and reuse
              </li>
              <li className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-300" />
                Server-side verification of payments and check-ins
              </li>
              <li className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-300" />
                Role-based access so only event owners can scan/manage
              </li>
            </ul>
          </div>
        </section>

        {/* Roadmap / Credits */}
        <section className="mt-6 grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-white/90 inline-flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Roadmap
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li>• Team invites with granular scanning permissions</li>
              <li>• Promo codes & tiered ticketing</li>
              <li>• Analytics dashboard (revenue, conversion, check-ins)</li>
              <li>• Email & WhatsApp notifications</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-white/90 inline-flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Credits
            </h3>
            <p className="text-sm text-white/75 mt-2">
              Crafted with care for modern event teams. Icons by Lucide. Built
              on the MERN stack. Performance-first UI with a cohesive dark
              theme.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">
              Ready to host your next event with SuperPass?
            </h3>
            <p className="text-sm text-white/70 mt-1">
              Create a listing, sell tickets, and manage check-ins in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <Rocket className="h-4 w-4" />
              Create Event
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
            >
              Get Help <ExternalLink className="h-4 w-4 opacity-70" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 pb-8 text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} SuperPass</span>
            <span className="opacity-40">•</span>
            <Link to="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <span className="opacity-40">•</span>
            <Link to="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <span className="opacity-40">•</span>
            <Link to="/help" className="hover:text-white transition">
              Help
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
