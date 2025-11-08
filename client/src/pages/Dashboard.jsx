// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User2,
  Mail,
  ShieldCheck,
  CalendarDays,
  Users,
  Ticket,
  QrCode,
  IndianRupee,
  BarChart3,
  Search,
  Settings,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Tag,
  Plus,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEvents } from "../contexts/EventContext";
import { usePasses } from "../contexts/PassContext"; // ✅ NEW: pulls purchased passes

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const { events, myEvents } = useEvents(); // fetched events
  const { passes, fetchMyPasses, loadingPasses } = usePasses(); // ✅ purchased passes
  useEffect(() => {
    fetchMyPasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------- Profile (safe) ---------
  const first =
    user?.fullname?.firstname || user?.firstName || user?.name || "";
  const last = user?.fullname?.lastname || user?.lastName || "";
  const name = [first, last].filter(Boolean).join(" ").trim() || "User";
  const avatarText =
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() ||
    (user?.email?.[0] || "U").toUpperCase();

  const profile = {
    id: user?._id,
    name,
    email: user?.email || "—",
    role: user?.role || "member",
    avatarText,
    joinedAt: user?.createdAt || new Date().toISOString(),
    verified: true,
  };

  const summary = {
    revenue: 0,
    ticketsSold: 0,
    checkins: 0,
    tokensIssued: 0,
  };

  // Hosted/Participated
  const eventsHosted = myEvents || [];
  const eventsParticipated = []; // placeholder

  // ✅ State
  const [tab, setTab] = useState("hosted");
  const [query, setQuery] = useState("");
  const [passesQuery, setPassesQuery] = useState(""); // ✅ separate search for passes

  // Map API event -> row shape dashboard expects
  const normalizeHosted = (ev) => {
    const id = ev._id || ev.id || ev.slug;
    const title = ev.title || "Untitled Event";
    const date = ev.start || ev.date || ev.createdAt;
    const venue =
      ev.venueName ||
      [ev.address, ev.city, ev.state].filter(Boolean).join(", ") ||
      ev.city ||
      "—";
    const price = Number(ev.isPaid ? ev.price || 0 : 0);
    const category = ev.category || "Event";
    const tickets = ev.capacity || 0; // if you have sales count, replace here
    const scans = 0; // replace with check-ins metric when available
    const status = (ev.status || "draft").toLowerCase();
    const statusLabel =
      status === "published"
        ? "Published"
        : status === "private"
        ? "Private"
        : "Draft";
    const tags = Array.isArray(ev.tags) ? ev.tags : [];

    return {
      id,
      title,
      date,
      venue,
      price,
      category,
      tickets,
      scans,
      status: statusLabel,
      tags,
    };
  };

  const hostedRows = useMemo(
    () => (eventsHosted || []).map(normalizeHosted),
    [eventsHosted]
  );

  const participatedRows = useMemo(() => {
    return (eventsParticipated || []).map((ev) => ({
      id: ev._id || ev.id,
      title: ev.title,
      date: ev.start || ev.date,
      venue:
        ev.venueName ||
        [ev.address, ev.city, ev.state].filter(Boolean).join(", ") ||
        ev.city ||
        "—",
      category: ev.category,
      ticketId: ev.ticketId || "—",
      checkedIn: !!ev.checkedIn,
    }));
  }, [eventsParticipated]);

  const currentList = useMemo(() => {
    const list = tab === "hosted" ? hostedRows : participatedRows;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((e) =>
      `${e.title} ${e.venue} ${e.category} ${(e.tags || []).join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }, [tab, query, hostedRows, participatedRows]);

  const fmtMoney = (n) =>
    `₹ ${Number(n || 0).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

  const fmtDate = (iso, withTime = true) =>
    new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });

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
      <div className="relative z-10 mx-auto w-[92%] max-w-[1200px] pb-28 pt-6 md:pt-10">
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
              <span className="text-white/80">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/events/create")}
              className="hidden md:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 grid place-items-center">
              <span className="text-xs text-white/80">
                {profile.avatarText}
              </span>
            </div>
          </div>
        </header>

        {/* profile card + key stats */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
                <User2 className="h-6 w-6 text-white/85" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium text-white/90">{profile.name}</h2>
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-white/70 inline-flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </div>
                <p className="mt-1 text-xs text-white/60">
                  Role: {profile.role} • Joined{" "}
                  {fmtDate(profile.joinedAt, false)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                to="/events/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-3 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
              >
                <Plus className="h-4 w-4" />
                New Event
              </Link>
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
              >
                <QrCode className="h-4 w-4" />
                Scan
              </Link>
            </div>
          </div>

          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={fmtMoney(summary.revenue)}
          />
          <StatCard
            icon={Ticket}
            label="Tickets Sold"
            value={Number(summary.ticketsSold).toLocaleString()}
          />
        </section>

        <section className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard
            icon={BarChart3}
            label="Check-ins"
            value={Number(summary.checkins).toLocaleString()}
          />
          <StatCard
            icon={QrCode}
            label="QR Validations"
            value={`${Math.round(
              (Number(summary.checkins) /
                Math.max(Number(summary.ticketsSold), 1)) *
                100
            )}%`}
          />
          <StatCard
            icon={Users}
            label="Tokens Issued"
            value={Number(summary.tokensIssued).toLocaleString()}
          />
        </section>

        {/* My Events */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h3 className="text-base md:text-lg font-semibold text-white/90">
              My Events
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="flex-1 min-w-[240px] rounded-xl border border-white/10 bg-[#0c1222]/60 h-11 px-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder={`Search ${
                    tab === "hosted" ? "hosted" : "participated"
                  } events…`}
                  className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
                />
              </div>
              <div className="inline-flex rounded-xl border border-white/10 overflow-hidden">
                <button
                  className={`px-3 h-11 text-sm ${
                    tab === "hosted"
                      ? "bg-white/10"
                      : "bg-white/5 hover:bg-white/10"
                  } transition`}
                  onClick={() => setTab("hosted")}
                >
                  Hosted
                </button>
                <button
                  className={`px-3 h-11 text-sm ${
                    tab === "participated"
                      ? "bg-white/10"
                      : "bg-white/5 hover:bg-white/10"
                  } transition`}
                  onClick={() => setTab("participated")}
                >
                  Participated
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            {currentList.map((ev) =>
              tab === "hosted" ? (
                <HostedRow
                  key={ev.id}
                  ev={ev}
                  onOpen={() => navigate(`/events/${ev.id}`)}
                />
              ) : (
                <ParticipatedRow
                  key={ev.id}
                  ev={ev}
                  onOpen={() => navigate(`/events/${ev.id}`)}
                />
              )
            )}
            {currentList.length === 0 && (
              <div className="py-10 text-sm text-white/60 text-center">
                {tab === "hosted"
                  ? "No hosted events yet. Create your first event!"
                  : "No participated events yet."}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white transition"
            >
              View all events <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* My Passes */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h3 className="text-base md:text-lg font-semibold text-white/90">
              My Passes
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="flex-1 min-w-[240px] rounded-xl border border-white/10 bg-[#0c1222]/60 h-11 px-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={passesQuery}
                  onChange={(e) => setPassesQuery(e.target.value)}
                  type="text"
                  placeholder="Search passes…"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
                />
              </div>
            </div>
          </div>

          {loadingPasses ? (
            <div className="py-10 text-sm text-white/60 text-center">
              Loading your passes…
            </div>
          ) : passes?.length ? (
            <div className="mt-4 divide-y divide-white/5">
              {passes
                .filter((p) =>
                  `${p.eventSnapshot?.title || ""} ${
                    p.eventSnapshot?.city || ""
                  }`
                    .toLowerCase()
                    .includes(passesQuery.trim().toLowerCase())
                )
                .map((p) => (
                  <div
                    key={p._id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {p.eventSnapshot?.title || "Event"}
                        </p>
                        {p.eventSnapshot?.category && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                            {p.eventSnapshot.category}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-200">
                          {p.status || "Active"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/70">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {p.eventSnapshot?.start
                            ? new Date(p.eventSnapshot.start).toLocaleString()
                            : "—"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {p.eventSnapshot?.city || "—"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {Number(p.eventSnapshot?.price || 0) > 0
                            ? p.eventSnapshot.price
                            : "Free"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Ticket className="h-3.5 w-3.5" />
                          {p.quantity || 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/my-passes/${p._id}`}
                        className="h-9 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-sm inline-flex items-center gap-1"
                      >
                        View Pass{" "}
                        <ExternalLink className="h-4 w-4 opacity-70" />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-10 text-sm text-white/60 text-center">
              You haven’t purchased any passes yet.
            </div>
          )}
        </section>

        {/* Tasks & Activity */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-base md:text-lg font-semibold text-white/90">
              Upcoming Tasks
            </h3>
            <ul className="mt-3 space-y-3">
              <Task title="Publish your next event" due="Soon" badge="Draft" />
              <Task
                title="Invite speakers & sponsors"
                due="This week"
                badge="Planning"
              />
              <Task
                title="Finalize volunteer roles"
                due="Next week"
                badge="Ops"
              />
            </ul>
            <div className="mt-3">
              <Link
                to="/tasks"
                className="inline-flex items-center gap-1 text-sm text-white/85 hover:text-white transition"
              >
                Open tasks <ExternalLink className="h-4 w-4 opacity-70" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-base md:text-lg font-semibold text-white/90">
              Recent Activity
            </h3>
            <ul className="mt-3 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-300 mt-0.5" />
                You created your account
                <span className="ml-auto text-xs text-white/50">Welcome!</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">
              Host your next event with SuperPass
            </h3>
            <p className="text-sm text-white/70 mt-1">
              Create listings, sell tickets, and manage check-ins with ease.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
            >
              View Events
            </Link>
          </div>
        </section>
      </div>

      {/* --- Sticky bottom action bar (Settings + Logout) --- */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[1200px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,.35)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-full">
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#19cfbc]/25 to-blue-500/20 opacity-60" />
                <span className="relative h-9 w-9 rounded-full bg-[#0b1020]/70 border border-white/10 backdrop-blur-sm grid place-items-center text-sm">
                  {profile.avatarText}
                </span>
              </div>
              <div className="text-xs">
                <p className="text-white/90 font-medium leading-4">
                  {profile.name}
                </p>
                <p className="text-white/60 leading-4">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/settings")}
                className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-sm inline-flex items-center gap-2 hover:bg-white/10 transition"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={logoutUser}
                className="h-10 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-sm inline-flex items-center gap-2 transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* --- /bottom bar --- */}
    </div>
  );
};

/* ---------- Small Components ---------- */

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between">
    <div>
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-lg md:text-xl font-semibold">{value}</p>
    </div>
    <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
      <Icon className="h-5 w-5 text-white/80" />
    </div>
  </div>
);

const HostedRow = ({ ev, onOpen }) => (
  <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <p className="font-medium">{ev.title}</p>
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
          {ev.category}
        </span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full border ${
            ev.status === "Published"
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : ev.status === "Private"
              ? "border-sky-400/30 bg-sky-400/10 text-sky-200"
              : "border-amber-400/30 bg-amber-400/10 text-amber-200"
          }`}
        >
          {ev.status}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/70">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />{" "}
          {new Date(ev.date).toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {ev.venue}
        </span>
        <span className="inline-flex items-center gap-1">
          <Ticket className="h-3.5 w-3.5" /> {ev.tickets} tickets
        </span>
        <span className="inline-flex items-center gap-1">
          <QrCode className="h-3.5 w-3.5" /> {ev.scans} check-ins
        </span>
        <span className="inline-flex items-center gap-1">
          <IndianRupee className="h-3.5 w-3.5" />{" "}
          {ev.price > 0 ? ev.price : "Free"}
        </span>
      </div>
      {ev.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ev.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-white/10 bg-[#0b1020]/40"
            >
              <Tag className="h-3 w-3" /> {t}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className="flex items-center gap-2">
      <Link
        to={`/events/${ev.id}/tickets`}
        className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm inline-flex items-center gap-1"
      >
        Manage
      </Link>
      <button
        onClick={onOpen}
        className="h-9 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-sm inline-flex items-center gap-1"
      >
        Open <ExternalLink className="h-4 w-4 opacity-70" />
      </button>
    </div>
  </div>
);

const ParticipatedRow = ({ ev, onOpen }) => (
  <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
    <div className="flex-1">
      <p className="font-medium">{ev.title}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/70">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />{" "}
          {new Date(ev.date).toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {ev.venue}
        </span>
        <span className="inline-flex items-center gap-1">
          <Ticket className="h-3.5 w-3.5" /> {ev.ticketId}
        </span>
        <span
          className={`inline-flex items-center gap-1 ${
            ev.checkedIn ? "text-emerald-300" : "text-white/60"
          }`}
        >
          <QrCode className="h-3.5 w-3.5" />{" "}
          {ev.checkedIn ? "Checked-in" : "Not scanned"}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onOpen}
        className="h-9 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-sm inline-flex items-center gap-1"
      >
        View <ExternalLink className="h-4 w-4 opacity-70" />
      </button>
    </div>
  </div>
);

const Task = ({ title, due, badge }) => (
  <li className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3">
    <div className="flex items-center justify-between">
      <p className="text-sm text-white/85">{title}</p>
      <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
        {badge}
      </span>
    </div>
    <p className="mt-1 text-xs text-white/60">Due {due}</p>
  </li>
);

export default Dashboard;
