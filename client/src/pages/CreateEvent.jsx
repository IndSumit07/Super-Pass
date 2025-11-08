// src/pages/CreateEvent.jsx
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock4,
  MapPin,
  IndianRupee,
  Users,
  Tag,
  Upload,
  X,
  Check,
  Link2,
  Globe2,
  Building2,
  ListChecks,
  Plus,
} from "lucide-react";
import { useToast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { useEvents } from "../contexts/EventContext"; // 👈 use EventContext
import Loader from "../components/Loader";

/**
 * SuperPaas — Create Event
 */
const CreateEvent = () => {
  const navigate = useNavigate();
  const toast = useToast?.();
  const { user } = useAuth?.() || {};
  const { createEvent, actionLoading } = useEvents(); // ✅ use the correct flag

  const [form, setForm] = useState({
    // basics
    title: "",
    subtitle: "",
    organization: "",
    category: "",
    description: "",
    mode: "Offline",

    // schedule
    start: "",
    end: "",
    regDeadline: "",

    // venue
    venueName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    // ticketing
    isPaid: false,
    price: "",
    capacity: "",

    // team
    isTeamEvent: false,
    teamMin: "",
    teamMax: "",

    // dynamic lists
    tags: [],
    eligibility: [],
    stages: [], // {title, start, end, mode, description}
    timeline: [], // {title, date, note}

    // extras
    prizes: "",
    rewards: "",
    submissionFormat: "",
    judgingCriteria: "",
    resources: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    faqLink: "",
    website: "",
    socials: [], // [{label,url}]
    status: "draft",

    // style
    bannerColor: "#0ea5e9",
  });

  // Banner
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const bannerFileRef = useRef(null);

  // Logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const logoFileRef = useRef(null);

  // local small inputs
  const [tagInput, setTagInput] = useState("");
  const [eligibilityInput, setEligibilityInput] = useState("");
  const [socialLabel, setSocialLabel] = useState("");
  const [socialUrl, setSocialUrl] = useState("");

  // stage draft
  const [stageDraft, setStageDraft] = useState({
    title: "",
    start: "",
    end: "",
    mode: "Offline",
    description: "",
  });

  // timeline draft
  const [timelineDraft, setTimelineDraft] = useState({
    title: "",
    date: "",
    note: "",
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  /* ------------ helpers: lists ------------ */
  const addTag = (e) => {
    e?.preventDefault?.();
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };
  const removeTag = (t) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const addEligibility = (e) => {
    e?.preventDefault?.();
    const t = eligibilityInput.trim();
    if (!t) return;
    setForm((f) => ({ ...f, eligibility: [...f.eligibility, t] }));
    setEligibilityInput("");
  };
  const removeEligibility = (t) =>
    setForm((f) => ({
      ...f,
      eligibility: f.eligibility.filter((x) => x !== t),
    }));

  const addSocial = (e) => {
    e?.preventDefault?.();
    const label = socialLabel.trim();
    const url = socialUrl.trim();
    if (!label || !url) return;
    setForm((f) => ({ ...f, socials: [...f.socials, { label, url }] }));
    setSocialLabel("");
    setSocialUrl("");
  };
  const removeSocial = (idx) =>
    setForm((f) => ({ ...f, socials: f.socials.filter((_, i) => i !== idx) }));

  const addStage = (e) => {
    e?.preventDefault?.();
    const { title, start, end, mode, description } = stageDraft;
    if (!title.trim()) return;
    setForm((f) => ({
      ...f,
      stages: [
        ...f.stages,
        { title: title.trim(), start, end, mode, description },
      ],
    }));
    setStageDraft({
      title: "",
      start: "",
      end: "",
      mode: "Offline",
      description: "",
    });
  };
  const removeStage = (idx) =>
    setForm((f) => ({ ...f, stages: f.stages.filter((_, i) => i !== idx) }));

  const addTimelineItem = (e) => {
    e?.preventDefault?.();
    const { title, date, note } = timelineDraft;
    if (!title.trim() || !date) return;
    setForm((f) => ({
      ...f,
      timeline: [...f.timeline, { title: title.trim(), date, note }],
    }));
    setTimelineDraft({ title: "", date: "", note: "" });
  };
  const removeTimelineItem = (idx) =>
    setForm((f) => ({
      ...f,
      timeline: f.timeline.filter((_, i) => i !== idx),
    }));

  /* ------------ uploads ------------ */
  const onPickBanner = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onPickLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  /* ------------ validations ------------ */
  const canSubmit = useMemo(() => {
    const required = [
      "title",
      "organization",
      "category",
      "start",
      "end",
      "city",
    ];
    const missing = required.some((k) => !String(form[k]).trim());
    const priceOk = !form.isPaid || Number(form.price) >= 0;
    const capacityOk = !form.capacity || Number(form.capacity) >= 0;
    const teamOk =
      !form.isTeamEvent ||
      ((Number(form.teamMin) > 0 || Number(form.teamMax) > 0) &&
        Number(form.teamMax || 0) >= Number(form.teamMin || 0));
    return !missing && priceOk && capacityOk && teamOk;
  }, [form]);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting || actionLoading) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else if (typeof v === "object" && v !== null)
          fd.append(k, JSON.stringify(v));
        else fd.append(k, v ?? "");
      });
      if (bannerFile) fd.append("banner", bannerFile);
      if (logoFile) fd.append("logo", logoFile);

      // ✅ actually hit the API
      const created = await createEvent(fd);
      if (created?._id || created?.slug) {
        navigate(`/events`);
        return;
      }
    } catch (err) {
      toast?.error?.({
        title: "Create failed",
        description: err?.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* BG */}
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

      {/* Banner (full width) */}
      <div className="relative z-10 w-full">
        <div className="relative w-full h-[180px] md:h-[260px]">
          <div className="absolute inset-0">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Banner"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${form.bannerColor}22, transparent 60%)`,
                }}
              />
            )}
          </div>

          {/* header overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-[1100px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-blue-500" />
                <span className="h-3 w-3 rounded bg-indigo-500" />
                <span className="h-3 w-3 rounded bg-emerald-500" />
                <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
              </div>
              <h1 className="text-lg md:text-xl font-semibold tracking-tight">
                <span className="font-forum text-[#19cfbc]">SuperPaas</span>{" "}
                <span className="text-white/85">Create Event</span>
              </h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 text-xs md:text-sm hover:bg-white/10 transition"
            >
              Back
            </button>
          </div>
        </div>

        {/* Header controls UNDER banner: Logo + Banner + Color */}
        <div className="mx-auto w-[92%] max-w-[1100px] mt-5 mb-4 relative z-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo uploader + preview */}
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-xl border border-white/10 bg-[#0b1020]/40">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-[10px] text-white/50">
                    Logo
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickLogo}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs md:text-sm transition"
                >
                  <Upload className="h-4 w-4" />
                  Upload logo
                </button>
              </div>
            </div>

            {/* Banner + color controls */}
            <div className="flex items-center gap-2">
              <input
                ref={bannerFileRef}
                type="file"
                accept="image/*"
                onChange={onPickBanner}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bannerFileRef.current?.click()}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs md:text-sm transition"
              >
                <Upload className="h-4 w-4" />
                Upload banner
              </button>
              <input
                type="color"
                name="bannerColor"
                value={form.bannerColor}
                onChange={onChange}
                className="h-9 w-9 p-1 rounded-lg border border-white/10 bg-white/5"
                title="Accent color"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <form
        onSubmit={onSubmit}
        className="relative z-10 mx-auto w-[92%] max-w-[1100px] pb-10 grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Left (2 cols) */}
        <section className="lg:col-span-2 space-y-4">
          <Card title="Basic Details">
            <div className="grid md:grid-cols-2 gap-3">
              <Field
                label="Event title"
                name="title"
                value={form.title}
                onChange={onChange}
                required
                placeholder="e.g., TechX Summit 2025"
              />
              <Field
                label="Subtitle (optional)"
                name="subtitle"
                value={form.subtitle}
                onChange={onChange}
                placeholder="e.g., Future of AI & Startups"
              />
              <Field
                label="Organization"
                name="organization"
                value={form.organization}
                onChange={onChange}
                required
                icon={<Building2 className="h-4 w-4 text-white/60" />}
                placeholder="Your institute or company"
              />
              <Select
                label="Category"
                name="category"
                value={form.category}
                onChange={onChange}
                required
                options={[
                  "Conference",
                  "Workshop",
                  "Meetup",
                  "Hackathon",
                  "College Fest",
                  "Webinar",
                  "Competition",
                ]}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <Select
                label="Event mode"
                name="mode"
                value={form.mode}
                onChange={onChange}
                options={["Offline", "Online", "Hybrid"]}
              />
              <Field
                label="Start"
                name="start"
                type="datetime-local"
                value={form.start}
                onChange={onChange}
                required
                icon={<CalendarDays className="h-4 w-4 text-white/60" />}
              />
              <Field
                label="End"
                name="end"
                type="datetime-local"
                value={form.end}
                onChange={onChange}
                required
                icon={<Clock4 className="h-4 w-4 text-white/60" />}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <Field
                label="Registration deadline"
                name="regDeadline"
                type="datetime-local"
                value={form.regDeadline}
                onChange={onChange}
                icon={<CalendarDays className="h-4 w-4 text-white/60" />}
              />
              <div>
                <p className="text-xs text-white/60 mb-1">Single or Teamup ?</p>
                <ToggleField
                  label="Team-up event?"
                  checked={form.isTeamEvent}
                  onChange={(v) => setForm((f) => ({ ...f, isTeamEvent: v }))}
                />
              </div>
              <div className="hidden md:block" aria-hidden />
            </div>

            {form.isTeamEvent && (
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <Field
                  label="Team size (min)"
                  name="teamMin"
                  type="number"
                  value={form.teamMin}
                  onChange={onChange}
                  placeholder="e.g., 1"
                  icon={<Users className="h-4 w-4 text-white/60" />}
                />
                <Field
                  label="Team size (max)"
                  name="teamMax"
                  type="number"
                  value={form.teamMax}
                  onChange={onChange}
                  placeholder="e.g., 4"
                  icon={<Users className="h-4 w-4 text-white/60" />}
                />
              </div>
            )}

            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Describe agenda, rounds, speakers, perks, etc."
            />

            {/* Tags */}
            <div className="mt-3">
              <label className="block text-xs text-white/70 mb-1">
                Tags (press Enter or click Add)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag(e)}
                  placeholder="e.g., Tech, AI, Startups"
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#0c1222]/60 px-3 text-sm outline-none placeholder:text-white/50"
                />
                <button
                  onClick={addTag}
                  className="h-10 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                  type="button"
                >
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.tags.map((t) => (
                    <Chip key={t} onRemove={() => removeTag(t)}>
                      <Tag className="h-3 w-3" />
                      {t}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="Venue">
            <div className="grid md:grid-cols-2 gap-3">
              <Field
                label="Venue name"
                name="venueName"
                value={form.venueName}
                onChange={onChange}
                placeholder="Auditorium A"
                icon={<MapPin className="h-4 w-4 text-white/60" />}
              />
              <Field
                label="Address"
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Street, area"
              />
              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={onChange}
                required
              />
              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={onChange}
              />
              <Field
                label="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={onChange}
              />
            </div>
          </Card>

          <Card title="Eligibility">
            <p className="text-xs text-white/60 mb-2">
              Add multiple criteria (e.g., College year, Branch, Age ≥18, Open
              to all, etc.)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={eligibilityInput}
                onChange={(e) => setEligibilityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEligibility(e)}
                placeholder="e.g., Undergraduate students, Year 2 & above"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0c1222]/60 px-3 text-sm outline-none placeholder:text-white/50"
              />
              <button
                onClick={addEligibility}
                className="h-10 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                type="button"
              >
                Add
              </button>
            </div>
            {form.eligibility.length > 0 && (
              <ul className="mt-3 space-y-2">
                {form.eligibility.map((el, idx) => (
                  <li
                    key={`${el}-${idx}`}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0b1020]/40 px-3 py-2 text-sm"
                  >
                    <span className="text-white/85">{el}</span>
                    <button
                      type="button"
                      className="text-white/70 hover:text-white"
                      onClick={() => removeEligibility(el)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Stages / Rounds">
            <p className="text-xs text-white/60 mb-2">
              Add stages like Registration, Screening, Round 1, Finals, etc.
            </p>

            <div className="grid md:grid-cols-2 gap-3">
              <Field
                label="Stage title"
                value={stageDraft.title}
                onChange={(e) =>
                  setStageDraft((s) => ({ ...s, title: e.target.value }))
                }
                placeholder="e.g., Round 1: Submission"
              />
              <Select
                label="Mode"
                value={stageDraft.mode}
                onChange={(e) =>
                  setStageDraft((s) => ({ ...s, mode: e.target.value }))
                }
                options={["Offline", "Online", "Hybrid"]}
              />
              <Field
                label="Start"
                type="datetime-local"
                value={stageDraft.start}
                onChange={(e) =>
                  setStageDraft((s) => ({ ...s, start: e.target.value }))
                }
                icon={<CalendarDays className="h-4 w-4 text-white/60" />}
              />
              <Field
                label="End"
                type="datetime-local"
                value={stageDraft.end}
                onChange={(e) =>
                  setStageDraft((s) => ({ ...s, end: e.target.value }))
                }
                icon={<Clock4 className="h-4 w-4 text-white/60" />}
              />
            </div>
            <Textarea
              label="Description"
              value={stageDraft.description}
              onChange={(e) =>
                setStageDraft((s) => ({ ...s, description: e.target.value }))
              }
              placeholder="What happens in this round, deliverables, scoring…"
            />
            <div className="mt-2">
              <button
                type="button"
                onClick={addStage}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm transition"
              >
                <Plus className="h-4 w-4" />
                Add stage
              </button>
            </div>

            {form.stages.length > 0 && (
              <div className="mt-4 space-y-2">
                {form.stages.map((st, idx) => (
                  <div
                    key={`${st.title}-${idx}`}
                    className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-white/90">
                        {st.title}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStage(idx)}
                        className="text-white/70 hover:text-white"
                        aria-label="Remove stage"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/70">
                      {st.start && <span>Start: {fmtDate(st.start)}</span>}
                      {st.end && <span>End: {fmtDate(st.end)}</span>}
                      <span>Mode: {st.mode}</span>
                    </div>
                    {st.description && (
                      <p className="mt-2 text-white/80">{st.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Timeline">
            <p className="text-xs text-white/60 mb-2">
              Add key milestones like “Reg opens”, “Results announced”, etc.
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <Field
                label="Title"
                value={timelineDraft.title}
                onChange={(e) =>
                  setTimelineDraft((s) => ({ ...s, title: e.target.value }))
                }
                placeholder="e.g., Results announced"
              />
              <Field
                label="Date & time"
                type="datetime-local"
                value={timelineDraft.date}
                onChange={(e) =>
                  setTimelineDraft((s) => ({ ...s, date: e.target.value }))
                }
                icon={<CalendarDays className="h-4 w-4 text-white/60" />}
              />
              <Field
                label="Note (optional)"
                value={timelineDraft.note}
                onChange={(e) =>
                  setTimelineDraft((s) => ({ ...s, note: e.target.value }))
                }
                placeholder="Short note"
              />
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={addTimelineItem}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm transition"
              >
                <Plus className="h-4 w-4" />
                Add timeline item
              </button>
            </div>

            {form.timeline.length > 0 && (
              <div className="mt-4 space-y-2">
                {form.timeline.map((t, idx) => (
                  <div
                    key={`${t.title}-${idx}`}
                    className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3 text-sm flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-white/90">{t.title}</div>
                      <div className="text-xs text-white/70">
                        {fmtDate(t.date)} {t.note ? `• ${t.note}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimelineItem(idx)}
                      className="text-white/70 hover:text-white"
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Additional Details">
            <div className="grid md:grid-cols-2 gap-3">
              <Textarea
                label="Prizes (if any)"
                name="prizes"
                value={form.prizes}
                onChange={onChange}
                placeholder="Prize pool, breakdown, perks for winners…"
              />
              <Textarea
                label="Rewards & Benefits"
                name="rewards"
                value={form.rewards}
                onChange={onChange}
                placeholder="Certificates, goodies, internships, credits…"
              />
              <Textarea
                label="Submission format"
                name="submissionFormat"
                value={form.submissionFormat}
                onChange={onChange}
                placeholder="What to submit, file types, size limits, links…"
              />
              <Textarea
                label="Judging criteria"
                name="judgingCriteria"
                value={form.judgingCriteria}
                onChange={onChange}
                placeholder="Innovation, impact, feasibility, presentation…"
              />
              <Textarea
                label="Resources (optional)"
                name="resources"
                value={form.resources}
                onChange={onChange}
                placeholder="Reference docs, datasets, design assets, APIs…"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Contact name"
                  name="contactName"
                  value={form.contactName}
                  onChange={onChange}
                />
                <Field
                  label="Contact email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={onChange}
                />
                <Field
                  label="Contact phone"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={onChange}
                />
                <Field
                  label="FAQ link (optional)"
                  name="faqLink"
                  value={form.faqLink}
                  onChange={onChange}
                  icon={<ListChecks className="h-4 w-4 text-white/60" />}
                />
              </div>
            </div>

            {/* socials / website */}
            <div className="mt-3 grid md:grid-cols-3 gap-3">
              <Field
                label="Website (optional)"
                name="website"
                value={form.website}
                onChange={onChange}
                icon={<Globe2 className="h-4 w-4 text-white/60" />}
              />
              <Field
                label="Social label"
                value={socialLabel}
                onChange={(e) => setSocialLabel(e.target.value)}
                placeholder="e.g., Instagram"
                icon={<Link2 className="h-4 w-4 text-white/60" />}
              />
              <Field
                label="Social URL"
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={addSocial}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm transition"
              >
                <Plus className="h-4 w-4" />
                Add social link
              </button>
            </div>
            {form.socials.length > 0 && (
              <ul className="mt-3 space-y-2">
                {form.socials.map((s, idx) => (
                  <li
                    key={`${s.label}-${idx}`}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0b1020]/40 px-3 py-2 text-sm"
                  >
                    <span className="text-white/85">
                      <b>{s.label}:</b> {s.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSocial(idx)}
                      className="text-white/70 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Right column */}
        <section className="space-y-4">
          <Card title="Ticketing">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/80">
                This is a paid event
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    isPaid: !f.isPaid,
                    price: f.isPaid ? "" : f.price,
                  }))
                }
                className={`h-7 w-12 rounded-full border border-white/10 transition ${
                  form.isPaid ? "bg-blue-600" : "bg-white/10"
                }`}
                aria-pressed={form.isPaid}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white translate-x-0.5 transition ${
                    form.isPaid ? "translate-x-[22px]" : ""
                  }`}
                />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Field
                label="Price"
                name="price"
                type="number"
                value={form.isPaid ? form.price : ""}
                onChange={onChange}
                placeholder={form.isPaid ? "e.g., 499" : "Free"}
                disabled={!form.isPaid}
                icon={<IndianRupee className="h-4 w-4 text-white/60" />}
              />
              <Field
                label="Capacity"
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={onChange}
                placeholder="Max tickets (optional)"
                icon={<Users className="h-4 w-4 text-white/60" />}
              />
            </div>
            <p className="mt-2 text-xs text-white/60">
              Payments issue QR tickets with scan-ready check-ins.
            </p>
          </Card>

          {/* Status & review & submit */}
          <Card title="Publish">
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={onChange}
              options={["draft", "published", "private"]}
            />

            <ul className="mt-3 space-y-2 text-xs text-white/70">
              <ReviewItem ok={!!form.title} text="Title added" />
              <ReviewItem ok={!!form.organization} text="Organization added" />
              <ReviewItem ok={!!form.category} text="Category selected" />
              <ReviewItem ok={!!form.start && !!form.end} text="Schedule set" />
              <ReviewItem ok={!!form.city} text="Venue city added" />
              <ReviewItem
                ok={!form.isPaid || String(form.price).trim() !== ""}
                text={form.isPaid ? "Price set" : "Free event"}
              />
              <ReviewItem
                ok={
                  !form.isTeamEvent ||
                  ((Number(form.teamMin) > 0 || Number(form.teamMax) > 0) &&
                    Number(form.teamMax || 0) >= Number(form.teamMin || 0))
                }
                text={
                  form.isTeamEvent ? "Team size valid" : "Individual allowed"
                }
              />
            </ul>

            <button
              type="submit"
              disabled={!canSubmit || submitting || actionLoading}
              className={`mt-4 w-full h-11 rounded-xl text-sm inline-flex items-center justify-center transition ${
                !canSubmit || submitting || actionLoading
                  ? "bg-white/10 cursor-not-allowed text-white/60"
                  : "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500"
              }`}
            >
              {submitting || actionLoading ? "Submitting…" : "Create Event"}
            </button>
            <p className="mt-2 text-[11px] text-white/50 text-center">
              By creating, you agree to our Terms & Policies.
            </p>
          </Card>
        </section>
      </form>

      {/* Submitting overlay */}
      {(submitting || actionLoading) && <Loader />}
    </div>
  );
};

/* ----------------- UI bits ----------------- */

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      {title && (
        <p className="text-sm text-white/85 mb-3 inline-flex items-center gap-2">
          {title}
        </p>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
  icon,
}) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">
        {label} {required && <span className="text-rose-300">*</span>}
      </span>
      <div
        className={`h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 flex items-center gap-2 ${
          disabled ? "opacity-60" : ""
        }`}
      >
        {icon}
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
        />
      </div>
    </label>
  );
}

function Textarea({ label, name, value, onChange, placeholder, required }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">
        {label} {required && <span className="text-rose-300">*</span>}
      </span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={5}
        className="w-full rounded-lg border border-white/10 bg-[#0c1222]/60 p-3 text-sm outline-none placeholder:text-white/50"
      />
    </label>
  );
}

function Select({ label, name, value, onChange, options = [], required }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">
        {label} {required && <span className="text-rose-300">*</span>}
      </span>
      <div className="h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 flex items-center">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full bg-transparent outline-none text-sm appearance-none"
        >
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0b0f1a]">
              {opt}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60">
      <span className="text-xs text-white/70">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-7 w-12 rounded-full border border-white/10 transition ${
          checked ? "bg-blue-600" : "bg-white/10"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white translate-x-0.5 transition ${
            checked ? "translate-x-[22px]" : ""
          }`}
        />
      </button>
    </div>
  );
}

function ReviewItem({ ok, text }) {
  return (
    <li
      className={`inline-flex items-center gap-2 ${
        ok ? "text-white/80" : "text-white/50"
      }`}
    >
      <span
        className={`h-5 w-5 grid place-items-center rounded-full border ${
          ok
            ? "border-emerald-400/30 bg-emerald-400/10"
            : "border-white/10 bg-white/5"
        }`}
      >
        {ok ? (
          <Check className="h-3.5 w-3.5 text-emerald-300" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        )}
      </span>
      {text}
    </li>
  );
}

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-white/10 bg-[#0b1020]/40">
      {children}
      <button
        type="button"
        className="ml-1 hover:text-white/90"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export default CreateEvent;
