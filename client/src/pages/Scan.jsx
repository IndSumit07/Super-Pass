import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QrCode, CheckCircle2, XCircle, Camera, Keyboard } from "lucide-react";
import { usePasses } from "../contexts/PassContext";
import { useEvents } from "../contexts/EventContext";
import Loader from "../components/Loader";

export default function ScanPass() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { scanPass, fetchCheckins } = usePasses();
  const { fetchEventById, singleEvent, loading: eventLoading } = useEvents();

  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [checks, setChecks] = useState([]);
  const [mode, setMode] = useState("manual"); // manual | camera (placeholder)

  useEffect(() => {
    fetchEventById(eventId);
    (async () => {
      const rows = await fetchCheckins(eventId);
      setChecks(rows);
    })();
    // eslint-disable-next-line
  }, [eventId]);

  const onScan = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    const res = await scanPass({ eventId, code: value.trim() });
    if (res?.success) {
      setChecks((p) => [
        {
          _id: res.data.checkinId,
          success: true,
          userSnapshot: res.data.user,
          at: res.data.at,
          notes: "",
        },
        ...p,
      ]);
      setValue("");
    }
    setBusy(false);
  };

  if (eventLoading) return <Loader />;

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-[900px] py-6 md:py-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-white/80 hover:text-white transition"
          >
            ← Back
          </button>
          <h1 className="text-xl md:text-2xl font-semibold">
            <span className="font-forum text-[#19cfbc]">Scan Passes</span>{" "}
            <span className="text-white/80">— {singleEvent?.title}</span>
          </h1>
          <div />
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90">Scanner</h3>
              <div className="inline-flex rounded-lg border border-white/10 overflow-hidden">
                <button
                  className={`px-3 h-9 text-sm ${
                    mode === "manual"
                      ? "bg-white/10"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setMode("manual")}
                >
                  <Keyboard className="h-4 w-4 inline-block mr-1" /> Manual
                </button>
                <button
                  className={`px-3 h-9 text-sm ${
                    mode === "camera"
                      ? "bg-white/10"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => setMode("camera")}
                  title="Camera mode placeholder (bring your own reader or add react-qr-reader)"
                >
                  <Camera className="h-4 w-4 inline-block mr-1" /> Camera
                </button>
              </div>
            </div>

            {mode === "manual" ? (
              <div className="mt-3">
                <div className="h-11 px-3 rounded-xl border border-white/10 bg-[#0c1222]/60 flex items-center">
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Paste QR payload or Pass ID"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
                <button
                  onClick={onScan}
                  disabled={busy || !value.trim()}
                  className={`mt-3 h-10 px-4 rounded-xl text-sm ${
                    busy || !value.trim()
                      ? "bg-white/10 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500"
                  }`}
                >
                  {busy ? "Scanning…" : "Scan"}
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-white/10 bg-[#0b1020]/40 p-4 text-sm text-white/70">
                Camera mode placeholder. Install <code>react-qr-reader</code> or{" "}
                <code>html5-qrcode</code> to enable webcam scanning and call{" "}
                <code>onScan</code> with the detected code.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white/90">
              Recent Check-ins
            </h3>
            <div className="mt-2 space-y-2 max-h-[420px] overflow-auto pr-1">
              {checks.map((c) => (
                <div
                  key={c._id}
                  className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3 text-sm flex items-center gap-3"
                >
                  {c.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-300" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-white/90">
                      {c.userSnapshot?.name || "Guest"}
                      <span className="ml-2 text-white/60 text-xs">
                        {c.userSnapshot?.email}
                      </span>
                    </div>
                    <div className="text-white/60 text-xs">
                      {new Date(c.at).toLocaleString()}{" "}
                      {c.notes ? `• ${c.notes}` : ""}
                    </div>
                  </div>
                </div>
              ))}
              {checks.length === 0 && (
                <div className="text-white/60 text-sm">No scans yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
