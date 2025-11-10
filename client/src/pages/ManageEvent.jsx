// src/pages/ManageEvent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Menu,
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  QrCode,
  LayoutGrid,
  Ticket as TicketIcon,
  Settings,
  HelpCircle,
  Home as HomeIcon,
  X,
  User2,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Clock4,
  Filter,
} from "lucide-react";
import Loader from "../components/Loader";
import { useEvents } from "../contexts/EventContext";
import { useAuth } from "../contexts/AuthContext";

const TABS = ["All", "Checked-in", "Pending"];

export default function ManageEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { singleEvent, loading, fetchEventById } = useEvents();
  const { isAuthenticated } = useAuth();

  // fetch event (for title + registrations/attendees embedded)
  useEffect(() => {
    fetchEventById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Command palette
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // UI state
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // ----- palette items -----
  const baseLinks = useMemo(
    () => [
      {
        title: "Home",
        desc: "Back to the homepage",
        icon: <HomeIcon className="h-5 w-5" />,
        route: "/",
        group: "Navigation",
      },
      {
        title: "Dashboard",
        desc: "Creator control center",
        icon: <LayoutGrid className="h-5 w-5" />,
        route: "/dashboard",
        group: "Navigation",
        auth: true,
      },
      {
        title: "Events",
        desc: "Browse all events",
        icon: <CalendarDays className="h-5 w-5" />,
        route: "/events",
        group: "Navigation",
      },
      {
        title: "Create Event",
        desc: "Publish a new event",
        icon: <QrCode className="h-5 w-5 rotate-90" />,
        route: "/events/create",
        group: "Actions",
        auth: true,
      },
      {
        title: "Scan Tickets",
        desc: "Open QR scanner",
        icon: <QrCode className="h-5 w-5" />,
        route: "/scan",
        group: "Actions",
        auth: true,
      },
      {
        title: "Settings",
        desc: "Profile & app preferences",
        icon: <Settings className="h-5 w-5" />,
        route: "/settings",
        group: "Navigation",
        auth: true,
      },
      {
        title: "Help",
        desc: "FAQs and support",
        icon: <HelpCircle className="h-5 w-5" />,
        route: "/help",
        group: "Support",
      },
    ],
    []
  );

  const paletteLinks = useMemo(() => {
    const list = baseLinks.filter((l) => (l.auth ? isAuthenticated : true));
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.desc.toLowerCase().includes(q) ||
        l.group.toLowerCase().includes(q)
    );
  }, [baseLinks, isAuthenticated, cmdQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((v) => !v);
        return;
      }
      if (!isSearchOpen) return;

      if (e.key === "Escape") {
        setIsSearchOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((p) => (p + 1) % Math.max(paletteLinks.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (p) =>
            (p - 1 + Math.max(paletteLinks.length, 1)) %
            Math.max(paletteLinks.length, 1)
        );
      } else if (e.key === "Enter") {
        const item = paletteLinks[selectedIndex];
        if (item) {
          navigate(item.route);
          setIsSearchOpen(false);
          setCmdQuery("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, paletteLinks, selectedIndex, navigate]);

  // ----- data plumbing: registrations -----
  const ev = singleEvent;
  const registrationsRaw = useMemo(() => {
    // Try several possible shapes from your backend
    // Prefer registrations array; fallback to attendees; fallback empty
    const arr =
      ev?.registrations ||
      ev?.attendees ||
      ev?.tickets ||
      ev?.participants ||
      [];
    // normalize items into a common shape
    return (arr || []).map((r, idx) => ({
      id: r._id || r.id || r.ticketId || `r-${idx}`,
      name:
        r.name ||
        r.fullName ||
        [r.firstName, r.lastName].filter(Boolean).join(" ") ||
        r.user?.fullname ||
        r.user?.name ||
        "Participant",
      email: r.email || r.user?.email || "",
      phone: r.phone || r.user?.phone || r.contact || "",
      city: r.city || r.user?.city || ev?.city || "",
      checkedIn:
        typeof r.checkedIn === "boolean"
          ? r.checkedIn
          : !!(r.status && String(r.status).toLowerCase().includes("check")),
      purchasedAt: r.createdAt || r.purchasedAt || r.registeredAt || null,
      ticketCode: r.code || r.ticketCode || r.qrCode || r.ticketId || "",
      meta: r, // keep original for the modal
    }));
  }, [ev]);

  // local filter/search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = registrationsRaw;

    if (activeTab === "Checked-in") list = list.filter((x) => x.checkedIn);
    if (activeTab === "Pending") list = list.filter((x) => !x.checkedIn);

    if (!q) return list;
    return list.filter((x) => {
      const hay = [x.name, x.email, x.phone, x.city, x.ticketCode, x.meta?.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [registrationsRaw, activeTab, query]);

  const counts = useMemo(() => {
    const total = registrationsRaw.length;
    const inCount = registrationsRaw.filter((r) => r.checkedIn).length;
    const pending = total - inCount;
    return { total, inCount, pending };
  }, [registrationsRaw]);

  // ----- render -----
  if (loading) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* background */}
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

      {/* content */}
      <div className="relative z-10 mx-auto w-[92%] max-w-[1100px] py-6 md:py-10">
        {/* top bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-sm text-white/60">/</span>
            <h1 className="text-base md:text-lg font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">
                {ev?.title || "Event"}
              </span>{" "}
              <span className="text-white/80">Manage</span>
            </h1>
          </div>

          {/* right controls: scan + palette hamburger */}
          <div className="flex items-center gap-2">
            <Link
              to={`/events/${id}/scan`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
              title="Open QR scanner"
            >
              <QrCode className="h-4 w-4" />
              Scan
            </Link>
            <button
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open Command Palette"
              title="Quick navigation (Ctrl/⌘+K)"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Command Palette */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[10vh]">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />
            {/* panel */}
            <div className="relative w-[92%] max-w-[720px] rounded-2xl border border-white/10 bg-[#0b0f1a]/95 shadow-[0_20px_60px_rgba(0,0,0,.55)]">
              {/* search input */}
              <div className="flex items-center gap-3 px-4 sm:px-5 h-14 border-b border-white/10">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center">
                  <Search className="h-4 w-4 text-white/70" />
                </div>
                <input
                  autoFocus
                  value={cmdQuery}
                  onChange={(e) => {
                    setCmdQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="w-full bg-transparent outline-none text-sm sm:text-base placeholder:text-white/50"
                  type="text"
                  placeholder="Search pages, actions, or type ? for help…"
                />
                <button
                  className="text-[#99A1AF] flex items-center gap-2 text-xs"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <span className="bg-[#141720] rounded px-2 py-1">esc</span>
                  <X size={18} />
                </button>
              </div>

              {/* results */}
              <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5">
                {paletteLinks.length === 0 ? (
                  <div className="p-5 text-sm text-white/60">No matches.</div>
                ) : (
                  <div className="p-1">
                    {paletteLinks.map((link, idx) => {
                      const active = idx === selectedIndex;
                      return (
                        <button
                          key={`${link.route}-${idx}`}
                          onClick={() => {
                            navigate(link.route);
                            setIsSearchOpen(false);
                            setCmdQuery("");
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl transition select-none flex items-center justify-between ${
                            active
                              ? "bg-white/10 border border-white/10"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-[#252528] grid place-items-center">
                              {link.icon}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {link.title}
                              </div>
                              <div className="text-xs text-white/60">
                                {link.desc}
                              </div>
                            </div>
                          </div>
                          <div className="text-[11px] bg-[#141720] px-2 py-1 rounded-md text-white/60">
                            {link.group}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* footer shortcuts */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-white/10 text-[#99A1AF]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="bg-[#141720] p-1.5 rounded">
                      <ArrowUp size={14} />
                    </span>
                    <span className="bg-[#141720] p-1.5 rounded">
                      <ArrowDown size={14} />
                    </span>
                    <span className="ml-1 text-xs">navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-[#141720] p-1.5 rounded">
                      <CornerDownLeft size={14} />
                    </span>
                    <span className="ml-1 text-xs">select</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="bg-[#141720] px-1.5 py-1 rounded text-[11px]">
                      ⌘/Ctrl
                    </span>
                    <span className="bg-[#141720] px-1.5 py-1 rounded text-[11px]">
                      K
                    </span>
                    <span className="ml-1 text-xs">toggle</span>
                  </div>
                </div>
                <span className="text-xs">@SuperPass</span>
              </div>
            </div>
          </div>
        )}

        {/* header strip with stats */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              <div className="text-sm">
                <div className="text-white/85 font-medium">
                  Participants Overview
                </div>
                <div className="text-white/60 text-xs">
                  {counts.total} total • {counts.inCount} checked-in •{" "}
                  {counts.pending} pending
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* search users */}
              <div className="h-10 px-3 rounded-xl border border-white/10 bg-[#0c1222]/60 flex items-center gap-2">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search name, email, phone, ticket…"
                  className="w-[220px] md:w-[280px] bg-transparent outline-none text-sm placeholder:text-white/50"
                  aria-label="Search participants"
                />
              </div>
              {/* dumb filter placeholder (kept for parity) */}
              <div className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-white/80 text-sm inline-flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </div>
            </div>
          </div>

          {/* tabs */}
          <div className="mt-4 flex items-center gap-2">
            {TABS.map((t) => {
              const active = activeTab === t;
              const count =
                t === "All"
                  ? counts.total
                  : t === "Checked-in"
                  ? counts.inCount
                  : counts.pending;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`h-9 px-3 rounded-lg border text-xs transition ${
                    active
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {t} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* list */}
        <section className="mt-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              No participants match your filters.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((u) => (
                <article
                  key={u.id}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:bg-white/10 transition"
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="p-4">
                    {/* header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center shrink-0">
                          <User2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white/90 truncate">
                            {u.name}
                          </div>
                          <div className="text-xs text-white/60 truncate">
                            {u.email || "—"}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full border ${
                          u.checkedIn
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                            : "border-white/10 bg-white/5 text-white/70"
                        }`}
                      >
                        {u.checkedIn ? "Checked-in" : "Pending"}
                      </span>
                    </div>

                    {/* body */}
                    <div className="mt-3 space-y-1.5 text-xs text-white/70">
                      {u.phone && (
                        <div className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {u.phone}
                        </div>
                      )}
                      <div className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {u.city || "—"}
                      </div>
                      {u.ticketCode && (
                        <div className="inline-flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4" />
                          {u.ticketCode}
                        </div>
                      )}
                      {u.purchasedAt && (
                        <div className="inline-flex items-center gap-2">
                          <Clock4 className="h-4 w-4" />
                          {new Date(u.purchasedAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* footer */}
                    <div className="mt-3">
                      <button
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 h-9 text-xs hover:bg-white/10 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(u);
                        }}
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Participant modal */}
      {selectedUser && (
        <ParticipantModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

/* -------------------- Modal -------------------- */
function ParticipantModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm grid place-items-center p-3">
      <div className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#0b0f1a]/95">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
              <User2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-white/90 font-medium">{user.name}</div>
              {user.ticketCode && (
                <div className="text-[11px] text-white/60">
                  Ticket: {user.ticketCode}
                </div>
              )}
            </div>
          </div>
          <button
            className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-sm">
          <Row
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={user.email || "—"}
          />
          <Row
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={user.phone || "—"}
          />
          <Row
            icon={<MapPin className="h-4 w-4" />}
            label="City"
            value={user.city || "—"}
          />
          <Row
            icon={<Clock4 className="h-4 w-4" />}
            label="Registered"
            value={
              user.purchasedAt
                ? new Date(user.purchasedAt).toLocaleString()
                : "—"
            }
          />
          <Row
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Status"
            value={user.checkedIn ? "Checked-in" : "Pending"}
            chip={true}
            checked={user.checkedIn}
          />

          {/* raw meta preview (collapsed look) */}
          {user.meta && (
            <details className="rounded-xl border border-white/10 bg-white/5">
              <summary className="cursor-pointer list-none px-3 py-2 text-white/80 text-xs">
                View all submission fields
              </summary>
              <pre className="overflow-x-auto p-3 text-[11px] text-white/70">
                {JSON.stringify(user.meta, null, 2)}
              </pre>
            </details>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-end gap-2">
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            onClick={onClose}
          >
            <QrCode className="h-4 w-4" />
            Scan
          </Link>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value, chip = false, checked = false }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white/80">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      {chip ? (
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full border ${
            checked
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
              : "border-white/10 bg-white/5 text-white/70"
          }`}
        >
          {value}
        </span>
      ) : (
        <span className="text-xs text-white/85">{value}</span>
      )}
    </div>
  );
}
