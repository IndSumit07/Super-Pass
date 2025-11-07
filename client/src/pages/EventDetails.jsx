import React, { useMemo } from "react";
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
} from "lucide-react";

// Same demo data as Events.jsx — move to a shared module for real apps
const EVENTS = [
  {
    id: "techx-2025",
    title: "TechX Summit 2025",
    date: "2025-11-22T10:30:00",
    venue: "Auditorium A",
    price: 999,
    category: "Conference",
    tags: ["Tech", "AI", "Startups"],
    cover: null,
    short: "A full-day summit on AI, product, and the future of software.",
    description:
      "TechX Summit brings together developers, founders, and product leaders to discuss AI, growth, and the next wave of software. Expect keynotes, panels, and breakout sessions with hands-on demos.",
    capacity: 1200,
    duration: "8h",
    organizer: "SuperPass Team",
  },
  {
    id: "design-sprint",
    title: "Design Sprint — Day 1",
    date: "2025-12-03T09:00:00",
    venue: "Studio 2",
    price: 0,
    category: "Workshop",
    tags: ["Design", "UX"],
    cover: null,
    short: "Hands-on sprint to ideate, prototype, and validate UX flows.",
    description:
      "Kick off a focused design sprint. Rapid ideation, lightning talks, and prototyping to validate user flows. Ideal for product designers and PMs.",
    capacity: 60,
    duration: "6h",
    organizer: "Design Guild",
  },
  {
    id: "hackathon-finale",
    title: "Hackathon Finale Night",
    date: "2025-12-12T20:00:00",
    venue: "Hall C",
    price: 299,
    category: "Hackathon",
    tags: ["Coding", "Teams"],
    cover: null,
    short: "Final presentations, jury, and awards with live audience.",
    description:
      "Watch the top teams present, followed by jury Q&A and awards. Music, snacks, and a fun networking after-party.",
    capacity: 400,
    duration: "4h",
    organizer: "Dev Club",
  },
  {
    id: "growth-meetup",
    title: "Growth Marketing Meetup",
    date: "2026-01-08T18:30:00",
    venue: "Room B1",
    price: 199,
    category: "Meetup",
    tags: ["Marketing", "Growth"],
    cover: null,
    short: "Talks & networking on performance marketing and analytics.",
    description:
      "Meet practitioners discussing paid growth, attribution, and creative testing. Includes open networking and job board corner.",
    capacity: 150,
    duration: "3h",
    organizer: "Growth Collective",
  },
];

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const ev = useMemo(() => EVENTS.find((e) => e.id === id), [id]);
  const fmtDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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

      {/* Content */}
      <div className="relative z-10 mx-auto w-[92%] max-w-[900px] py-6 md:py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        {/* Hero */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="h-40 md:h-56 bg-gradient-to-br from-[#0f1530] to-[#142146] grid place-items-center">
            <span className="text-xs text-white/50">Event Cover</span>
          </div>
          <div className="p-5 md:p-6">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">{ev.title}</span>
            </h1>
            <p className="mt-2 text-white/75">{ev.short}</p>

            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {fmtDate(ev.date)}
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {ev.venue}
              </div>
              <div className="inline-flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                {ev.price > 0 ? `${ev.price}` : "Free"}
              </div>
              <div className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                Capacity: {ev.capacity}
              </div>
              <div className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration: {ev.duration}
              </div>
              <div className="inline-flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {ev.category}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ev.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-white/10 bg-[#0b1020]/40"
                >
                  <Tag className="h-3 w-3" />
                  {t}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mt-5">
              <h2 className="text-base font-semibold text-white/90">
                About this event
              </h2>
              <p className="mt-2 text-white/75 leading-relaxed">
                {ev.description}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/events/${ev.id}/register`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 px-4 h-11 text-sm hover:from-blue-500 hover:to-indigo-500 transition"
              >
                Register Now
              </Link>
              <Link
                to={`/events/${ev.id}/tickets`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 h-11 text-sm hover:bg-white/10 transition"
              >
                View Tickets
              </Link>
            </div>
          </div>
        </div>

        {/* Organizer / Extra */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white/90">Organizer</h3>
            <p className="mt-1 text-sm text-white/75">{ev.organizer}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white/90">Venue Info</h3>
            <p className="mt-1 text-sm text-white/75">
              {ev.venue}. Bring a valid ID and the QR ticket for entry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
