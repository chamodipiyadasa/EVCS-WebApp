// src/pages/BookingQR.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getBooking } from "../services/bookings";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Booking QR Code</h1>
        <button
          onClick={() => nav("/app/bookings")}
          className="text-slate-600 hover:text-slate-900 underline"
        >
          Back to Bookings
        </button>
      </div>

      <div className="bg-white border rounded-xl p-5 text-center shadow-sm">
        <div ref={qrWrapRef} className="inline-block p-3 border rounded-xl">
          <QRCodeCanvas value={qrToken} size={220} includeMargin={true} />
        </div>

        <div className="mt-4">
          <div className="font-semibold text-sm text-slate-700 break-all">{qrToken}</div>
          <p className="text-xs text-slate-500 mt-1">Scan this QR at the charging station.</p>
        </div>

        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={downloadQR}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Download
          </button>
          <button
            onClick={printQR}
            className="px-4 py-2 rounded border hover:bg-slate-50"
          >
            Print
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-2 text-sm">
        <Row label="Booking ID" value={id} />
        <Row label="Owner NIC" value={nic} />
        <Row label="Station ID" value={stationId} />
        <Row label="Date" value={date} />
        <Row label="Time" value={`${start} – ${end}`} />
        <Row label="Status" value={status} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <div className="text-slate-500">{label}</div>
      <div className="font-medium break-all">{value ?? "—"}</div>
    </div>
  );
}
