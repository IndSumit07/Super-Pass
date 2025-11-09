// src/pages/EventScan.jsx (or Scan.jsx)
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
} from "lucide-react";
import { usePasses } from "../contexts/PassContext";
import { useToast } from "../components/Toast";

const SCANNER_ID = "sp-qr-reader";

export default function EventScan() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { scanPass } = usePasses();
  const toast = useToast();

  const [active, setActive] = useState(true);
  const [lastCode, setLastCode] = useState("");
  const [status, setStatus] = useState("Point the camera at a QR…");

  // refs to the scanner instances
  const scannerRef = useRef(null);
  const html5Ref = useRef(null);

  const stopScanner = useCallback(async () => {
    try {
      setActive(false);
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

  const handleDecoded = useCallback(
    async (decodedText) => {
      if (!decodedText || decodedText === lastCode) return;

      setLastCode(decodedText);
      setStatus("Validating…");
      await stopScanner(); // prevent double fires

      const res = await scanPass({
        eventId,
        code: decodedText,
        notes: "scanned@camera",
      });

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

      setStatus("Scan complete.");
      setTimeout(() => {
        setLastCode("");
        setStatus("Point the camera at a QR…");
        startScanner(); // restart for next scan
      }, 900);
    },
    [eventId, lastCode, scanPass, stopScanner, toast]
  );

  const startScanner = useCallback(async () => {
    setActive(true);
    setStatus("Starting camera…");

    // Try the convenience UI scanner
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
          // delegate to handler (no await in this callback)
          handleDecoded(decodedText);
        },
        () => setStatus("Camera active. Scanning…")
      );

      setStatus("Camera active. Scanning…");
      return;
    } catch {
      // Fallback to manual API
      try {
        const h = new Html5Qrcode(SCANNER_ID);
        html5Ref.current = h;
        const devices = await Html5Qrcode.getCameras();
        const camId = devices?.[0]?.id || { facingMode: "environment" };

        await h.start(
          camId,
          { fps: 10, qrbox: 260 },
          (decodedText) => handleDecoded(decodedText),
          () => setStatus("Camera active. Scanning…")
        );

        setStatus("Camera active. Scanning…");
      } catch (err2) {
        console.error(err2);
        setStatus(
          "Camera failed to start. Check permissions or try another browser."
        );
        setActive(false);
      }
    }
  }, [handleDecoded]);

  // mount / unmount lifecycle
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
      const el = document.getElementById(SCANNER_ID);
      if (el) el.innerHTML = "";
    };
    // We intentionally depend only on eventId to restart per-event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="relative z-10 mx-auto w-[92%] max-w-[900px] py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            <span className="font-forum text-[#19cfbc]">QR Scanner</span>
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

        {/* Scanner */}
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0b1020]/40 aspect-video grid place-items-center">
              <div id={SCANNER_ID} className="w-full h-full" />
            </div>

            <div className="mt-3 text-xs text-white/70 inline-flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              <span>{status}</span>
            </div>

            <div className="mt-2 text-[11px] text-white/50">
              Tip: Allow camera permission. On iOS Safari, use HTTPS or
              localhost.
            </div>
          </div>

          {/* Side panel */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white/90">Recent</h3>
            <div className="mt-2 text-xs text-white/70 break-words">
              {lastCode ? (
                <>
                  <div className="text-white/80">Last code:</div>
                  <pre className="mt-1 p-2 rounded-lg bg-[#0b1020]/50 border border-white/10 whitespace-pre-wrap break-all">
                    {lastCode}
                  </pre>
                </>
              ) : (
                <div className="text-white/60">No code scanned yet.</div>
              )}
            </div>

            <div className="mt-4">
              <Link
                to={`/events/${eventId}/checkins`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-sm hover:bg-white/10 transition"
              >
                <QrCode className="h-4 w-4" />
                View Check-ins
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
