import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mail,
  User2,
  Tag,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";

const FAQ = [
  {
    q: "How do I create an event?",
    a: "Go to Events → Create Event. Fill basic details, schedule, venue, and ticketing, then set status to Published.",
    tags: ["events", "create"],
  },
  {
    q: "How do I enable paid tickets?",
    a: "When editing your event, toggle 'This is a paid event' and set a price. Payments use Razorpay test/live depending on your keys and account state.",
    tags: ["payments", "tickets"],
  },
  {
    q: "Where can I see tickets I bought?",
    a: "Open My Passes from the top navigation or /my-passes. Click any pass to view QR and event details.",
    tags: ["passes", "qr"],
  },
  {
    q: "How do I scan passes at my event?",
    a: "Open /scan or the Scan button on your event page. Allow camera access and point at the QR. You can also enter codes manually.",
    tags: ["scan", "qr", "check-in"],
  },
  {
    q: "Why is Razorpay checkout blocked or limited?",
    a: "If you see 'Activation Required', your Razorpay account is still under review. You can use test mode; enable live only after KYC is approved.",
    tags: ["razorpay", "activation"],
  },
  {
    q: "Can I host online events?",
    a: "Yes. Set mode to Online or Hybrid. You can add a link in description or send it to registered attendees.",
    tags: ["online", "mode"],
  },
];

export default function Help() {
  const { user, forceRefresh } = useAuth();
  const toast = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  const [faqQuery, setFaqQuery] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form
  const [form, setForm] = useState({
    name: user?.firstName || user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
    priority: "low",
    tags: "",
  });

  const axiosAuth = useMemo(() => {
    const inst = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      timeout: 30000,
    });
    inst.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    inst.interceptors.response.use(
      (r) => r,
      async (err) => {
        const original = err.config;
        if (!original || err?.response?.status !== 401) throw err;
        if (original._retry) throw err;
        original._retry = true;
        const newToken = await forceRefresh();
        if (newToken) original.headers.Authorization = `Bearer ${newToken}`;
        return inst(original);
      }
    );
    return inst;
  }, [API_URL, forceRefresh]);

  // fetch my tickets
  const loadMine = async () => {
    setLoadingTickets(true);
    try {
      const { data } = await axiosAuth.get("/help/mine");
      if (data?.success) setTickets(data.data || []);
    } catch (e) {
      toast.error({ title: "Failed to load queries" });
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFAQ = useMemo(() => {
    const q = faqQuery.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.filter(
      (i) =>
        i.q.toLowerCase().includes(q) ||
        i.a.toLowerCase().includes(q) ||
        (i.tags || []).join(" ").toLowerCase().includes(q)
    );
  }, [faqQuery]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error({ title: "Please fill subject and message." });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        priority: form.priority,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const { data } = await axiosAuth.post("/help", payload);
      if (data?.success) {
        toast.success({ title: "Query submitted" });
        setForm((f) => ({ ...f, subject: "", message: "", tags: "" }));
        loadMine();
      } else {
        throw new Error(data?.message || "Failed");
      }
    } catch (err) {
      toast.error({
        title: "Could not submit",
        description: err?.message || "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(900px_420px_at_84%_-10%,rgba(64,131,255,0.22),transparent_60%),radial-gradient(780px_360px_at_-18%_12%,rgba(0,174,255,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-[1100px] py-6 md:py-10">
        {/* Header with search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-blue-500" />
              <span className="h-3 w-3 rounded bg-indigo-500" />
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">Help</span>{" "}
              <span className="text-white/80">& Support</span>
            </h1>
          </div>

          <div className="w-full md:w-[420px]">
            <div className="h-11 px-3 rounded-xl border border-white/10 bg-[#0c1222]/60 flex items-center gap-2">
              <Search className="h-4 w-4 text-white/60" />
              <input
                type="text"
                value={faqQuery}
                onChange={(e) => setFaqQuery(e.target.value)}
                placeholder="Search help topics, e.g. payments, passes, scan…"
                className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
              />
            </div>
          </div>
        </div>

        {/* Grid: FAQ + Submit + My Tickets */}
        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          {/* FAQ */}
          <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <h3 className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> Frequently asked questions
            </h3>
            <div className="mt-3 divide-y divide-white/5">
              {filteredFAQ.map((item, idx) => (
                <details
                  key={idx}
                  className="group py-3"
                  open={idx === 0 && !faqQuery}
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                    <span className="text-white/90 font-medium">{item.q}</span>
                    <span className="text-xs text-white/50">Show</span>
                  </summary>
                  <p className="mt-2 text-sm text-white/75">{item.a}</p>
                  {!!item.tags?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
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
                </details>
              ))}
              {filteredFAQ.length === 0 && (
                <div className="py-8 text-sm text-white/60 text-center">
                  No results. Try a different keyword.
                </div>
              )}
            </div>
          </section>

          {/* Submit Query */}
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <h3 className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Submit a query
            </h3>

            <form onSubmit={submit} className="mt-3 space-y-3">
              <Field
                label="Your name"
                icon={User2}
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="Optional if you’re logged in"
              />
              <Field
                label="Email"
                icon={Mail}
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="We'll reply here"
              />
              <Field
                label="Subject"
                value={form.subject}
                onChange={(v) => setForm((f) => ({ ...f, subject: v }))}
                placeholder="Brief subject"
                required
              />
              <Textarea
                label="Message"
                value={form.message}
                onChange={(v) => setForm((f) => ({ ...f, message: v }))}
                placeholder="Describe your question or issue"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                  ]}
                />
                <Field
                  label="Tags (comma separated)"
                  value={form.tags}
                  onChange={(v) => setForm((f) => ({ ...f, tags: v }))}
                  placeholder="payments, passes"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full h-11 rounded-xl text-sm inline-flex items-center justify-center gap-2 transition ${
                  submitting
                    ? "bg-white/10 text-white/60 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500"
                }`}
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting…" : "Submit query"}
              </button>
              <p className="text-[11px] text-white/50">
                We usually reply within 1–2 business days.
              </p>
            </form>
          </section>
        </div>

        {/* My Queries */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
          <h3 className="text-sm font-semibold text-white/90">
            Your submitted queries
          </h3>

          <div className="mt-3 divide-y divide-white/5">
            {loadingTickets && (
              <div className="py-6 text-sm text-white/60">Loading…</div>
            )}
            {!loadingTickets && tickets.length === 0 && (
              <div className="py-6 text-sm text-white/60">
                You haven’t submitted any queries yet.
              </div>
            )}
            {tickets.map((t) => (
              <div
                key={t._id}
                className="py-3 grid md:grid-cols-12 gap-2 text-sm"
              >
                <div className="md:col-span-6">
                  <div className="font-medium text-white/90">{t.subject}</div>
                  <div className="text-white/70 whitespace-pre-line mt-1">
                    {t.message}
                  </div>
                  {!!t.tags?.length && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {t.tags.map((tg) => (
                        <span
                          key={tg}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-white/10 bg-[#0b1020]/40"
                        >
                          <Tag className="h-3 w-3" />
                          {tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-3 flex items-center gap-2">
                  {t.status === "closed" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" /> Closed
                    </span>
                  ) : t.status === "in_progress" ? (
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <Clock className="h-4 w-4" /> In progress
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sky-300">
                      <AlertTriangle className="h-4 w-4" /> Open
                    </span>
                  )}
                </div>
                <div className="md:col-span-3 text-white/60">
                  {fmtDate(t.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer nav crumbs */}
        <div className="mt-6 flex items-center justify-between text-sm text-white/70">
          <Link to="/" className="hover:text-white">
            ← Home
          </Link>
          <Link to="/events" className="hover:text-white">
            Browse Events →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- small inputs matching theme ---------- */
function Field({ label, value, onChange, placeholder, icon: Icon, required }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">
        {label} {required && <span className="text-rose-300">*</span>}
      </span>
      <div className="h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-white/60" />}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent outline-none text-sm placeholder:text-white/50"
        />
      </div>
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder, required }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">
        {label} {required && <span className="text-rose-300">*</span>}
      </span>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-white/10 bg-[#0c1222]/60 p-3 text-sm outline-none placeholder:text-white/50"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/70 mb-1">{label}</span>
      <div className="h-11 px-3 rounded-lg border border-white/10 bg-[#0c1222]/60 flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-sm appearance-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0b0f1a]">
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
