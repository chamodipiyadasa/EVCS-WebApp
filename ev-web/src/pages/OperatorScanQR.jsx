// src/pages/OperatorScanQR.jsx
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { scanQr, finalizeBooking } from "../services/bookings";
import toast from "react-hot-toast";

/* ---------- tiny UI bits ---------- */
function Pill({ tone = "slate", children }) {
  const map = {
    emerald: "bg-emerald-100 text-emerald-700",
    slate: "bg-slate-200 text-slate-600",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return <span className={`px-2 py-1 rounded-full text-xs ${map[tone]}`}>{children}</span>;
}
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <div className="text-slate-500">{label}</div>
      <div className="font-medium break-all">{value ?? "—"}</div>
    </div>
  );
}

/* ---------- helpers ---------- */
function getCameraHint() {
  // HTTPS is required except on localhost
  const isLocalhost = /^localhost(:\d+)?$/.test(window.location.host);
  const isSecure = window.isSecureContext || isLocalhost;
  if (!isSecure) {
    return "Camera requires HTTPS. Open the app on https:// or run on http://localhost during development.";
  }
  // Check API presence
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return "Camera API not available in this browser.";
  }
  return "";
}

function explainGetUserMediaError(err) {
  const name = err?.name || "";
  const track = (msg) => msg || (err?.message ? String(err.message) : "Camera error");

  if (name === "NotAllowedError" || name === "SecurityError") {
    return track(
      "Permission denied. Click the camera/lock icon in your browser’s address bar, allow camera access, then reload."
    );
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return track("No camera found. Plug in a camera or select a different device.");
  }
  if (name === "NotReadableError") {
    return track("Camera is in use by another app (Zoom/Meet/Teams). Close it and try again.");
  }
  if (name === "NotAllowedError") {
    return track("Camera access was blocked by the browser.");
  }
  return track();
}

export default function OperatorScanQR() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);

  const [supportedHint, setSupportedHint] = useState(getCameraHint());
  const [devices, setDevices] = useState([]); // video input devices
  const [deviceId, setDeviceId] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [manual, setManual] = useState("");
  const [result, setResult] = useState(null); // { bookingId, nic, stationId, date, start, end, status }

  /* -------- discover devices (after a gesture or permission) -------- */
  async function refreshDevices() {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const vids = all.filter((d) => d.kind === "videoinput");
      setDevices(vids);
      if (!deviceId && vids[0]?.deviceId) setDeviceId(vids[0].deviceId);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    setSupportedHint(getCameraHint());
    // Do not auto-start: many browsers require a user gesture.
    // We’ll still try to list devices if permissions already granted.
    navigator.mediaDevices?.enumerateDevices?.().then(() => refreshDevices());
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- camera controls -------- */
  async function startCamera() {
    setError("");
    setResult(null);

    const hint = getCameraHint();
    setSupportedHint(hint);
    if (hint) {
      toast.error(hint);
      return;
    }

    stopCamera(); // clear any previous stream

    const constraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: { ideal: "environment" } },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        await videoRef.current.play();
      }
      setCameraReady(true);
      setScanning(true);
      refreshDevices(); // now we can reveal exact labels on some browsers
      tick();
    } catch (e) {
      const msg = explainGetUserMediaError(e);
      setError(msg);
      setCameraReady(false);
      setScanning(false);
      toast.error(msg);
      console.error("getUserMedia error:", e);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
    setScanning(false);
    setCameraReady(false);
  }

  function tick() {
    rafRef.current = requestAnimationFrame(tick);
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code && code.data) onTokenDetected(code.data.trim());
  }

  /* -------- scan / verify -------- */
  async function onTokenDetected(token) {
    if (!token) return;
    const pausedByScan = scanning;
    if (pausedByScan) setScanning(false);

    try {
      setBusy(true);
      const res = await scanQr(token);
      setResult(res);
      toast.success("QR verified");
    } catch (e) {
      console.error(e);
      toast.error("QR verification failed");
      if (pausedByScan) setScanning(true);
    } finally {
      setBusy(false);
    }
  }

  async function verifyManual() {
    if (!manual.trim()) return toast.error("Enter a QR token");
    await onTokenDetected(manual.trim());
  }

  async function completeBooking() {
    if (!result?.bookingId) return;
    try {
      setBusy(true);
      await finalizeBooking(result.bookingId);
      toast.success("Session finalized");
      setResult((r) => r && { ...r, status: "Completed" });
    } catch (e) {
      console.error(e);
      toast.error("Finalize failed");
    } finally {
      setBusy(false);
    }
  }

  function scanAgain() {
    setResult(null);
    setManual("");
    if (cameraReady) setScanning(true);
  }

  async function onImageUpload(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      if (code && code.data) onTokenDetected(code.data.trim());
      else toast.error("No QR found in image");
    };
    img.onerror = () => toast.error("Invalid image");
    img.src = URL.createObjectURL(file);
  }

  /* -------- UI -------- */
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Scan / Verify Booking QR</h1>
          <p className="text-slate-500 text-sm">
            Use the camera, upload an image, or paste the token manually.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cameraReady ? (
            <Pill tone={scanning ? "emerald" : "slate"}>{scanning ? "Live" : "Paused"}</Pill>
          ) : (
            <Pill tone="rose">Not Ready</Pill>
          )}
        </div>
      </div>

      {/* Camera & Tools */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Camera */}
        <div className="bg-white border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Camera</div>
            {!!supportedHint && <Pill tone="amber">Notice</Pill>}
          </div>

          {supportedHint && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {supportedHint}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              className="border rounded px-3 py-2 flex-1"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              {devices.length === 0 ? (
                <option value="">Default camera</option>
              ) : (
                devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || "Camera"}
                  </option>
                ))
              )}
            </select>
            <div className="flex gap-2">
              <button onClick={startCamera} className="px-3 py-2 rounded border hover:bg-slate-50">
                Enable Camera
              </button>
              {cameraReady && (
                <>
                  {!scanning ? (
                    <button onClick={() => setScanning(true)} className="px-3 py-2 rounded border hover:bg-slate-50">
                      Resume
                    </button>
                  ) : (
                    <button onClick={() => setScanning(false)} className="px-3 py-2 rounded border hover:bg-slate-50">
                      Pause
                    </button>
                  )}
                  <button onClick={stopCamera} className="px-3 py-2 rounded border hover:bg-slate-50">
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>

          <video ref={videoRef} className="w-full rounded-lg bg-black/10" />
          <canvas ref={canvasRef} className="hidden" />

          {!!error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Upload & Manual */}
        <div className="bg-white border rounded-2xl p-4 space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Upload QR Image</div>
            <input type="file" accept="image/*" onChange={onImageUpload} />
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Manual Token</div>
            <div className="flex gap-2">
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Paste QR token here"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
              <button
                onClick={verifyManual}
                disabled={busy}
                className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-blue-700"
              >
                Verify
              </button>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="text-sm font-medium mb-2">Verification Result</div>
            {!result ? (
              <div className="text-slate-500 text-sm">No result yet.</div>
            ) : (
              <div className="rounded-xl border p-3">
                <Row label="Booking ID" value={result.bookingId} />
                <Row label="Owner NIC" value={result.nic} />
                <Row label="Station" value={result.stationId} />
                <Row label="Date" value={result.date} />
                <Row label="Time" value={`${result.start} – ${result.end}`} />
                <Row label="Status" value={result.status} />
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={scanAgain} className="px-3 py-2 rounded border hover:bg-slate-50">
                    Scan again
                  </button>
                  {result.status === "Approved" && (
                    <button
                      onClick={completeBooking}
                      disabled={busy}
                      className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Finalize
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
