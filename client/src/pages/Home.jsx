// src/pages/Home.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  QrCode,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  LayoutGrid,
  ClipboardList,
  Ticket,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (path) => () => navigate(path);

  // Safely compute first initial
  const firstInitial = (
    user?.fullname.firstname?.trim?.()[0] ||
    user?.name?.trim?.()[0] ||
    user?.email?.trim?.()[0] ||
    "U"
  ).toUpperCase();

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

      {/* Content */}
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
              <span className="text-white/80">Home</span>
            </h1>
          </div>

          {/* Desktop nav + auth */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-4 text-sm text-white/80">
              <Link to="/events" className="hover:text-white transition">
                Events
              </Link>
              <Link to="/about" className="hover:text-white transition">
                About
              </Link>
              <Link to="/help" className="hover:text-white transition">
                Help
              </Link>
            </nav>

            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="py-2 px-3 rounded-lg border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-sm transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="relative h-9 w-9 rounded-full grid place-items-center text-[13px] font-semibold select-none transition active:scale-95"
                aria-label="Open dashboard"
              >
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#19cfbc]/25 to-blue-500/20 opacity-60" />
                <span className="relative h-9 w-9 rounded-full bg-[#0b1020]/70 border border-white/10 backdrop-blur-sm">
                  <span className="absolute inset-0 grid place-items-center text-white/90">
                    {firstInitial}
                  </span>
                </span>
              </button>
            )}
          </div>

          {/* Mobile: hamburger + (optional) avatar */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => navigate("/dashboard")}
                className="relative h-8 w-8 rounded-full grid place-items-center text-[12px] font-semibold select-none"
                aria-label="Open dashboard"
              >
                <span className="relative h-8 w-8 rounded-full bg-[#0b1020]/70 border border-white/10 backdrop-blur-sm">
                  <span className="absolute inset-0 grid place-items-center text-white/90">
                    {firstInitial}
                  </span>
                </span>
              </button>
            )}

            <button
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-8 md:mt-12 grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Platform
            </p>
            <h2 className="mt-2 text-[32px] md:text-[38px] leading-[1.1] font-semibold tracking-tight text-white/90">
              <span className="font-forum text-[#19cfbc]">SuperPass</span>
              <br />
              <span className="text-white/85">All-in-one event web app</span>
            </h2>
            <p className="mt-4 text-white/70 max-w-[52ch]">
              Create and publish events in minutes, accept secure payments,
              issue QR tickets, and manage check-ins — all from one modern
              interface.
            </p>

            {/* Quick actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={goTo("/events")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
              >
                <CalendarDays className="h-4 w-4" />
                View Events
                <ExternalLink className="h-4 w-4 opacity-70" />
              </button>
              <button
                onClick={goTo("/events/new")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </button>
              <button
                onClick={goTo("/scan")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
              >
                <QrCode className="h-4 w-4" />
                Scan Tickets
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="md:pl-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-5">
              <label htmlFor="search" className="sr-only">
                Search events
              </label>
              <div className="h-12 px-3 rounded-xl border border-white/10 bg-[#0c1222]/60 flex items-center gap-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search events, categories, or organizers…"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
                />
              </div>

              {/* Suggested quick filters */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {[
                  "Tech",
                  "Design",
                  "Workshops",
                  "College Fests",
                  "Conferences",
                ].map((t) => (
                  <button
                    key={t}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10 transition"
                    onClick={goTo(`/events?tag=${encodeURIComponent(t)}`)}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What you can do (overview cards) */}
        <section className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <OverviewCard
            icon={<ClipboardList className="h-5 w-5" />}
            title="Publish events fast"
            desc="Set up titles, schedules, pricing, and capacity — go live in minutes."
            cta="Create an event"
            onClick={goTo("/events/new")}
          />
          <OverviewCard
            icon={<Ticket className="h-5 w-5" />}
            title="Sell & verify tickets"
            desc="Accept secure payments and issue QR tickets. Scan at entry to prevent fraud."
            cta="Open ticketing"
            onClick={goTo("/events")}
          />
          <OverviewCard
            icon={<LayoutGrid className="h-5 w-5" />}
            title="Branded pages"
            desc="Customize cover images, colors and details to match your event identity."
            cta="See examples"
            onClick={goTo("/events?sort=featured")}
          />
          <OverviewCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Secure & reliable"
            desc="Built on modern MERN stack with safe payments and role-based access."
            cta="Learn more"
            onClick={goTo("/about")}
          />
          <OverviewCard
            icon={<Zap className="h-5 w-5" />}
            title="Effortless check-ins"
            desc="Lightning-fast QR scans with volunteer access for smooth entry."
            cta="Start scanning"
            onClick={goTo("/scan")}
          />
          <OverviewCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Discover events"
            desc="Browse upcoming conferences, workshops, and fests around you."
            cta="Explore events"
            onClick={goTo("/events")}
          />
        </section>

        {/* CTA banner */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">
              Ready to host your next event?
            </h3>
            <p className="text-sm text-white/70 mt-1">
              Create a listing, collect payments, and manage attendees in one
              place.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={goTo("/events/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
            >
              Learn more
              <ExternalLink className="h-4 w-4 opacity-70" />
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

      {/* ===== Mobile slide-out menu ===== */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />
      {/* Panel */}
      <aside
        className={`md:hidden fixed right-0 top-0 z-[61] h-full w-[78%] max-w-[360px] border-l border-white/10 bg-[#0b0f1a]/95 backdrop-blur-md transition-transform ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-500" />
            <span className="h-3 w-3 rounded bg-indigo-500" />
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
            <span className="ml-1 font-forum text-[#19cfbc] text-lg">
              SuperPass
            </span>
          </div>
          <button
            className="h-9 w-9 grid place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-4 py-4 text-sm">
          <MobileNavLink
            to="/events"
            onClick={() => setMobileOpen(false)}
            label="Events"
          />
          <MobileNavLink
            to="/about"
            onClick={() => setMobileOpen(false)}
            label="About"
          />
          <MobileNavLink
            to="/help"
            onClick={() => setMobileOpen(false)}
            label="Help"
          />
        </nav>

        <div className="px-4 py-3 border-t border-white/10">
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="h-10 rounded-lg border border-white/10 bg-white/5 grid place-items-center hover:bg-white/10 transition"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 grid place-items-center hover:from-blue-500 hover:to-indigo-500 transition"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full">
                  <span className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#19cfbc]/25 to-blue-500/20 opacity-60" />
                  <span className="relative h-9 w-9 rounded-full bg-[#0b1020]/70 border border-white/10 backdrop-blur-sm grid place-items-center text-sm">
                    {firstInitial}
                  </span>
                </div>
                <div className="text-xs">
                  <p className="text-white/90 font-medium leading-4">
                    {user?.firstName || user?.name || "User"}
                  </p>
                  <p className="text-white/60 leading-4">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/dashboard");
                }}
                className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs hover:bg-white/10 transition"
              >
                Dashboard
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

function MobileNavLink({ to, onClick, label }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-3 py-3 text-white/85 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition"
    >
      {label}
    </Link>
  );
}

function OverviewCard({ icon, title, desc, cta, onClick }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col">
      <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
        <span className="text-white/85">{icon}</span>
      </div>
      <h3 className="mt-3 font-medium text-white/90">{title}</h3>
      <p className="mt-1 text-sm text-white/70">{desc}</p>
      <div className="mt-3">
        <button
          onClick={onClick}
          className="text-sm text-white/85 inline-flex items-center gap-1 hover:text-white transition"
        >
          {cta} <ExternalLink className="h-4 w-4 opacity-70" />
        </button>
      </div>
    </div>
  );
}

export default Home;
