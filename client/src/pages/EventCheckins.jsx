// src/pages/EventCheckins.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePasses } from "../contexts/PassContext";
import { ArrowLeft, Download, Search } from "lucide-react";

const EventCheckins = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { checkins, fetchCheckins } = usePasses();
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchCheckins(eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return checkins;
    return (checkins || []).filter((p) =>
      `${p.user?.name || p.user?.fullname || ""} ${p.user?.email || ""} ${
        p.ticketName || ""
      }`
        .toLowerCase()
        .includes(s)
    );
  }, [q, checkins]);

  const exportCSV = () => {
    const rows = [
      ["Name", "Email", "Ticket", "Amount", "CheckedInAt"],
      ...filtered.map((p) => [
        p.user?.name || p.user?.fullname || "",
        p.user?.email || "",
        p.ticketName || "General",
        p.amount || 0,
        p.checkedInAt ? new Date(p.checkedInAt).toISOString() : "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkins_${eventId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="relative z-10 mx-auto w-[92%] max-w-[1000px] py-6 md:py-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            <div className="h-10 px-3 rounded-xl border border-white/10 bg-[#0c1222]/60 flex items-center gap-2">
              <Search className="h-4 w-4 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search attendee…"
                className="bg-transparent outline-none text-sm placeholder:text-white/50"
              />
            </div>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h1 className="text-lg font-semibold">Check-ins</h1>
          <div className="mt-3 divide-y divide-white/5">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="py-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    {p.user?.name ||
                      p.user?.fullname ||
                      p.user?.email ||
                      "Attendee"}
                  </div>
                  <div className="text-xs text-white/70">
                    {p.user?.email || "—"} • {p.ticketName || "General"} •{" "}
                    {p.checkedInAt
                      ? new Date(p.checkedInAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div className="text-sm">
                  {p.amount > 0 ? `₹ ${p.amount}` : "Free"}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-10 text-sm text-white/60 text-center">
                No check-ins yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCheckins;
