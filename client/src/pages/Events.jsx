// src/pages/Events.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CalendarDays,
  MapPin,
  IndianRupee,
  Tag,
  Filter,
  ArrowRight,
  Menu,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Ticket,
  QrCode,
  Plus,
  Settings,
  HelpCircle,
  Home as HomeIcon,
  ArrowLeft,
} from "lucide-react";
import { useEvents } from "../contexts/EventContext";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";

const CATEGORIES = [
  "All",
  "Conference",
  "Workshop",
  "Hackathon",
  "College Fest",
  "Meetup",
  "Webinar",
  "Competition",
];

const Events = () => {
  const navigate = useNavigate();
  const { events, loading, fetchEvents } = useEvents();
  const { isAuthenticated } = useAuth();

  // list filters
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [paidOnly, setPaidOnly] = useState(false);

  // command palette
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Command Palette Links (same model as Home) ----------
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
        title: "My Passes",
        desc: "View tickets you purchased",
        icon: <Ticket className="h-5 w-5" />,
        route: "/my-passes",
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
        icon: <Plus className="h-5 w-5" />,
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

  // keyboard shortcuts for command palette
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

  // ---------- List results ----------
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (
      (events || [])
        // Only published events (fallback to published if missing)
        .filter((ev) => {
          const status = String(ev.status || "").toLowerCase();
          return status === "" || status === "published";
        })
        // client filters
        .filter((ev) => {
          const okCat = category === "All" || ev.category === category;
          const price = Number(ev.price || 0);
          const okPaid = !paidOnly || price > 0;
          const haystack = [
            ev.title,
            ev.subtitle,
            ev.venueName,
            ev.city,
            ev.category,
            (ev.tags || []).join(" "),
            ev.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          const okText = !q || haystack.includes(q);
          return okCat && okPaid && okText;
        })
        .sort(
          (a, b) =>
            new Date(a.start || a.date || 0) - new Date(b.start || b.date || 0)
        )
    );
  }, [events, query, category, paidOnly]);

  const goDetails = (id) => () => navigate(`/events/${id}`);

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
        {/* Header (Home link removed) */}
        <div className="flex items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
              title="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">SuperPass</span>{" "}
              <span className="text-white/80">Events</span>
            </h1>
          </div>

          {/* Right: Create Event + Hamburger (opens command palette) */}
          <div className="flex items-center gap-2">
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <Plus className="h-4 w-4" />
              Create Event
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

        {/* Command Palette (shared with Home) */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[10vh]">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />
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

        {/* Search + Filters (list controls) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search input for events list */}
          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm h-12 px-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-white/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search events, tags, or venues…"
              className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
              aria-label="Search events"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 px-3 flex items-center">
              <Filter className="h-4 w-4 text-white/60 mr-2" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-white/85"
                aria-label="Filter by category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0b0f1a]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setPaidOnly((p) => !p)}
              className={`h-12 px-3 rounded-xl border text-sm transition
                ${
                  paidOnly
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              title="Show paid events only"
              aria-pressed={paidOnly}
            >
              Paid only
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10">
            <Loader />
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((ev) => {
              const cover =
                ev.bannerUrl || ev.banner?.secure_url || ev.cover || null;
              const when = fmtDate(ev.start || ev.date);
              const where = ev.venueName || ev.venue || ev.city || "—";
              const price = Number(ev.price || 0);
              const logo = ev.logoUrl || ev.logo?.secure_url || ev.logo || null;

              return (
                <article
                  key={ev._id || ev.id}
                  onClick={goDetails(ev._id || ev.id)}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:bg-white/10 transition"
                >
                  {/* Cover */}
                  <div className="h-32 relative bg-gradient-to-br from-[#0f1530] to-[#142146]">
                    {cover ? (
                      <img
                        src={cover}
                        alt={ev.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center">
                        <span className="text-xs text-white/55">
                          Event Cover
                        </span>
                      </div>
                    )}

                    {/* tiny logo chip */}
                    {logo && (
                      <div className="absolute bottom-2 left-2 h-8 w-8 rounded-lg overflow-hidden border border-white/15 bg-black/30 backdrop-blur">
                        <img
                          src={logo}
                          alt="logo"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <h3 className="font-medium text-white/90 line-clamp-1">
                      {ev.title}
                    </h3>
                    {ev.subtitle && (
                      <p className="mt-0.5 text-xs text-white/60 line-clamp-1">
                        {ev.subtitle}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-white/70 line-clamp-2">
                      {ev.description || "Discover details and register now."}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70">
                      <div className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {when}
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {where}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <IndianRupee className="h-4 w-4" />
                        {price > 0 ? price : "Free"}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                        {ev.category || "Event"}
                      </span>
                    </div>

                    {/* Tags */}
                    {!!(ev.tags || []).length && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(ev.tags || []).slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-white/10 bg-[#0b1020]/40"
                          >
                            <Tag className="h-3 w-3" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-4">
                      <button
                        onClick={goDetails(ev._id || ev.id)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
                        aria-label={`View details for ${ev.title}`}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        View details
                        <ArrowRight className="h-4 w-4 opacity-90" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {!results.length && (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                No events match your search. Try different filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
