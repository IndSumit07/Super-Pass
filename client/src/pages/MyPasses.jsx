import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePasses } from "../contexts/PassContext";
import Loader from "../components/Loader";
import {
  ArrowLeft,
  ArrowRight,
  Ticket as TicketIcon,
  QrCode,
  CalendarDays,
  MapPin,
  IndianRupee,
} from "lucide-react";

export default function MyPasses() {
  const navigate = useNavigate();
  const { passes, fetchMyPasses, loading } = usePasses();

  const [canBack, setCanBack] = useState(false);
  const [canFwd, setCanFwd] = useState(false);

  // ---------- nav helpers (React Router v6 keeps a history.state.idx) ----------
  const getIdx = () => {
    const st = window.history.state;
    return st && Number.isInteger(st.idx) ? st.idx : 0;
  };

  const computeNav = () => {
    const idx = getIdx();
    // Track the maximum index we've seen in this tab to know if forward is possible
    const key = "sp_max_idx";
    const stored = sessionStorage.getItem(key);
    const storedNum =
      stored != null && !Number.isNaN(parseInt(stored, 10))
        ? parseInt(stored, 10)
        : idx;

    if (idx > storedNum) {
      sessionStorage.setItem(key, String(idx));
    }
    const maxIdx = Math.max(idx, storedNum);

    setCanBack(idx > 0);
    setCanFwd(idx < maxIdx);
  };

  useEffect(() => {
    computeNav();
    const onPop = () => computeNav();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMyPasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    // newest first
    return [...(passes || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [passes]);

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

  const fmtMoney = (paise) => {
    const rupees = Math.round(Number(paise || 0)) / 100;
    return rupees > 0 ? `₹ ${rupees.toLocaleString()}` : "Free";
  };

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
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="relative z-10 mx-auto w-[92%] max-w-[980px] py-8">
        {/* Top bar with history nav */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (canBack) navigate(-1);
              }}
              disabled={!canBack}
              className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 h-10 text-sm transition ${
                canBack
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-white/5 opacity-60 cursor-not-allowed"
              }`}
              title="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => {
                if (canFwd) navigate(1);
              }}
              disabled={!canFwd}
              className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 h-10 text-sm transition ${
                canFwd
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-white/5 opacity-60 cursor-not-allowed"
              }`}
              title="Forward"
            >
              Forward
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <h1 className="text-xl md:text-2xl font-semibold">
            <span className="font-forum text-[#19cfbc]">My</span>{" "}
            <span className="text-white/85">Passes</span>
          </h1>

          <div className="opacity-0 pointer-events-none md:opacity-0">
            {/* spacer to balance layout */}
          </div>
        </div>

        {/* Summary strip */}
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <SummaryPill
            label="Total Passes"
            value={sorted.length}
            hint="includes free & paid"
          />
          <SummaryPill
            label="Paid"
            value={sorted.filter((p) => Number(p.amount) > 0).length}
            hint="successful payments"
          />
          <SummaryPill
            label="Checked-in"
            value={sorted.filter((p) => p.checkedIn).length}
            hint="scanned at entry"
          />
        </div>

        {/* Pass grid */}
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((p) => {
            const snap = p.eventSnapshot || {};
            const title = snap.title || "Event";
            const org = snap.organization || "Organizer";
            const date = snap.start;
            const city = snap.city || "—";
            const paid = Number(p.amount) > 0;
            const status = (p.status || "created").toLowerCase(); // created | paid | failed | refunded

            const statusLabelBase =
              status === "paid"
                ? "Paid"
                : status === "failed"
                ? "Failed"
                : status === "refunded"
                ? "Refunded"
                : "Created";

            // If amount is 0, show "Free" regardless of status
            const displayLabel = paid ? statusLabelBase : "Free";

            const tonePaid =
              "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
            const toneFail = "border-rose-400/30 bg-rose-400/10 text-rose-200";
            const toneRefund =
              "border-amber-400/30 bg-amber-400/10 text-amber-200";
            const toneCreated = "border-sky-400/30 bg-sky-400/10 text-sky-200";
            const toneFree = "border-sky-400/30 bg-sky-400/10 text-sky-200";

            const statusTone = !paid
              ? toneFree
              : status === "paid"
              ? tonePaid
              : status === "failed"
              ? toneFail
              : status === "refunded"
              ? toneRefund
              : toneCreated;

            return (
              <Link
                to={`/my-passes/${p._id}`}
                key={p._id}
                className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition overflow-hidden"
              >
                {/* subtle gradient border glow */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(25,207,188,.18), 0 12px 40px rgba(25,207,188,.12)",
                  }}
                />
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
                      <TicketIcon className="h-4 w-4" /> {title}
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${statusTone}`}
                    >
                      {displayLabel}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-white/70">{org}</div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/70">
                    <div className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {fmtDate(date)}
                    </div>
                    <div className="inline-flex items-center gap-1 justify-end">
                      <MapPin className="h-3.5 w-3.5" />
                      {city}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <div className="inline-flex items-center gap-1 text-white/75">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {paid ? fmtMoney(p.amount) : "Free"}
                    </div>
                    <div className="inline-flex items-center gap-1 text-white/70">
                      <QrCode className="h-3.5 w-3.5" />
                      Tap to view QR & details
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {!sorted.length && (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-white/80">
                You don’t have any passes yet.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
                >
                  Browse Events
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-3 h-10 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
                >
                  Go Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== Small components ========== */

function SummaryPill({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-white/60">{label}</p>
        <p className="mt-1 text-lg md:text-xl font-semibold">{value}</p>
      </div>
      <div className="text-[11px] text-white/50">{hint}</div>
    </div>
  );
}
