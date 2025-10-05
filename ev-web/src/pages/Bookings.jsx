// src/pages/Bookings.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listBookingsAggregate,
  approveBooking,
  cancelBooking,
  generateQr,
} from "../services/bookings";
import { listStations } from "../services/stations";
import { useAuth } from "../auth/useAuth";
import toast from "react-hot-toast";

/* ---------- helpers ---------- */
const two = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
};
function fmtHM(x) {
  if (!x) return "";
  if (typeof x === "string") {
    const m = x.match(/^(\d{2}:\d{2})/);
    return m ? m[1] : x;
  }
  return x?.toString?.() || "";
}
function fmtYMD(d) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toISOString().slice(0, 10);
}
function toDateTime(dateStr, timeStr) {
  try {
    return new Date(`${dateStr}T${fmtHM(timeStr)}:00`);
  } catch {
    return new Date(NaN);
  }
}
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
function prettyId(prefix, raw, width = 3) {
  if (!raw) return `${prefix}${"".padStart(width, "0")}`;
  const n = (hashCode(String(raw)) % 1000) + 1; // 001..1000
  return `${prefix}${String(n).padStart(width, "0")}`;
}
function StatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-emerald-50 text-emerald-700",
    Completed: "bg-slate-100 text-slate-700",
    Canceled: "bg-rose-50 text-rose-700",
  };
  const cls = map[status] || "bg-slate-100 text-slate-700";
  return <span className={`px-2.5 py-1 rounded-full text-xs ${cls}`}>{status}</span>;
}

/* Rule helpers for enabling/disabling actions */
function canApprove(b) {
  return b?.status === "Pending";
}
function canCancel(b) {
  // Pending or Approved AND at least 12h before start
  if (!b) return false;
  if (!(b.status === "Pending" || b.status === "Approved")) return false;

  const start = toDateTime(fmtYMD(b.date), b.start);
  if (isNaN(start)) return false;

  const now = new Date();
  const diffHrs = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHrs >= 12;
}
function canGenerateQr(b) {
  return b?.status === "Approved";
}

/* ---------- page ---------- */
export default function Bookings() {
  const { role } = useAuth(); // Backoffice actions only if Backoffice
  const nav = useNavigate();

  // filters
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("ALL"); // "ALL" or specific id
  const [date, setDate] = useState("");              // empty = window
  const [daysWindow, setDaysWindow] = useState(14);  // when date is empty

  // data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // load stations first
  useEffect(() => {
    (async () => {
      const s = await listStations().catch(() => []);
      setStations(s || []);
    })();
  }, []);

  // load ALL bookings aggregated (depending on filters)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listBookingsAggregate({
          stationId,
          date: date.trim(),
          days: Number(daysWindow) || 14,
        });
        // sort by start datetime
        const sorted = (Array.isArray(data) ? data : []).slice().sort((a, b) => {
          const tA = toDateTime(fmtYMD(a.date), a.start).getTime();
          const tB = toDateTime(fmtYMD(b.date), b.start).getTime();
          return tA - tB;
        });
        setItems(sorted);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    })();
  }, [stationId, date, daysWindow]);

  // client search
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (b) =>
        (b.id || "").toLowerCase().includes(needle) ||
        (b.nic || "").toLowerCase().includes(needle) ||
        (b.stationId || "").toLowerCase().includes(needle)
    );
  }, [items, q]);

  // upcoming (next 24h) from filtered
  const now = new Date();
  const next24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcoming = useMemo(() => {
    return filtered.filter((b) => {
      const start = toDateTime(fmtYMD(b.date), b.start);
      return start >= now && start <= next24 && b.status !== "Canceled";
    });
  }, [filtered]);

  async function refresh() {
    const data = await listBookingsAggregate({
      stationId,
      date: date.trim(),
      days: Number(daysWindow) || 14,
    }).catch(() => []);
    const sorted = (Array.isArray(data) ? data : []).slice().sort((a, b) => {
      const tA = toDateTime(fmtYMD(a.date), a.start).getTime();
      const tB = toDateTime(fmtYMD(b.date), b.start).getTime();
      return tA - tB;
    });
    setItems(sorted);
  }

  async function onApprove(id) {
    try {
      await approveBooking(id);
      toast.success("Booking approved");
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error(String(e.message || "Approve failed"));
    }
  }

  async function onCancel(id) {
    try {
      await cancelBooking(id);
      toast.success("Booking canceled");
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error(String(e.message || "Cancel failed"));
    }
  }

  async function onGenerateQr(id) {
    try {
      const r = await generateQr(id); // approve if pending, else reuse
      if (!r?.qrToken) {
        toast.error("No QR token on this booking");
        return;
      }
      toast.success("QR ready");
      nav(`${id}/qr`, { state: r });
    } catch (e) {
      console.error(e);
      toast.error(String(e.message || "QR generation failed"));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Bookings</h1>
          <p className="text-slate-500 text-sm">
            All bookings (aggregated). Filter by station/date or browse a window.
          </p>
        </div>

        {/* Backoffice can create */}
        {role === "Backoffice" && (
          <Link
            to="new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          >
            <span className="text-base leading-none">＋</span> Add Booking
          </Link>
        )}
      </div>

      {/* Upcoming in next 24 hours */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Upcoming (next 24h)</div>
          <div className="text-sm text-slate-500">{upcoming.length} booking(s)</div>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-slate-500 text-sm mt-2">No upcoming bookings in the next 24 hours.</div>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>Booking</Th>
                  <Th>Owner NIC</Th>
                  <Th>Station</Th>
                  <Th>Date</Th>
                  <Th>Time</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((b) => (
                  <tr key={`up-${b.id}`} className="border-t">
                    <Td className="font-medium">{prettyId("BOOKING", b.id)}</Td>
                    <Td>{b.nic}</Td>
                    <Td>{prettyId("STATION", b.stationId)}</Td>
                    <Td>{fmtYMD(b.date)}</Td>
                    <Td>{fmtHM(b.start)} – {fmtHM(b.end)}</Td>
                    <Td><StatusBadge status={b.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-3 space-y-3">
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-slate-500">Station</div>
            <select
              className="border rounded px-3 py-1.5 w-full"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
            >
              <option value="ALL">All stations</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {prettyId("STATION", s.id)} — {s.name} ({s.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs text-slate-500">Specific date (optional)</div>
            <input
              type="date"
              className="border rounded px-3 py-1.5 w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="text-[11px] text-slate-500 mt-1">
              Leave empty to use a window.
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Window (days) when date empty</div>
            <input
              type="number"
              min={1}
              max={60}
              className="border rounded px-3 py-1.5 w-full"
              value={daysWindow}
              onChange={(e) => setDaysWindow(e.target.value)}
              disabled={!!date}
            />
            <div className="text-[11px] text-slate-500 mt-1">
              Default 14 days (next 2 weeks).
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Search</div>
            <input
              className="border rounded px-3 py-1.5 w-full"
              placeholder="ID / NIC / Station"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* All bookings table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>Booking</Th>
                <Th>Owner NIC</Th>
                <Th>Station</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Status</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="border-t">
                    <Td className="font-medium">{prettyId("BOOKING", b.id)}</Td>
                    <Td>{b.nic}</Td>
                    <Td>{prettyId("STATION", b.stationId)}</Td>
                    <Td>{fmtYMD(b.date)}</Td>
                    <Td>{fmtHM(b.start)} – {fmtHM(b.end)}</Td>
                    <Td><StatusBadge status={b.status} /></Td>
                    <Td className="text-right pr-4">
                      <div className="inline-flex items-center gap-2">
                        {role === "Backoffice" && (
                          <>
                            {/* Approve */}
                            <button
                              className="px-3 py-1 rounded border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => onApprove(b.id)}
                              disabled={!canApprove(b)}
                              title={canApprove(b) ? "Approve" : "Only Pending can be approved"}
                            >
                              Approve
                            </button>

                            {/* Cancel */}
                            <button
                              className="px-3 py-1 rounded border text-rose-700 border-rose-300 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => onCancel(b.id)}
                              disabled={!canCancel(b)}
                              title={
                                canCancel(b)
                                  ? "Cancel booking"
                                  : "Can cancel only if Pending/Approved and ≥ 12h before start"
                              }
                            >
                              Cancel
                            </button>

                            {/* Generate QR */}
                            <button
                              className="px-3 py-1 rounded border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => onGenerateQr(b.id)}
                              disabled={!canGenerateQr(b)}
                              title={canGenerateQr(b) ? "Generate QR" : "QR is for Approved bookings"}
                            >
                              Generate QR
                            </button>

                            <Link
                              to={`${b.id}`}
                              className="px-3 py-1 rounded border hover:bg-slate-50"
                              title="Edit"
                            >
                              Edit
                            </Link>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */
function Th({ children, className = "" }) {
  return <th className={`px-4 py-3 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
