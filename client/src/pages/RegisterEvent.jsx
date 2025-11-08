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
} from "lucide-react";

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
  const [qty, setQty] = useState(1);

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
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="relative z-10 mx-auto w-[92%] max-w-[980px] py-8">
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
