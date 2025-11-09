import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { usePasses } from "../contexts/PassContext";
import { CheckCircle2, XCircle, QrCode } from "lucide-react";

export default function EventCheckins() {
  const { eventId } = useParams();
  const { fetchCheckins } = usePasses();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => setRows(await fetchCheckins(eventId)))();
  }, [eventId, fetchCheckins]);

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="relative z-10 mx-auto w-[92%] max-w-[1000px] py-6 md:py-10">
        <div className="flex items-center justify-between">
          <Link
            to={`/events/${eventId}`}
            className="text-sm text-white/80 hover:text-white"
          >
            ← Back
          </Link>
          <h1 className="text-xl md:text-2xl font-semibold">
            <span className="font-forum text-[#19cfbc]">Check-ins</span>
          </h1>
          <Link
            to={`/events/${eventId}/scan`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
          >
            <QrCode className="h-4 w-4" /> Scan
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-5 text-xs text-white/60 px-2">
            <div>Status</div>
            <div>Name</div>
            <div>Email</div>
            <div>Time</div>
            <div>Notes</div>
          </div>
          <div className="mt-2 divide-y divide-white/5">
            {rows.map((r) => (
              <div
                key={r._id}
                className="grid grid-cols-5 items-center gap-2 px-2 py-2 text-sm"
              >
                <div className="inline-flex items-center gap-1">
                  {r.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-300" />
                  )}
                  {r.success ? "OK" : "Fail"}
                </div>
                <div>{r.userSnapshot?.name || "—"}</div>
                <div className="text-white/70">
                  {r.userSnapshot?.email || "—"}
                </div>
                <div className="text-white/70">
                  {new Date(r.at).toLocaleString()}
                </div>
                <div className="text-white/70">{r.notes || ""}</div>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="py-8 text-center text-white/60">
                No check-ins recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
