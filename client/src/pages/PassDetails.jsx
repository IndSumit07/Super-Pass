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

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-[980px] py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mt-5 grid lg:grid-cols-3 gap-4">
          {/* Left: Ticket / Details */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-base font-semibold text-white/90">{e.title}</h2>
            <div className="mt-1 text-sm text-white/70">{e.organization}</div>

            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {new Date(e.start).toLocaleString()}
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {e.city}
              </div>
              <div className="inline-flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {e.category}
              </div>
              <div className="inline-flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                {isPaid ? price : "Free"}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0b1020]/50 p-4">
              <h4 className="text-sm font-semibold">Admission Status</h4>
              <p className="mt-1 text-sm text-white/75">
                {pass.checkedIn ? "Checked-in" : "Not checked-in"}
              </p>
            </div>
          </div>

          {/* Right: QR */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid place-items-center">
            <div className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
              <QrCode className="h-4 w-4" /> Your QR
            </div>
            <div className="mt-3 p-3 rounded-xl border border-white/10 bg-[#0b1020]/50">
              <QRCodeCanvas
                value={pass.qrPayload || pass._id}
                size={200}
                includeMargin
              />
            </div>
            <div className="mt-2 text-[11px] text-white/60 break-all text-center">
              {pass.qrPayload}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to={`/events/${pass.event}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
          >
            View Event
          </Link>
        </div>
      </div>
    </div>
  );
}
