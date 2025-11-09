// src/pages/Scan.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePasses } from "../contexts/PassContext";
import { useAuth } from "../contexts/AuthContext";
import { Camera, QrCode, ArrowLeft, Scan, Clipboard, Info } from "lucide-react";

const hasBarcode = "BarcodeDetector" in window;

const ScanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { scanPass, scanBusy } = usePasses();
  const { user } = useAuth();

  // You can pass ?eventId=... when navigating from an Event details page
  const [eventId, setEventId] = useState(params.get("eventId") || "");
  const [last, setLast] = useState(null);
  const [err, setErr] = useState("");
  const [manual, setManual] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detRef = useRef(null);
  const loopRef = useRef(false);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    loopRef.current = false;
  };

  const startCamera = async () => {
    setErr("");
    if (!eventId) {
      setErr("Select an event to scan for (append ?eventId=...)");
      return;
    }
    try {
      if (!hasBarcode)
        throw new Error("BarcodeDetector not supported by this browser.");
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      detRef.current = detector;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      loopRef.current = true;
      scanLoop();
    } catch (e) {
      setErr(e.message || "Failed to start camera.");
    }
  };

  const scanLoop = async () => {
    if (!loopRef.current || !videoRef.current || !detRef.current) return;
    try {
      const detections = await detRef.current.detect(videoRef.current);
      if (detections?.length) {
        const code = detections[0].rawValue;
        await onCode(code);
      }
    } catch (e) {
      // ignore frame errors
    }
    requestAnimationFrame(scanLoop);
  };

  const onCode = async (code) => {
    if (!eventId) {
      setErr("Missing eventId");
      return;
    }
    stopStream(); // pause to avoid multiple scans
    const res = await scanPass({ eventId, code });
    if (res) {
      setLast(res);
    }
  };

  const onManualSubmit = async (e) => {
    e.preventDefault();
    if (!manual.trim()) return;
    await onCode(manual.trim());
  };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="relative z-10 mx-auto w-[92%] max-w-[900px] py-6 md:py-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">Scan Pass</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block">
                <span className="block text-xs text-white/70 mb-1">
                  Event ID
                </span>
                <input
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="Paste eventId (or navigate here with ?eventId=...)"
                  className="w-full h-11 rounded-lg border border-white/10 bg-[#0c1222]/60 px-3 text-sm outline-none"
                />
              </label>

              <div className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3">
                <p className="text-xs text-white/70">
                  Use camera scanning (recommended) or enter QR text manually.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-sm"
                  >
                    <Camera className="h-4 w-4" /> Start Camera
                  </button>
                  <button
                    type="button"
                    onClick={stopStream}
                    className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                  >
                    Stop
                  </button>
                </div>

                <video
                  ref={videoRef}
                  className="mt-3 w-full rounded-lg border border-white/10"
                  playsInline
                  muted
                />
              </div>

              <form onSubmit={onManualSubmit} className="flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="QR code text (e.g., passId:mac16)"
                  className="flex-1 h-11 rounded-lg border border-white/10 bg-[#0c1222]/60 px-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 h-11 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                >
                  <Scan className="h-4 w-4" /> Submit
                </button>
              </form>

              {err && <p className="text-sm text-rose-300">{err}</p>}
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3">
                <h3 className="text-sm font-semibold text-white/90">
                  Last Result
                </h3>
                {!last ? (
                  <p className="mt-2 text-sm text-white/70">No scans yet.</p>
                ) : (
                  <div className="mt-2 text-sm space-y-1">
                    <div>
                      Event: <b>{last.event?.title}</b>
                    </div>
                    <div>
                      User:{" "}
                      <b>
                        {last.user?.name ||
                          last.user?.fullname ||
                          last.user?.email}
                      </b>
                    </div>
                    <div>
                      Ticket: <b>{last.ticketName || "General"}</b>
                    </div>
                    <div>
                      Amount:{" "}
                      <b>{last.amount > 0 ? `₹ ${last.amount}` : "Free"}</b>
                    </div>
                    <div>
                      Status:{" "}
                      <b>{last.checkedInAt ? "Checked-in" : "Active"}</b>
                    </div>
                    <button
                      onClick={() =>
                        navigate(
                          `/events/${
                            last.event?._id || last.event?.id
                          }/checkins`
                        )
                      }
                      className="mt-3 inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-sm"
                    >
                      View all check-ins
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0b1020]/40 p-3">
                <h3 className="text-sm font-semibold text-white/90">Tip</h3>
                <p className="mt-1 text-xs text-white/70">
                  For best results, open on a phone and disable
                  ad-blockers/Brave shields for the camera to work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanPage;
