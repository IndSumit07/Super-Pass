// src/pages/PassDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePasses } from "../contexts/PassContext";
import Loader from "../components/Loader";
import {
  QrCode,
  ArrowLeft,
  CalendarDays,
  MapPin,
  IndianRupee,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function PassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPassById, loading } = usePasses();
  const [pass, setPass] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await fetchPassById(id);
      setPass(p);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !pass) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
        <Loader />
      </div>
    );
  }

  const e = pass.eventSnapshot || {};
  const price = Number(e.price || 0);
  const isPaid = price > 0;
  const isCheckedIn = pass.checkedIn;

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
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(900px_420px_at_80%_-10%,rgba(25,207,188,0.15),transparent_60%),radial-gradient(780px_360px_at_-18%_12%,rgba(0,174,255,0.10),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-[980px] py-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mt-4 text-xl md:text-2xl font-semibold">
          <span className="font-forum text-[#19cfbc]">Pass</span>{" "}
          <span className="text-white/85">Details</span>
        </h1>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* Left: Ticket Info */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1324] to-[#0a1122] p-5 shadow-lg shadow-[#19cfbc0f]">
            <h2 className="text-lg font-semibold text-white/90">{e.title}</h2>
            <p className="text-sm text-white/70">{e.organization}</p>

            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="inline-flex items-center gap-2 text-white/80">
                <CalendarDays className="h-4 w-4 text-sky-400" />
                {fmtDate(e.start)}
              </div>
              <div className="inline-flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4 text-pink-400" />
                {e.city || "—"}
              </div>
              <div className="inline-flex items-center gap-2 text-white/80">
                <Tag className="h-4 w-4 text-violet-400" />
                {e.category || "Event"}
              </div>
              <div className="inline-flex items-center gap-2 text-white/80">
                <IndianRupee className="h-4 w-4 text-emerald-400" />
                {isPaid ? price : "Free"}
              </div>
            </div>

            {/* Status section */}
            <div
              className={`mt-5 rounded-xl border p-4 ${
                isCheckedIn
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : "border-amber-400/30 bg-amber-400/10"
              }`}
            >
              <div className="flex items-center gap-2">
                {isCheckedIn ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                )}
                <h4 className="text-sm font-semibold">
                  Admission Status:{" "}
                  <span
                    className={`ml-1 ${
                      isCheckedIn ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {isCheckedIn ? "Checked-in" : "Not checked-in"}
                  </span>
                </h4>
              </div>
              <p className="mt-2 text-sm text-white/70">
                {isCheckedIn
                  ? "This pass has been successfully scanned and verified at the event."
                  : "Show this pass QR code at entry to check in."}
              </p>
            </div>

            {/* Event link */}
            <div className="mt-6">
              <Link
                to={`/events/${pass.event}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-blue-600 to-sky-600 px-5 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
              >
                View Event
              </Link>
            </div>
          </div>

          {/* Right: QR Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-md shadow-[#19cfbc15]">
            <div className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[#19cfbc]" /> Your QR Pass
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0b1020]/60 p-3 grid place-items-center">
              <QRCodeCanvas
                value={pass.qrPayload || pass._id}
                size={220}
                includeMargin
                level="M"
              />
            </div>

            <div className="mt-3 text-[11px] text-white/60 break-all">
              {pass.qrPayload || pass._id}
            </div>

            <div className="mt-3 text-xs text-white/50">
              Present this QR code at event entry.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
