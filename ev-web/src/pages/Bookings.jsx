// src/pages/Bookings.jsx
import { useEffect, useMemo, useState } from "react";
import { listStations } from "../services/stations";
import {
  listBookingsAggregate,
  cancelBooking,
  approveBooking,
} from "../services/bookings";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* ---------- helpers ---------- */
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
  const n = (hashCode(String(raw)) % 1000) + 1;
  return `${prefix}${String(n).padStart(width, "0")}`;
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Bookings() {
  const nav = useNavigate();

  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("ALL");
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null); // bookingId while acting

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        setLoading(true);
        const ss = await listStations().catch(() => []);
        if (!cancelled) setStations(ss);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await listBookingsAggregate({
        stationId,
        date,
        days: 1,
      });
      setRows(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId, date]);

  const stationMap = useMemo(() => {
    const map = {};
    for (const s of stations) map[s.id] = s;
    return map;
  }, [stations]);

  const doCancel = async (id) => {
    try {
      setLoadingAction(id);
      await cancelBooking(id);
      toast.success("Booking cancelled");
      await refresh();
    } catch (err) {
      const msg = err?.message || "Cancel failed";
      toast.error(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  const doApprove = async (id) => {
    try {
      setLoadingAction(id);
      await approveBooking(id);
      toast.success("Booking approved (QR generated)");
      await refresh();
    } catch (err) {
      const msg = err?.message || "Approve failed";
      toast.error(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Management</div>
          <div className="text-2xl font-semibold">Bookings</div>
        </div>
        <button
          onClick={() => nav("/app/bookings/new")}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
        >
          + New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-sm grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Station</label>
          <select
            className="border rounded-lg px-3 py-2"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
          >
            <option value="ALL">All stations</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Date</label>
          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            className="border rounded-lg px-4 py-2 w-full sm:w-auto hover:bg-slate-50"
            onClick={refresh}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <div className="border-b px-5 py-3 text-sm text-slate-600">
          {rows.length} result{rows.length !== 1 ? "s" : ""}
        </div>
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No bookings found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">Booking</th>
                <th className="px-4 py-2 text-left">Owner NIC</th>
                <th className="px-4 py-2 text-left">Station</th>
                <th className="px-4 py-2 text-center">Date</th>
                <th className="px-4 py-2 text-center">Time</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const st = stationMap[b.stationId];
                return (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="text-xs text-slate-400">
                        {prettyId("BOOK", b.id)}
                      </div>
                      <div className="font-medium">{b.id.slice(0, 10)}…</div>
                    </td>
                    <td className="px-4 py-2">{b.nic}</td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{st?.name || "—"}</div>
                      <div className="text-xs text-slate-500">{b.stationId}</div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {b.date?.year}-{String(b.date?.month).padStart(2, "0")}-
                      {String(b.date?.day).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {b.start?.hour?.toString().padStart(2, "0")}:
                      {b.start?.minute?.toString().padStart(2, "0")} →
                      {b.end?.hour?.toString().padStart(2, "0")}:
                      {b.end?.minute?.toString().padStart(2, "0")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          b.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : b.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : b.status === "Completed"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 justify-end">
                        <Link
                          to={`/app/bookings/${b.id}`}
                          className="px-3 py-1 border rounded-lg hover:bg-slate-50"
                          title="Edit"
                        >
                          Edit
                        </Link>

                        {b.status === "Pending" && (
                          <button
                            disabled={loadingAction === b.id}
                            onClick={() => doApprove(b.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                            title="Approve & Generate QR"
                          >
                            Approve
                          </button>
                        )}

                        {b.status === "Approved" && (
                          <Link
                            to={`/app/bookings/${b.id}/qr`}
                            className="px-3 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                            title="Show QR"
                          >
                            QR
                          </Link>
                        )}

                        {b.status !== "Cancelled" &&
                          b.status !== "Completed" && (
                            <button
                              disabled={loadingAction === b.id}
                              onClick={() => doCancel(b.id)}
                              className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
