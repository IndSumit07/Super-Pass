// src/pages/RegisterEvent.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../contexts/EventContext";
import { usePasses } from "../contexts/PassContext";
import Loader from "../components/Loader";
import {
  CalendarDays,
  MapPin,
  IndianRupee,
  Ticket as TicketIcon,
  ArrowLeft,
  Menu,
  Search,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Plus,
  Settings,
  HelpCircle,
  Home as HomeIcon,
  QrCode,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getNavigationLinks } from "../config/navigationLinks";

const FALLBACK_TPL = {
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
};

export default function RegisterEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { singleEvent, loading, fetchEventById } = useEvents();
  const { buyTicket, buying } = usePasses();
  const { isAuthenticated, user } = useAuth();
  const [qty, setQty] = useState(1);

  // Command palette state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetchEventById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ev = singleEvent;

  const price = Number(ev?.price || 0);
  const isPaid = !!ev?.isPaid && price > 0;
  const amount = isPaid ? price * qty : 0;

  const tpl = ev?.ticketTemplate || FALLBACK_TPL;
  const logo = ev?.logoUrl || ev?.logo?.secure_url || null;

  const onBuy = async () => {
    const pass = await buyTicket({ eventId: ev._id || ev.id, quantity: qty });
    if (pass) navigate("/my-passes");
  };

  // Command palette links
  // ---------- Command Palette Links (centralized configuration) ----------
  const paletteLinks = useMemo(() => {
    const list = getNavigationLinks(`/events/${id}/register`, isAuthenticated, user);
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.desc.toLowerCase().includes(q) ||
        l.group.toLowerCase().includes(q)
    );
  }, [isAuthenticated, user, cmdQuery, id]);

  // Keyboard shortcuts for command palette
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

  if (loading || !ev) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <Loader />
      </div>
    );
  }

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

      <div className="relative z-10 mx-auto w-[92%] max-w-[980px] py-8">
        {/* Top bar: Back + Hamburger */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition"
            aria-label="Open Command Palette"
            title="Open quick navigation (Ctrl/⌘+K)"
          >
            <Menu className="h-5 w-5" />
          </button>
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

        {/* Page title */}
        <h1 className="text-xl md:text-2xl font-semibold">
          <span className="font-forum text-[#19cfbc]">Register</span>{" "}
          <span className="text-white/85">for {ev.title}</span>
        </h1>

        <div className="mt-5 grid lg:grid-cols-3 gap-4">
          {/* Left: Ticket preview & details */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
              <TicketIcon className="h-4 w-4" /> Your Ticket
            </h3>

            <div className="mt-3">
              <TicketPreview
                tpl={tpl}
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

            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {new Date(ev.start).toLocaleString()}{" "}
                {ev.end ? "— " + new Date(ev.end).toLocaleString() : ""}
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {ev.venueName ||
                  [ev.address, ev.city, ev.state, ev.pincode]
                    .filter(Boolean)
                    .join(", ") ||
                  ev.city}
              </div>
            </div>
          </div>

          {/* Right: Checkout */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white/90">Checkout</h3>

            <div className="mt-3">
              <label className="block text-xs text-white/70 mb-1">
                Quantity
              </label>
              <div className="h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Number(e.target.value || 1)))
                  }
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="mt-3 text-sm text-white/80">
              Price per ticket:{" "}
              <b>
                {isPaid ? (
                  <span className="inline-flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {price}
                  </span>
                ) : (
                  "Free"
                )}
              </b>
            </div>
            <div className="mt-1 text-sm text-white/80">
              Total:{" "}
              <b>
                {isPaid ? (
                  <span className="inline-flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {amount}
                  </span>
                ) : (
                  "Free"
                )}
              </b>
            </div>

            <button
              disabled={buying}
              onClick={onBuy}
              className={`mt-4 w-full h-11 rounded-xl text-sm inline-flex items-center justify-center transition ${
                buying
                  ? "bg-white/10 cursor-not-allowed text-white/60"
                  : "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500"
              }`}
            >
              {isPaid
                ? buying
                  ? "Processing…"
                  : "Pay & Get Pass"
                : buying
                ? "Issuing…"
                : "Get Free Pass"}
            </button>

            <p className="mt-2 text-[11px] text-white/50 text-center">
              Secured by Razorpay (Test mode)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Minimal ticket preview reused here (matches your EventDetails style) --- */
function TicketPreview({ tpl, event, logo }) {
  const { title, organization, start, city, category, price } = event;
  const code = "SP-ABCD-1234";

  const cardStyle = tpl?.palette?.card?.startsWith?.("linear")
    ? { background: tpl.palette.card }
    : { backgroundColor: tpl?.palette?.card || "#11172c" };

  return (
    <div
      className={`${
        tpl?.cornerStyle || "rounded-xl"
      } border border-white/10 p-3`}
      style={{ backgroundColor: tpl?.palette?.bg || "#0b1020" }}
    >
      <div
        className={`${tpl?.cornerStyle || "rounded-xl"} p-3`}
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
              {/* Simple QR placeholder (kept SVG to avoid extra deps) */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                className="opacity-80"
              >
                <path
                  fill="currentColor"
                  d="M4 4h4v2H6v2H4zm10 0h6v6h-2V6h-4zm-8 8h2v2H6zm10 2h2v2h-2zm-8 6H4v-4h2v2h2zm12 0h-6v-2h4v-4h2z"
                />
              </svg>
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
            Holder: <b>Your Name</b>
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
