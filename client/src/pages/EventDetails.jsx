import React, { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  IndianRupee,
  ArrowLeft,
  Share2,
  Users,
  Clock,
  Tag,
  Building2,
  Link2,
} from "lucide-react";
import { useEvents } from "../contexts/EventContext";
import Loader from "../components/Loader";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { singleEvent, loading, fetchEventById } = useEvents();

  useEffect(() => {
    fetchEventById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const ev = singleEvent;

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

  const banner = ev.bannerUrl || ev.banner?.secure_url || ev.cover || null;
  const logo = ev.logoUrl || ev.logo?.secure_url || ev.logo || null;

  const where =
    ev.venueName ||
    [ev.address, ev.city, ev.state, ev.pincode].filter(Boolean).join(", ") ||
    ev.city ||
    "—";

  const price = Number(ev.price || 0);
  const isPaid = !!ev.isPaid && price > 0;

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

          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
            }}
            title="Copy event link"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

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

            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/events/${ev._id || ev.id}/register`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
              >
                Register Now
              </Link>
              <Link
                to={`/events/${ev._id || ev.id}/tickets`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
              >
                View Tickets
              </Link>
            </div>
          </div>
        </div>

        {/* Organizer / Links / Venue */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white/90">Organizer</h3>
            <div className="mt-2 text-sm text-white/75 inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {ev.organization || ev.organizer || "—"}
            </div>

            {/* Eligibility */}
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

            {/* Team settings */}
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

            {/* Stages */}
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

            {/* Timeline */}
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

          <div className="space-y-4">
            {/* Ticketing */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-white/90">Ticketing</h3>
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
                <Link
                  to={`/events/${ev._id || ev.id}/tickets`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 h-10 text-sm hover:bg-white/10 transition"
                >
                  Tickets
                </Link>
              </div>
            </div>

            {/* Links */}
            {(ev.website || (ev.socials || []).length) && (
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

            {/* Venue card */}
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
    </div>
  );
};

export default EventDetails;
