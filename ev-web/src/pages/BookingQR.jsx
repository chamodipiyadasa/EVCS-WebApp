// src/pages/BookingQR.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getBooking } from "../services/bookings";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

/* ---------- helpers (pretty IDs + time/date) ---------- */
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function prettyId(prefix, raw, width = 3) {
  if (!raw) return `${prefix}${"".padStart(width, "0")}`;
  const n = (hashCode(String(raw)) % 1000) + 1; // 001..1000
  return `${prefix}${String(n).padStart(width, "0")}`;
}

// Accepts backend DateOnly {year,month,day} OR "YYYY-MM-DD"
function fmtDate(d) {
  if (!d) return "—";
  if (typeof d === "string") return d;
  const y = d.year ?? d.Year, m = d.month ?? d.Month, dd = d.day ?? d.Day;
  if (y && m && dd) return `${y}-${String(m).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  return "—";
}

// Accepts backend TimeOnly {hour,minute,second} OR "HH:mm"|"HH:mm:ss"
function fmtTime(t) {
  if (!t) return "—";
  if (typeof t === "string") {
    const [h="00", m="00"] = t.split(":");
    return `${h.padStart(2,"0")}:${m.padStart(2,"0")}`;
  }
  const h = t.hour ?? t.Hour ?? 0;
  const m = t.minute ?? t.Minute ?? 0;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

export default function BookingQR() {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const [data, setData] = useState(loc.state || null);
  const qrWrapRef = useRef(null);

  // If no data passed via navigation, fetch booking (expects qrToken present)
  useEffect(() => {
    if (data) return;
    (async () => {
      try {
        const b = await getBooking(id);
        if (!b?.qrToken) {
          toast.error("No QR token available for this booking");
          nav("/app/bookings");
          return;
        }
        setData(b);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load booking");
        nav("/app/bookings");
      }
    })();
  }, [data, id, nav]);

  const copyQR = async () => {
    try {
      await navigator.clipboard.writeText(data?.qrToken || "");
      toast.success("QR token copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const downloadQR = () => {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data?.nic || "booking")}_QR.png`;
    a.click();
  };

  const printQR = () => window.print();

  if (!data) return <div className="text-center text-slate-500">Loading QR…</div>;

  const { qrToken, nic, stationId, date, start, end, status } = data;

  // Pretty labels (hide raw UUIDs)
  const prettyBooking = prettyId("BOOK", id);
  const prettyStation = prettyId("STATION", stationId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Bookings</div>
          <h1 className="text-2xl font-bold text-black">QR Code</h1>
        </div>
        <button
          onClick={() => nav("/app/bookings")}
          className="text-slate-600 hover:text-black underline"
        >
          Back to Bookings
        </button>
      </div>

      {/* QR Card */}
      <div className="bg-white border rounded-2xl p-6 text-center shadow-sm">
        <div className="inline-block p-3 border rounded-2xl" ref={qrWrapRef}>
          <QRCodeCanvas value={qrToken} size={240} includeMargin={true} />
        </div>

        <div className="mt-4">
          <div className="font-medium text-sm text-slate-700 break-all">
            {qrToken}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Present this QR at the charging station for check-in.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={copyQR}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50"
          >
            Copy
          </button>
          <button
            onClick={downloadQR}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Download
          </button>
          <button
            onClick={printQR}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50"
          >
            Print
          </button>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Row label="Booking" value={prettyBooking} strong />
          <Row label="Status" value={status} pill />
          <Row label="Owner NIC" value={nic} />
          <Row label="Station" value={prettyStation} />
          <Row label="Date" value={fmtDate(date)} />
          <Row label="Time" value={`${fmtTime(start)} → ${fmtTime(end)}`} />
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          header, footer { display: none !important; }
          body { background: #fff; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, strong = false, pill = false }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-slate-500">{label}</div>
      {pill ? (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value === "Approved"
              ? "bg-emerald-100 text-emerald-700"
              : value === "Pending"
              ? "bg-amber-100 text-amber-700"
              : value === "Completed"
              ? "bg-sky-100 text-sky-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {value}
        </span>
      ) : (
        <div className={`break-all ${strong ? "font-semibold text-black" : "font-medium"}`}>
          {value ?? "—"}
        </div>
      )}
    </div>
  );
}
