// src/pages/EventCheckins.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePasses } from "../contexts/PassContext";
import {
  QrCode,
  ChevronLeft,
  Search,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  User2,
  Ticket,
} from "lucide-react";

export default function EventCheckins() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { fetchParticipants } = usePasses();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // all | checked | pending
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const rows = await fetchParticipants(eventId);
      if (mounted) {
        setParticipants(rows || []);
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [eventId, fetchParticipants]);

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
        p.user?.fullname?.firstname + " " + p.user?.fullname?.lastname ||
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

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-[1100px] py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to event
            </button>
          </div>

          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            <span className="font-forum text-[#19cfbc]">Manage Check-ins</span>
          </h1>

          <div className="flex items-center gap-2">
            <Link
              to={`/events/${eventId}/scan`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            >
              <QrCode className="h-4 w-4" /> Open Scanner
            </Link>
          </div>
        </div>

        {/* Controls */}
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
              All ({counts.total})
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
                  <div
                    key={ticketId}
                    className="grid grid-cols-12 gap-2 px-4 py-3 text-sm"
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
                        <span className="text-sm">{ticketId}</span>
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
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Hint row */}
        <div className="mt-3 text-xs text-white/55">
          Tip: Use the <b>Open Scanner</b> button for live QR scanning. This
          page updates when you refresh or revisit.
        </div>
      </div>
    </div>
  );
}
