// src/pages/ManageEvent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePasses } from "../contexts/PassContext";
import {
  QrCode,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  User2,
  Ticket,
  Mail,
  // hamburger + palette bits
  Menu,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Plus,
  Settings,
  HelpCircle,
  Home as HomeIcon,
  CalendarDays,
} from "lucide-react";

export default function ManageEvent() {
  const { id } = useParams(); // route: /events/:id/manage
  const navigate = useNavigate();
  const { fetchParticipants } = usePasses();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("all"); // all | checked | pending
  const [q, setQ] = useState("");

  // details popup
  const [openUser, setOpenUser] = useState(null);

  // command palette
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const rows = await fetchParticipants(id);
      if (mounted) {
        setParticipants(rows || []);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, fetchParticipants]);

  const counts = useMemo(() => {
    const total = participants.length;
    const checked = participants.filter((p) => !!p.checkedIn).length;
    const pending = total - checked;
    return { total, checked, pending };
  }, [participants]);

  const filtered = useMemo(() => {
    let list = participants;
    if (tab === "checked") list = list.filter((p) => !!p.checkedIn);
    if (tab === "pending") list = list.filter((p) => !p.checkedIn);

    const term = q.trim().toLowerCase();
    if (!term) return list;

    return list.filter((p) => {
      const name =
        p.userSnapshot?.name ||
        [p.user?.fullname?.firstname, p.user?.fullname?.lastname]
          .filter(Boolean)
          .join(" ") ||
        "";
      const email = p.userSnapshot?.email || p.user?.email || "";
      const phone = p.userSnapshot?.phone || p.user?.phone || "";
      const code = p._id || "";
      return `${name} ${email} ${phone} ${code}`.toLowerCase().includes(term);
    });
  }, [participants, tab, q]);

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  // ----- Command palette -----
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
        icon: <Plus className="h-5 w-5" />,
        route: "/events/create",
        group: "Actions",
      },
      {
        title: "Scanner",
        desc: "Open the QR scanner",
        icon: <QrCode className="h-5 w-5" />,
        route: `/events/${id}/scan`,
        group: "Actions",
      },
      {
        title: "Settings",
        desc: "Profile & app preferences",
        icon: <Settings className="h-5 w-5" />,
        route: "/settings",
        group: "Navigation",
      },
      {
        title: "Help",
        desc: "FAQs and support",
        icon: <HelpCircle className="h-5 w-5" />,
        route: "/help",
        group: "Support",
      },
    ],
    [id]
  );

  const paletteLinks = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return baseLinks;
    return baseLinks.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.desc.toLowerCase().includes(q) ||
        l.group.toLowerCase().includes(q)
    );
  }, [cmdQuery, baseLinks]);

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

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background */}
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

      <div className="relative z-10 mx-auto w-[92%] max-w-[1100px] py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/events/${id}`)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to event
          </button>

          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            <span className="font-forum text-[#19cfbc]">Manage</span>{" "}
            <span className="text-white/85">Participants</span>
          </h1>

          <div className="flex items-center gap-2">
            <Link
              to={`/events/${id}/scan`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            >
              <QrCode className="h-4 w-4" /> Open Scanner
            </Link>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
              aria-label="Open Command Palette"
              title="Open quick navigation (Ctrl/⌘+K)"
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
                  placeholder="Search pages, actions…"
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

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/60">Total Registered</p>
            <p className="mt-1 text-2xl font-semibold">{counts.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/60">Checked-in</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-300">
              {counts.checked}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/60">Pending</p>
            <p className="mt-1 text-2xl font-semibold text-amber-300">
              {counts.pending}
            </p>
          </div>
        </div>

        {/* Search + Tabs */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-[260px] rounded-xl border border-white/10 bg-[#0c1222]/60 h-11 px-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-white/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Search name, email, phone, ticket id…"
              className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
            />
          </div>

          <div className="inline-flex rounded-xl border border-white/10 overflow-hidden">
            <button
              className={`px-3 h-11 text-sm ${
                tab === "all" ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
              } transition`}
              onClick={() => setTab("all")}
            >
              All Participants ({counts.total})
            </button>
            <button
              className={`px-3 h-11 text-sm ${
                tab === "checked"
                  ? "bg-white/10"
                  : "bg-white/5 hover:bg-white/10"
              } transition`}
              onClick={() => setTab("checked")}
            >
              Checked-in ({counts.checked})
            </button>
            <button
              className={`px-3 h-11 text-sm ${
                tab === "pending"
                  ? "bg-white/10"
                  : "bg-white/5 hover:bg-white/10"
              } transition`}
              onClick={() => setTab("pending")}
            >
              Pending ({counts.pending})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs text-white/60">
            <div className="col-span-4">Participant</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2">Ticket</div>
            <div className="col-span-2">Registered</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="py-10 text-center text-white/70">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-white/60">
                No participants found.
              </div>
            ) : (
              filtered.map((p) => {
                const name =
                  p.userSnapshot?.name ||
                  [p.user?.fullname?.firstname, p.user?.fullname?.lastname]
                    .filter(Boolean)
                    .join(" ") ||
                  "—";

                const email = p.userSnapshot?.email || p.user?.email || "—";
                const phone = p.userSnapshot?.phone || p.user?.phone || "—";
                const createdAt = p.createdAt || p.eventSnapshot?.start;
                const ticketId = p._id;
                const checked = !!p.checkedIn;

                return (
                  <button
                    key={ticketId}
                    onClick={() => setOpenUser(p)}
                    className="w-full text-left grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-white/5 focus:bg-white/10 transition"
                  >
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/10 grid place-items-center shrink-0">
                        <User2 className="h-4 w-4 text-white/80" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{name}</div>
                        <div className="text-xs text-white/60 truncate">
                          {email}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 text-white/80">
                      <div className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-sm">{phone}</span>
                      </div>
                    </div>

                    <div className="col-span-2 text-white/80">
                      <div className="inline-flex items-center gap-1">
                        <Ticket className="h-3.5 w-3.5" />
                        <span className="text-xs">
                          {ticketId?.substring(0, 10) + "..."}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 text-white/70">
                      <div className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-sm">{fmtDate(createdAt)}</span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center justify-end">
                        {checked ? (
                          <span className="inline-flex items-center gap-1 text-emerald-200 text-xs px-2 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Checked-in
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-200 text-xs px-2 py-1 rounded-full border border-amber-400/30 bg-amber-400/10">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-white/55">
          Tip: Use the <b>Open Scanner</b> button for live QR scanning (Ctrl/⌘+K
          → “Scanner”).
        </div>
      </div>

      {/* Participant Details Popup */}
      {openUser && (
        <UserDetailsCard
          userPass={openUser}
          onClose={() => setOpenUser(null)}
          fmtDate={fmtDate}
        />
      )}
    </div>
  );
}

/* ---------- Details Popup Card ---------- */
function UserDetailsCard({ userPass, onClose, fmtDate }) {
  const name =
    userPass.userSnapshot?.name ||
    [userPass.user?.fullname?.firstname, userPass.user?.fullname?.lastname]
      .filter(Boolean)
      .join(" ") ||
    "—";
  const email = userPass.userSnapshot?.email || userPass.user?.email || "—";
  const phone = userPass.userSnapshot?.phone || userPass.user?.phone || "—";
  const ticketId = userPass._id;
  const checked = !!userPass.checkedIn;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm grid place-items-center p-3">
      <div className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#0b1020]/95 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white/90">
            Participant Details
          </h3>
          <button
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 grid place-items-center shrink-0">
            <User2 className="h-5 w-5 text-white/80" />
          </div>
          <div className="min-w-0">
            <div className="text-white/90 font-medium text-lg truncate">
              {name}
            </div>
            <div className="mt-1 text-sm text-white/70 break-all">
              <div className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </div>
              <div className="mt-1 inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Ticket ID</p>
            <div className="mt-1 font-mono text-white/90 break-all">
              {ticketId}
            </div>
            <button
              className="mt-2 text-xs rounded-lg border border-white/10 bg-white/5 px-2 py-1 hover:bg-white/10"
              onClick={() => copy(ticketId)}
            >
              Copy
            </button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Status</p>
            {checked ? (
              <div className="mt-1 inline-flex items-center gap-1 text-emerald-200 text-xs px-2 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Checked-in
              </div>
            ) : (
              <div className="mt-1 inline-flex items-center gap-1 text-amber-200 text-xs px-2 py-1 rounded-full border border-amber-400/30 bg-amber-400/10">
                Pending
              </div>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/60">Registered At</p>
            <p className="mt-1 text-white/80">{fmtDate(userPass.createdAt)}</p>
          </div>
          {userPass.checkedInAt && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">Checked-in At</p>
              <p className="mt-1 text-white/80">
                {fmtDate(userPass.checkedInAt)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/events/${userPass.event || ""}/scan`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
          >
            <QrCode className="h-4 w-4" />
            Open Scanner
          </Link>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-3 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
