// src/pages/EventScan.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import {
  ChevronLeft,
  QrCode,
  Camera,
  CameraOff,
  RefreshCw,
  ScanLine,
  Keyboard,
  CheckCircle2,
  XCircle,
  Shield,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { usePasses } from "../contexts/PassContext";
import { useToast } from "../components/Toast";

const SCANNER_ID = "sp-qr-reader";

export default function EventScan() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { scanPass } = usePasses();
  const toast = useToast();

  // camera/scan state
  const [active, setActive] = useState(false); // start inactive → big CTA
  const [starting, setStarting] = useState(false);
  const [lastCode, setLastCode] = useState("");
  const [status, setStatus] = useState("Camera is idle. Tap Start to scan.");
  const [errMsg, setErrMsg] = useState("");

  // manual entry
  const [manual, setManual] = useState("");
  const [manualBusy, setManualBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null); // {success, message, data}

  // refs to html5-qrcode instances
  const scannerRef = useRef(null);
  const html5Ref = useRef(null);

  const stopScanner = useCallback(async () => {
    try {
      setActive(false);
      setStatus("Camera is idle. Tap Start to scan.");
      setErrMsg("");
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
      if (html5Ref.current) {
        if (html5Ref.current.isScanning) {
          await html5Ref.current.stop();
        }
        await html5Ref.current.clear();
        html5Ref.current = null;
      }
    } catch {
      /* noop */
    }
  }, []);

  const handleValidationResult = useCallback(
    (res) => {
      setLastResult(res || null);
      if (res?.success) {
        toast.success({
          title: "Checked-in",
          description:
            res?.message ||
            `Pass verified for ${res?.data?.userSnapshot?.name || "user"}.`,
        });
      } else {
        toast.error({
          title: "Invalid / already used",
          description: res?.message || "Could not verify this pass.",
        });
      }
    },
    [toast]
  );

  const handleDecoded = useCallback(
    async (decodedText) => {
      if (!decodedText || decodedText === lastCode) return;

      setLastCode(decodedText);
      setStatus("Validating…");

      // Pause scanning to prevent duplicate hits
      await stopScanner();

      const res = await scanPass({
        eventId,
        code: decodedText,
        notes: "scanned@camera",
      });

      handleValidationResult(res);

      setStatus("Scan complete.");
      setTimeout(() => {
        setLastCode("");
        setStatus("Camera is idle. Tap Start to scan.");
        // For continuous flow, auto-start again:
        startScanner();
      }, 800);
    },
    [eventId, lastCode, scanPass, stopScanner, handleValidationResult]
  );

  const startScanner = useCallback(async () => {
    if (starting) return;
    setStarting(true);
    setErrMsg("");
    setStatus("Starting camera…");

    try {
      setActive(true);

      // Try the UI wrapper first
      try {
        const s = new Html5QrcodeScanner(SCANNER_ID, {
          fps: 10,
          qrbox: (vw, vh) => {
            const size = Math.min(vw, vh) * 0.6;
            return { width: size, height: size };
          },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          aspectRatio: 1.777,
        });
        scannerRef.current = s;

        s.render(
          (decodedText /*, decodedResult*/) => {
            handleDecoded(decodedText);
          },
          (err /*, scanError*/) => {
            // Non-fatal scan errors; keep scanning
            if (
              typeof err === "string" &&
              err.toLowerCase().includes("error")
            ) {
              setStatus("Scanning…");
            }
          }
        );

        setStatus("Camera active. Scanning…");
      } catch {
        // Fallback to direct API
        const h = new Html5Qrcode(SCANNER_ID);
        html5Ref.current = h;

        // prefer environment cam if available
        const devices = await Html5Qrcode.getCameras();
        const camId = devices?.find((d) =>
          (d.label || "").toLowerCase().includes("back")
        )?.id ||
          devices?.[0]?.id || { facingMode: "environment" };

        await h.start(
          camId,
          { fps: 10, qrbox: 260 },
          (decodedText) => handleDecoded(decodedText),
          () => setStatus("Camera active. Scanning…")
        );

        setStatus("Camera active. Scanning…");
      }
    } catch (err) {
      console.error(err);
      setErrMsg(
        "Camera failed to start. Check permissions, use HTTPS (or localhost), and try again."
      );
      setActive(false);
      setStatus("Camera is idle. Tap Start to scan.");
    } finally {
      setStarting(false);
    }
  }, [handleDecoded, starting]);

  // Cleanup on unmount / route change
  useEffect(() => {
    return () => {
      stopScanner();
      const el = document.getElementById(SCANNER_ID);
      if (el) el.innerHTML = "";
    };
  }, [eventId, stopScanner]);

  const submitManual = async (e) => {
    e?.preventDefault?.();
    const code = manual.trim();
    if (!code) return;
    setManualBusy(true);
    try {
      const res = await scanPass({
        eventId,
        code,
        notes: "entered@manual",
      });
      handleValidationResult(res);
      if (res?.success) setManual("");
    } finally {
      setManualBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />

      <div className="relative z-10 mx-auto w-[92%] max-w-[1000px] py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-center">
            <span className="font-forum text-[#19cfbc]">Pass Scanner</span>
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => (active ? stopScanner() : startScanner())}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            >
              {active ? (
                <>
                  <CameraOff className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  Resume
                </>
              )}
            </button>
            <button
              onClick={() => {
                stopScanner().then(startScanner);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Restart
            </button>
          </div>
        </div>

        {/* Mobile-first CTA */}
        {!active && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-white/80 inline-flex items-center gap-2">
                <Shield className="h-4 w-4" />
                We need your permission to access the camera for scanning.
              </div>
              <button
                onClick={startScanner}
                disabled={starting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 px-4 h-11 text-sm transition"
              >
                <PlayCircle className="h-5 w-5" />
                {starting ? "Starting…" : "Start Scanning (Camera Access)"}
              </button>
            </div>
            <p className="mt-2 text-xs text-white/60">
              Tip: On iOS Safari use HTTPS or <code>localhost</code>. If you see
              a permission prompt, allow camera access.
            </p>
            {!!errMsg && (
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4" />
                {errMsg}
              </p>
            )}
          </div>
        )}

        {/* Main: Camera + Manual (stacked on mobile, 2-col on lg) */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Camera Scanner */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Camera Scanner
              </h3>
              <span
                className={`text-[11px] rounded-full px-2 py-0.5 border ${
                  active
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                    : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                {active ? "Live" : "Idle"}
              </span>
            </div>

            {/* Responsive viewport: square on mobile, video-ish on md+ */}
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-[#0b1020]/40">
              <div className="w-full aspect-square md:aspect-video grid place-items-center">
                <div id={SCANNER_ID} className="w-full h-full" />
              </div>
            </div>

            <div className="mt-3 text-xs text-white/70 inline-flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              <span>{status}</span>
            </div>

            <div className="mt-2 text-[11px] text-white/50">
              If the video area is blank, hit <b>Restart</b> or grant camera
              permission in your browser settings.
            </div>

            <div className="mt-3 rounded-lg border border-white/10 bg-[#0b1020]/40 p-3 text-xs">
              <div className="text-white/80">Last detected code:</div>
              <div className="mt-1 text-white/70 break-all">
                {lastCode || "—"}
              </div>
            </div>
          </div>

          {/* Manual Scanner */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/90 inline-flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Manual Code Entry
              </h3>
            </div>

            <form onSubmit={submitManual} className="mt-3 space-y-2">
              <label className="block">
                <span className="block text-xs text-white/70 mb-1">
                  Enter QR / Pass Code
                </span>
                <input
                  type="text"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="spass:..., passId, or custom code"
                  className="w-full h-11 rounded-lg border border-white/10 bg-[#0c1222]/60 px-3 text-sm outline-none placeholder:text-white/50"
                  inputMode="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </label>
              <button
                type="submit"
                disabled={manualBusy || !manual.trim()}
                className={`w-full h-11 rounded-xl text-sm inline-flex items-center justify-center transition ${
                  manualBusy || !manual.trim()
                    ? "bg-white/10 cursor-not-allowed text-white/60"
                    : "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500"
                }`}
              >
                {manualBusy ? "Checking…" : "Validate & Check-in"}
              </button>
            </form>

            {/* Result panel */}
            <div className="mt-4 rounded-xl border border-white/10 bg-[#0b1020]/40 p-3">
              <div className="flex items-center gap-2 text-sm">
                {lastResult?.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-300" />
                )}
                <span className="text-white/85">
                  {lastResult
                    ? lastResult.message ||
                      (lastResult.success ? "Valid" : "Invalid")
                    : "No validation yet."}
                </span>
              </div>

              {lastResult?.data?.userSnapshot && (
                <div className="mt-3 text-xs text-white/80">
                  <div>
                    <span className="text-white/60">Name: </span>
                    {lastResult.data.userSnapshot.name || "—"}
                  </div>
                  <div>
                    <span className="text-white/60">Email: </span>
                    {lastResult.data.userSnapshot.email || "—"}
                  </div>
                  <div>
                    <span className="text-white/60">Time: </span>
                    {new Date(lastResult.data.at).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/events/${eventId}/checkins`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
                >
                  <QrCode className="h-4 w-4" />
                  View Check-ins
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setLastResult(null);
                    setManual("");
                    setLastCode("");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
                >
                  <RefreshCw className="h-4 w-4" />
                  Clear Result
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            to={`/events/${eventId}`}
            className="text-sm text-white/80 hover:text-white"
          >
            ← Back to Event
          </Link>
          <Link
            to={`/events/${eventId}/checkins`}
            className="text-sm text-white/85 hover:text-white"
          >
            Manage Check-ins →
          </Link>
        </div>
      </div>
    </div>
  );
}
