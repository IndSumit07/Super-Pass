// src/pages/EventDetails.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  IndianRupee,
  ArrowLeft,
  Users,
  Clock,
  Tag,
  Building2,
  Link2,
  Pencil,
  Trash2,
  Upload,
  X,
  Check,
  QrCode,
  Ticket as TicketIcon,
  // NEW for command palette/hamburger
  Menu,
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Plus,
  Settings,
  HelpCircle,
  Home as HomeIcon,
} from "lucide-react";
import { useEvents } from "../contexts/EventContext";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";

/* ---------- Ticket Templates (same palette/shape keys as Create flow) ---------- */
const TEMPLATES = [
  {
    key: "classic",
    name: "Classic",
    palette: {
      bg: "#0b1020",
      card: "#11172c",
      accent: "#19cfbc",
      text: "#ffffff",
    },
    layout: "left-logo-right-qr",
    cornerStyle: "rounded-xl",
  },
  {
    key: "gradient",
    name: "Gradient",
    palette: {
      bg: "#0b0f1a",
      card: "linear-gradient(135deg,#1a2a6c,#b21f1f,#fdbb2d)",
      accent: "#ffffff",
      text: "#ffffff",
    },
    layout: "split-qr",
    cornerStyle: "rounded-2xl",
  },
  {
    key: "minimal",
    name: "Minimal",
    palette: {
      bg: "#0c0c0f",
      card: "#121212",
      accent: "#7dd3fc",
      text: "#e5e7eb",
    },
    layout: "stacked",
    cornerStyle: "rounded-lg",
  },
  {
    key: "neon",
    name: "Neon",
    palette: {
      bg: "#05070d",
      card: "#0b1020",
      accent: "#10b981",
      text: "#e2e8f0",
    },
    layout: "badge",
    cornerStyle: "rounded-3xl",
  },
];

const DEFAULT_TEMPLATE = TEMPLATES[0];

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  organization: "",
  category: "",
  description: "",
  mode: "Offline",
  // schedule
  start: "",
  end: "",
  regDeadline: "",
  // venue
  venueName: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  // ticketing
  isPaid: false,
  price: "",
  capacity: "",
  // team
  isTeamEvent: false,
  teamMin: "",
  teamMax: "",
  // lists
  tags: [],
  eligibility: [],
  stages: [],
  timeline: [],
  // extras
  prizes: "",
  rewards: "",
  submissionFormat: "",
  judgingCriteria: "",
  resources: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  faqLink: "",
  website: "",
  socials: [],
  status: "draft",
  // NEW: ticket template in form state
  ticketTemplate: DEFAULT_TEMPLATE,
};

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    singleEvent,
    loading,
    fetchEventById,
    updateEvent,
    deleteEvent,
    actionLoading,
  } = useEvents();
  const { user, isAuthenticated } = useAuth();

  // Fetch event
  useEffect(() => {
    fetchEventById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ev = singleEvent;

  // ----- Local state / hooks -----
  const [editOpen, setEditOpen] = useState(false);

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const bannerInputRef = useRef(null);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const logoInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [tagInput, setTagInput] = useState("");
  const [eligibilityInput, setEligibilityInput] = useState("");
  const [socialLabel, setSocialLabel] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Command palette state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Sync form with event when it loads/changes
  useEffect(() => {
    if (!ev) return;
    setForm(mapEventToForm(ev));
    setBannerPreview(ev.bannerUrl || ev.banner?.secure_url || "");
    setLogoPreview(ev.logoUrl || ev.logo?.secure_url || "");
  }, [ev]);

  const isOwner = useMemo(() => {
    if (!ev || !user) return false;
    const creatorId =
      (typeof ev.createdBy === "object" && ev.createdBy?._id) || ev.createdBy;
    return !!creatorId && creatorId === user?._id;
  }, [ev, user]);

  const canSubmit = useMemo(() => {
    const required = [
      "title",
      "organization",
      "category",
      "start",
      "end",
      "city",
    ];
    const missing = required.some((k) => !String(form[k] ?? "").trim());
    const priceOk = !form.isPaid || Number(form.price) >= 0;
    const capacityOk = !form.capacity || Number(form.capacity) >= 0;
    const teamOk =
      !form.isTeamEvent ||
      ((Number(form.teamMin) > 0 || Number(form.teamMax) > 0) &&
        Number(form.teamMax || 0) >= Number(form.teamMin || 0));
    return !missing && priceOk && capacityOk && teamOk;
  }, [form]);

  // ---------- Command Palette Links (same model as Home/Events) ----------
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
        icon: <TicketIcon className="h-5 w-5" />,
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

  // ----- Early returns AFTER all hooks are declared -----
  if (loading) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <Loader />
      </div>
    );
  }

  if (!ev) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <div className="relative z-10 mx-auto w-[92%] max-w-[900px] py-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            Event not found.
          </div>
        </div>
      </div>
    );
  }

  // ----- helpers (non-hook) -----
  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const banner = ev.bannerUrl || ev.banner?.secure_url || ev.cover || null;
  const logo = ev.logoUrl || ev.logo?.secure_url || ev.logo || null;

  const where =
    ev.venueName ||
    [ev.address, ev.city, ev.state, ev.pincode].filter(Boolean).join(", ") ||
    ev.city ||
    "—";

  const price = Number(ev.price || 0);
  const isPaid = !!ev.isPaid && price > 0;

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const addTag = (e) => {
    e?.preventDefault?.();
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };
  const removeTag = (t) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const addEligibility = (e) => {
    e?.preventDefault?.();
    const t = eligibilityInput.trim();
    if (!t) return;
    setForm((f) => ({ ...f, eligibility: [...f.eligibility, t] }));
    setEligibilityInput("");
  };
  const removeEligibility = (t) =>
    setForm((f) => ({
      ...f,
      eligibility: f.eligibility.filter((x) => x !== t),
    }));

  const addSocial = (e) => {
    e?.preventDefault?.();
    const label = socialLabel.trim();
    const url = socialUrl.trim();
    if (!label || !url) return;
    setForm((f) => ({ ...f, socials: [...f.socials, { label, url }] }));
    setSocialLabel("");
    setSocialUrl("");
  };
  const removeSocial = (idx) =>
    setForm((f) => ({ ...f, socials: f.socials.filter((_, i) => i !== idx) }));

  const onPickBanner = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onPickLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
      else if (typeof v === "object" && v !== null)
        fd.append(k, JSON.stringify(v)); // includes ticketTemplate
      else fd.append(k, v ?? "");
    });
    if (bannerFile) fd.append("banner", bannerFile);
    if (logoFile) fd.append("logo", logoFile);

    const saved = await updateEvent(ev._id || ev.id, fd);
    setSubmitting(false);
    if (saved) setEditOpen(false);
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this event? This action cannot be undone."))
      return;
    await deleteEvent(ev._id || ev.id);
    navigate(-1);
  };

  const activeTemplate = ev.ticketTemplate || DEFAULT_TEMPLATE;

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

      <div className="relative z-10 mx-auto w-[92%] max-w-[1000px] py-6 md:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {/* Replaced Share with hamburger that opens command palette */}
          <button
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Open Command Palette"
            title="Open quick navigation (Ctrl/⌘+K)"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Command Palette (same behavior as Home/Events) */}
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

        {/* Hero */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#0f1530] to-[#142146]">
            {banner ? (
              <img
                src={banner}
                alt={ev.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center">
                <span className="text-xs text-white/55">Event Banner</span>
              </div>
            )}

            {logo && (
              <div className="absolute -bottom-6 left-6 h-14 w-14 rounded-2xl overflow-hidden border border-white/15 bg-black/30 backdrop-blur">
                <img
                  src={logo}
                  alt="logo"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="p-5 md:p-6 pt-8">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">{ev.title}</span>
            </h1>
            {ev.subtitle && (
              <p className="mt-1 text-sm text-white/70">{ev.subtitle}</p>
            )}

            {/* Info grid */}
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {fmtDate(ev.start || ev.date)}{" "}
                {ev.end ? `— ${fmtDate(ev.end)}` : ""}
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {where}
              </div>
              <div className="inline-flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                {isPaid ? price : "Free"}
              </div>
              {ev.capacity && (
                <div className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacity: {ev.capacity}
                </div>
              )}
              {ev.mode && (
                <div className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Mode: {ev.mode}
                </div>
              )}
              <div className="inline-flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {ev.category || "Event"}
              </div>
            </div>

            {/* Tags */}
            {!!(ev.tags || []).length && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(ev.tags || []).map((t) => (
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

            {/* Description */}
            {ev.description && (
              <div className="mt-5">
                <h2 className="text-base font-semibold text-white/90">
                  About this event
                </h2>
                <p className="mt-2 text-white/75 leading-relaxed whitespace-pre-line">
                  {ev.description}
                </p>
              </div>
            )}

            {/* Quick Actions + Owner controls */}
            <div className="mt-6 flex flex-wrap gap-3">
              {/* Not owner: show Register + Tickets */}
              {!isOwner && (
                <>
                  <Link
                    to={`/events/${ev._id || ev.id}/register`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
                  >
                    Register Now
                  </Link>
                </>
              )}

              {/* Owner: show Manage (replaces View Tickets), plus Edit/Delete */}
              {isOwner && (
                <>
                  <Link
                    to={`/events/${ev._id || ev.id}/manage`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
                    title="Manage event"
                  >
                    Manage
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
                    title="Edit event"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-600 hover:from-rose-500 hover:to-rose-500 px-4 h-11 text-sm transition"
                    title="Delete event"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Organizer / Links / Venue + Ticket Preview column */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white/90">Organizer</h3>
            <div className="mt-2 text-sm text-white/75 inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {ev.organization || ev.organizer || "—"}
            </div>

            {!!(ev.eligibility || []).length && (
              <>
                <h4 className="mt-4 text-sm font-semibold text-white/90">
                  Eligibility
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-white/75">
                  {ev.eligibility.map((item, idx) => (
                    <li
                      key={`el-${idx}`}
                      className="rounded-lg border border-white/10 bg-[#0b1020]/40 px-3 py-2"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {ev.isTeamEvent && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-white/10 bg-[#0b1020]/40 p-3">
                  Team event: <b>Yes</b>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#0b1020]/40 p-3">
                  Team size:{" "}
                  <b>
                    {ev.teamMin || 1} – {ev.teamMax || ev.teamMin || 1}
                  </b>
                </div>
              </div>
            )}

            {!!(ev.stages || []).length && (
              <>
                <h4 className="mt-5 text-sm font-semibold text-white/90">
                  Stages / Rounds
                </h4>
                <div className="mt-2 space-y-2">
                  {ev.stages.map((st, idx) => (
                    <div
                      key={`stage-${idx}`}
                      className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3 text-sm"
                    >
                      <div className="font-medium text-white/90">
                        {st.title}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/70">
                        {st.start && <span>Start: {fmtDate(st.start)}</span>}
                        {st.end && <span>End: {fmtDate(st.end)}</span>}
                        {st.mode && <span>Mode: {st.mode}</span>}
                      </div>
                      {st.description && (
                        <p className="mt-2 text-white/80">{st.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {!!(ev.timeline || []).length && (
              <>
                <h4 className="mt-5 text-sm font-semibold text-white/90">
                  Timeline
                </h4>
                <div className="mt-2 space-y-2">
                  {ev.timeline.map((t, idx) => (
                    <div
                      key={`tl-${idx}`}
                      className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3 text-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-white/90">
                          {t.title}
                        </div>
                        <div className="text-xs text-white/70">
                          {fmtDate(t.date)} {t.note ? `• ${t.note}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right column: Ticketing + Ticket Preview + Links + Venue */}
          <div className="space-y-4">
            {!isOwner && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white/90">
                  Ticketing
                </h3>
                <div className="mt-2 text-sm text-white/75 space-y-1">
                  <div>
                    Type: <b>{isPaid ? "Paid" : "Free"}</b>
                  </div>
                  {isPaid && (
                    <div>
                      Price: <b>₹ {price}</b>
                    </div>
                  )}
                  {ev.capacity && (
                    <div>
                      Capacity: <b>{ev.capacity}</b>
                    </div>
                  )}
                  {ev.regDeadline && (
                    <div>
                      Registration deadline: <b>{fmtDate(ev.regDeadline)}</b>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/events/${ev._id || ev.id}/register`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Ticket Preview */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
                  <TicketIcon className="h-4 w-4" /> Ticket Preview
                </h3>
                <span className="text-[11px] text-white/60">
                  {activeTemplate?.name || "Classic"}
                </span>
              </div>
              <div className="mt-3">
                <TicketPreview
                  tpl={activeTemplate}
                  event={{
                    title: ev.title,
                    organization: ev.organization,
                    start: ev.start,
                    city: ev.city,
                    category: ev.category,
                    price,
                  }}
                  logo={logo}
                />
              </div>
              {isOwner && (
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
                  onClick={() => setEditOpen(true)}
                >
                  Change style
                </button>
              )}
            </div>

            {(ev.website || ev.socials) && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white/90">Links</h3>
                <div className="mt-2 space-y-2">
                  {ev.website && (
                    <a
                      href={ev.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition"
                    >
                      <Link2 className="h-4 w-4" />
                      {ev.website}
                    </a>
                  )}
                  {(ev.socials || []).map((s, idx) => (
                    <a
                      key={`soc-${idx}`}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition"
                    >
                      <Link2 className="h-4 w-4" />
                      {s.label}: {s.url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-white/90">Venue</h3>
              <p className="mt-2 text-sm text-white/75">
                {where || "—"}
                {ev.mode === "Online" &&
                  " • Online event (link will be shared after registration)."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit overlay */}
      {editOpen && (
        <EditOverlay
          form={form}
          setForm={setForm}
          onClose={() => setEditOpen(false)}
          onUpdate={onUpdate}
          canSubmit={canSubmit}
          submitting={submitting || actionLoading}
          bannerPreview={bannerPreview}
          logoPreview={logoPreview}
          bannerInputRef={bannerInputRef}
          logoInputRef={logoInputRef}
          onPickBanner={onPickBanner}
          onPickLogo={onPickLogo}
          onChange={onChange}
          tagInput={tagInput}
          setTagInput={setTagInput}
          addTag={addTag}
          removeTag={removeTag}
          eligibilityInput={eligibilityInput}
          setEligibilityInput={setEligibilityInput}
          addEligibility={addEligibility}
          removeEligibility={removeEligibility}
          socialLabel={socialLabel}
          setSocialLabel={setSocialLabel}
          socialUrl={socialUrl}
          setSocialUrl={setSocialUrl}
          addSocial={addSocial}
          removeSocial={removeSocial}
          // NEW: pass templates for selection
          templates={TEMPLATES}
        />
      )}

      {(submitting || actionLoading) && <Loader />}
    </div>
  );
}

/* ---------- Ticket Preview ---------- */
function TicketPreview({ tpl, event, logo }) {
  const { title, organization, start, city, category, price } = event;
  const code = "SP-ABCD-1234";
  const cardStyle = tpl?.palette?.card?.startsWith?.("linear")
    ? { background: tpl.palette.card }
    : { backgroundColor: tpl?.palette?.card || "#11172c" };

  return (
    <div
      className={`relative ${
        tpl?.cornerStyle || "rounded-xl"
      } border border-white/10 p-3`}
      style={{ backgroundColor: tpl?.palette?.bg || "#0b1020" }}
    >
      <div
        className={`relative ${tpl?.cornerStyle || "rounded-xl"} p-3`}
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-black/30 border border-white/20 grid place-items-center">
                {logo ? (
                  <img
                    src={logo}
                    alt="logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-white/70">LOGO</span>
                )}
              </div>
              <div
                className="text-xs"
                style={{ color: tpl?.palette?.text || "#fff" }}
              >
                <div className="font-semibold line-clamp-1">
                  {title || "Event Title"}
                </div>
                <div className="opacity-80 line-clamp-1">
                  {organization || "Organizer"}
                </div>
              </div>
            </div>

            <div
              className="mt-2 text-[11px]"
              style={{ color: tpl?.palette?.text || "#fff" }}
            >
              <div className="opacity-90">
                {new Date(start || Date.now()).toLocaleString()}
              </div>
              <div className="opacity-80">{city || "Venue"}</div>
              <div className="opacity-80">
                {Number(price || 0) > 0 ? `₹ ${price}` : "Free"}
              </div>
            </div>
          </div>

          <div className="shrink-0 grid place-items-center">
            <div className="h-20 w-20 rounded-md border border-white/30 bg-black/30 grid place-items-center">
              <QrCode className="h-8 w-8 opacity-80" />
            </div>
            <div
              className="mt-1 text-[10px] tracking-wider"
              style={{ color: tpl?.palette?.text || "#fff" }}
            >
              {code}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span style={{ color: tpl?.palette?.text || "#fff" }}>
            Holder: <b>John Doe</b>
          </span>
          <span
            className="px-2 py-0.5 rounded-full border"
            style={{
              color: tpl?.palette?.accent || "#19cfbc",
              borderColor: `${tpl?.palette?.accent || "#19cfbc"}66`,
              background: `${tpl?.palette?.accent || "#19cfbc"}14`,
            }}
          >
            {category || "Category"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small components / helpers ---------- */

function mapEventToForm(ev) {
  return {
    title: ev.title || "",
    subtitle: ev.subtitle || "",
    organization: ev.organization || ev.organizer || "",
    category: ev.category || "",
    description: ev.description || "",
    mode: ev.mode || "Offline",
    start: ev.start || ev.date || "",
    end: ev.end || "",
    regDeadline: ev.regDeadline || "",
    venueName: ev.venueName || "",
    address: ev.address || "",
    city: ev.city || "",
    state: ev.state || "",
    pincode: ev.pincode || "",
    isPaid: !!ev.isPaid && Number(ev.price || 0) > 0,
    price: ev.price ?? "",
    capacity: ev.capacity ?? "",
    isTeamEvent: !!ev.isTeamEvent,
    teamMin: ev.teamMin ?? "",
    teamMax: ev.teamMax ?? "",
    tags: Array.isArray(ev.tags) ? ev.tags : [],
    eligibility: Array.isArray(ev.eligibility) ? ev.eligibility : [],
    stages: Array.isArray(ev.stages) ? ev.stages : [],
    timeline: Array.isArray(ev.timeline) ? ev.timeline : [],
    prizes: ev.prizes || "",
    rewards: ev.rewards || "",
    submissionFormat: ev.submissionFormat || "",
    judgingCriteria: ev.judgingCriteria || "",
    resources: ev.resources || "",
    contactName: ev.contactName || "",
    contactEmail: ev.contactEmail || "",
    contactPhone: ev.contactPhone || "",
    faqLink: ev.faqLink || "",
    website: ev.website || "",
    socials: Array.isArray(ev.socials) ? ev.socials : [],
    status: ev.status || "draft",
    // NEW: ticket template
    ticketTemplate:
      ev.ticketTemplate && ev.ticketTemplate.key
        ? ev.ticketTemplate
        : DEFAULT_TEMPLATE,
  };
}

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
function fromLocalInput(val) {
  if (!val) return "";
  const d = new Date(val);
  return d.toISOString();
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      {title && <p className="text-sm text-white/85 mb-3">{title}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
}) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">
        {label} {required && <span className="text-rose-300">*</span>}
      </span>
      <div
        className={`h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 flex items-center gap-2 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
        />
      </div>
    </label>
  );
}

function Textarea({ label, name, value, onChange, placeholder, required }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">
        {label} {required && <span className="text-rose-300">*</span>}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={5}
        className="w-full rounded-lg border border-white/10 bg-[#0c1222]/60 p-3 text-sm outline-none placeholder:text-white/50"
      />
    </label>
  );
}

function Select({ label, name, value, onChange, options = [], required }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">
        {label} {required && <span className="text-rose-300">*</span>}
      </span>
      <div className="h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 flex items-center">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-transparent outline-none text-sm appearance-none"
        >
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0b0f1a]">
              {opt}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60">
      <span className="text-xs text-white/70">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-7 w-12 rounded-full border border-white/10 transition ${
          checked ? "bg-blue-600" : "bg-white/10"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white translate-x-0.5 transition ${
            checked ? "translate-x-[22px]" : ""
          }`}
        />
      </button>
    </div>
  );
}

function ReviewItem({ ok, text }) {
  return (
    <li
      className={`inline-flex items-center gap-2 ${
        ok ? "text-white/80" : "text-white/50"
      }`}
    >
      <span
        className={`h-5 w-5 grid place-items-center rounded-full border ${
          ok
            ? "border-emerald-400/30 bg-emerald-400/10"
            : "border-white/10 bg-white/5"
        }`}
      >
        {ok ? (
          <Check className="h-3.5 w-3.5 text-emerald-300" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        )}
      </span>
      {text}
    </li>
  );
}

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-white/10 bg-[#0b1020]/40">
      {children}
      <button
        type="button"
        className="ml-1 hover:text-white/90"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/* ---------- Ticket Template Picker for Edit overlay ---------- */
function TemplatePicker({ templates, value, onChange, previewEvent, logo }) {
  return (
    <div>
      <p className="text-xs text-white/60 mb-2">Ticket style</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((tpl) => {
          const selected = value?.key === tpl.key;
          return (
            <button
              key={tpl.key}
              type="button"
              onClick={() => onChange(tpl)}
              className={`group text-left rounded-2xl border ${
                selected ? "border-emerald-400/40" : "border-white/10"
              } bg-white/5 hover:bg-white/10 transition p-3`}
            >
              <TicketPreview tpl={tpl} event={previewEvent} logo={logo} />
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium text-white/90">
                  {tpl.name}
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border ${
                    selected
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                      : "border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  {selected ? "Selected" : "Select"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* The overlay is a pure component (no hooks inside), so it doesn't affect hook order */
function EditOverlay(props) {
  const {
    form,
    setForm,
    onClose,
    onUpdate,
    canSubmit,
    submitting,
    bannerPreview,
    logoPreview,
    bannerInputRef,
    logoInputRef,
    onPickBanner,
    onPickLogo,
    onChange,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    eligibilityInput,
    setEligibilityInput,
    addEligibility,
    removeEligibility,
    socialLabel,
    setSocialLabel,
    socialUrl,
    setSocialUrl,
    addSocial,
    removeSocial,
    templates,
  } = props;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-3">
      <div className="w-full max-w-[1100px] max-h-[90svh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1020]/90 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-white/90">Edit Event</h3>
          <button
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Banner + Logo row */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-xl border border-white/10 bg-[#0b1020]/40">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-[10px] text-white/50">
                  Logo
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={onPickLogo}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs md:text-sm transition"
              >
                <Upload className="h-4 w-4" />
                Upload logo
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={onPickBanner}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs md:text-sm transition"
            >
              <Upload className="h-4 w-4" />
              Upload banner
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={onUpdate}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <section className="lg:col-span-2 space-y-4">
            <Card title="Basic Details">
              <div className="grid md:grid-cols-2 gap-3">
                <Field
                  label="Event title"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                />
                <Field
                  label="Subtitle (optional)"
                  name="subtitle"
                  value={form.subtitle}
                  onChange={onChange}
                />
                <Field
                  label="Organization"
                  name="organization"
                  value={form.organization}
                  onChange={onChange}
                  required
                />
                <Select
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  required
                  options={[
                    "Conference",
                    "Workshop",
                    "Meetup",
                    "Hackathon",
                    "College Fest",
                    "Webinar",
                    "Competition",
                  ]}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-3">
                <Select
                  label="Event mode"
                  name="mode"
                  value={form.mode}
                  onChange={onChange}
                  options={["Offline", "Online", "Hybrid"]}
                />
                <Field
                  label="Start"
                  name="start"
                  type="datetime-local"
                  value={toLocalInput(form.start)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      start: fromLocalInput(e.target.value),
                    }))
                  }
                  required
                />
                <Field
                  label="End"
                  name="end"
                  type="datetime-local"
                  value={toLocalInput(form.end)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      end: fromLocalInput(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-3">
                <Field
                  label="Registration deadline"
                  name="regDeadline"
                  type="datetime-local"
                  value={toLocalInput(form.regDeadline)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      regDeadline: fromLocalInput(e.target.value),
                    }))
                  }
                />
                <ToggleField
                  label="Team-up event?"
                  checked={form.isTeamEvent}
                  onChange={(v) => setForm((f) => ({ ...f, isTeamEvent: v }))}
                />
                <div className="hidden md:block" aria-hidden />
              </div>

              {form.isTeamEvent && (
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <Field
                    label="Team size (min)"
                    name="teamMin"
                    type="number"
                    value={form.teamMin}
                    onChange={onChange}
                  />
                  <Field
                    label="Team size (max)"
                    name="teamMax"
                    type="number"
                    value={form.teamMax}
                    onChange={onChange}
                  />
                </div>
              )}

              <Textarea
                label="Description"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Describe agenda, rounds, speakers, perks, etc."
              />

              {/* Tags */}
              <div className="mt-3">
                <label className="block text-xs text-white/70 mb-1">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag(e)}
                    placeholder="e.g., Tech, AI, Startups"
                    className="h-10 w-full rounded-lg border border-white/10 bg-[#0c1222]/60 px-3 text-sm outline-none placeholder:text-white/50"
                  />
                  <button
                    onClick={addTag}
                    className="h-10 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                    type="button"
                  >
                    Add
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {form.tags.map((t) => (
                      <Chip key={t} onRemove={() => removeTag(t)}>
                        <Tag className="h-3 w-3" />
                        {t}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card title="Venue">
              <div className="grid md:grid-cols-2 gap-3">
                <Field
                  label="Venue name"
                  name="venueName"
                  value={form.venueName}
                  onChange={onChange}
                />
                <Field
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                />
                <Field
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  required
                />
                <Field
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={onChange}
                />
                <Field
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={onChange}
                />
              </div>
            </Card>

            <Card title="Eligibility">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={eligibilityInput}
                  onChange={(e) => setEligibilityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEligibility(e)}
                  placeholder="e.g., Undergraduate students, Year 2 & above"
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#0c1222]/60 px-3 text-sm outline-none placeholder:text-white/50"
                />
                <button
                  onClick={addEligibility}
                  className="h-10 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                  type="button"
                >
                  Add
                </button>
              </div>
              {form.eligibility.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {form.eligibility.map((el, idx) => (
                    <li
                      key={`${el}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0b1020]/40 px-3 py-2 text-sm"
                    >
                      <span className="text-white/85">{el}</span>
                      <button
                        type="button"
                        className="text-white/70 hover:text-white"
                        onClick={() => removeEligibility(el)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Additional Details">
              <div className="grid md:grid-cols-2 gap-3">
                <Textarea
                  label="Prizes (if any)"
                  name="prizes"
                  value={form.prizes}
                  onChange={onChange}
                />
                <Textarea
                  label="Rewards & Benefits"
                  name="rewards"
                  value={form.rewards}
                  onChange={onChange}
                />
                <Textarea
                  label="Submission format"
                  name="submissionFormat"
                  value={form.submissionFormat}
                  onChange={onChange}
                />
                <Textarea
                  label="Judging criteria"
                  name="judgingCriteria"
                  value={form.judgingCriteria}
                  onChange={onChange}
                />
                <Textarea
                  label="Resources (optional)"
                  name="resources"
                  value={form.resources}
                  onChange={onChange}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Contact name"
                    name="contactName"
                    value={form.contactName}
                    onChange={onChange}
                  />
                  <Field
                    label="Contact email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={onChange}
                  />
                  <Field
                    label="Contact phone"
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={onChange}
                  />
                  <Field
                    label="FAQ link (optional)"
                    name="faqLink"
                    value={form.faqLink}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="mt-3 grid md:grid-cols-3 gap-3">
                <Field
                  label="Website (optional)"
                  name="website"
                  value={form.website}
                  onChange={onChange}
                />
                <Field
                  label="Social label"
                  value={socialLabel}
                  onChange={(e) => setSocialLabel(e.target.value)}
                  placeholder="e.g., Instagram"
                />
                <Field
                  label="Social URL"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={addSocial}
                  className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm transition"
                >
                  Add social link
                </button>
              </div>
              {form.socials.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {form.socials.map((s, idx) => (
                    <li
                      key={`${s.label}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0b1020]/40 px-3 py-2 text-sm"
                    >
                      <span className="text-white/85">
                        <b>{s.label}:</b> {s.url}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            socials: f.socials.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="text-white/70 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* NEW: Ticket Template chooser in Edit */}
            <Card title="Ticket Style">
              <TemplatePicker
                templates={templates}
                value={form.ticketTemplate}
                onChange={(tpl) =>
                  setForm((f) => ({ ...f, ticketTemplate: tpl }))
                }
                previewEvent={{
                  title: form.title,
                  organization: form.organization,
                  start: form.start,
                  city: form.city,
                  category: form.category,
                  price: Number(form.price || 0),
                }}
                logo={logoPreview}
              />
            </Card>
          </section>

          <section className="space-y-4">
            <Card title="Ticketing">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/80">
                  This is a paid event
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      isPaid: !f.isPaid,
                      price: !f.isPaid ? f.price : "",
                    }))
                  }
                  className={`h-7 w-12 rounded-full border border-white/10 transition ${
                    form.isPaid ? "bg-blue-600" : "bg-white/10"
                  }`}
                  aria-pressed={form.isPaid}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white translate-x-0.5 transition ${
                      form.isPaid ? "translate-x-[22px]" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Field
                  label="Price"
                  name="price"
                  type="number"
                  value={form.isPaid ? form.price : ""}
                  onChange={onChange}
                  placeholder={form.isPaid ? "e.g., 499" : "Free"}
                  disabled={!form.isPaid}
                />
                <Field
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={onChange}
                  placeholder="Max tickets (optional)"
                />
              </div>
              <p className="mt-2 text-xs text-white/60">
                Payments issue QR tickets with scan-ready check-ins.
              </p>
            </Card>

            <Card title="Publish">
              <Select
                label="Status"
                name="status"
                value={form.status}
                onChange={onChange}
                options={["draft", "published", "private"]}
              />

              <ul className="mt-3 space-y-2 text-xs text-white/70">
                <ReviewItem ok={!!form.title} text="Title added" />
                <ReviewItem
                  ok={!!form.organization}
                  text="Organization added"
                />
                <ReviewItem ok={!!form.category} text="Category selected" />
                <ReviewItem
                  ok={!!form.start && !!form.end}
                  text="Schedule set"
                />
                <ReviewItem ok={!!form.city} text="Venue city added" />
                <ReviewItem
                  ok={!form.isPaid || String(form.price).trim() !== ""}
                  text={form.isPaid ? "Price set" : "Free event"}
                />
                <ReviewItem
                  ok={
                    !form.isTeamEvent ||
                    ((Number(form.teamMin) > 0 || Number(form.teamMax) > 0) &&
                      Number(form.teamMax || 0) >= Number(form.teamMin || 0))
                  }
                  text={
                    form.isTeamEvent ? "Team size valid" : "Individual allowed"
                  }
                />
              </ul>

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className={`mt-4 w-full h-11 rounded-xl text-sm inline-flex items-center justify-center transition ${
                  !canSubmit || submitting
                    ? "bg-white/10 cursor-not-allowed text-white/60"
                    : "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500"
                }`}
              >
                {submitting ? "Updating…" : "Update Event"}
              </button>
            </Card>
          </section>
        </form>
      </div>
    </div>
  );
}

export default EventDetails;
