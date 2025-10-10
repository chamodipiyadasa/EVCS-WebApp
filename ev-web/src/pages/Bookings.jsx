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

function StatusBadge({ status }) {
  const cls =
    status === "Approved" ? "bg-emerald-100 text-emerald-700" :
    status === "Pending"  ? "bg-amber-100 text-amber-700"   :
    status === "Completed"? "bg-sky-100 text-sky-700"        :
                            "bg-rose-100 text-rose-700";
  return <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{status}</span>;
}

function Chip({ children, tone="slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    sky: "bg-sky-100 text-sky-700",
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return <span className={`px-2 py-1 rounded text-xs ${tones[tone]}`}>{children}</span>;
}

const Btn = ({ variant = "solid", color = "emerald", className = "", ...props }) => {
  const base = "px-3 py-2 rounded-lg text-sm font-medium transition";
  const palettes = {
    solid: {
      emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
      black: "bg-black hover:bg-black/90 text-white",
      violet: "bg-violet-600 hover:bg-violet-700 text-white",
      rose: "bg-rose-600 hover:bg-rose-700 text-white",
      sky: "bg-sky-600 hover:bg-sky-700 text-white",
      slate: "bg-slate-800 hover:bg-slate-900 text-white",
      blue: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    outline: {
      slate: "border border-slate-300 text-slate-700 hover:bg-slate-50",
      emerald: "border border-emerald-600 text-emerald-700 hover:bg-emerald-50",
    },
  };
  const style = palettes[variant]?.[color] || palettes.solid.emerald;
  return <button className={`${base} ${style} ${className}`} {...props} />;
};

/* ---------- main ---------- */
export default function Bookings() {
  const nav = useNavigate();

  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("ALL");
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null); // bookingId while acting

  // Drawer (View) state
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  // Status filter
  const [statusFilter, setStatusFilter] = useState("All"); // All | Pending | Approved | Completed | Cancelled

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
    return () => { cancelled = true; };
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await listBookingsAggregate({
        stationId,
        date,
        days: 1,
      });
      setRows(Array.isArray(data) ? data : []);
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

  const counts = useMemo(() => {
    const base = { All: rows.length, Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 };
    for (const r of rows) {
      if (base[r.status] != null) base[r.status] += 1;
    }
    return base;
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (statusFilter === "All") return rows;
    return rows.filter(r => r.status === statusFilter);
  }, [rows, statusFilter]);

  const doCancel = async (id) => {
    try {
      setLoadingAction(id);
      await cancelBooking(id);
      toast.success("Booking cancelled");
      await refresh();
      if (selected?.id === id) setOpenView(false);
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

  function openDetails(b) {
    setSelected(b);
    setOpenView(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Management</div>
          <div className="text-2xl font-bold text-black">Bookings</div>
        </div>
        <Btn color="green" onClick={() => nav("/app/bookings/new")}>+ New Booking</Btn>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Station</label>
            <select
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
            >
              <option value="ALL">All stations</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {prettyId("STATION", s.id)} — {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Btn variant="outline" color="slate" className="w-full sm:w-auto" onClick={refresh}>
              Refresh
            </Btn>
          </div>
        </div>

        {/* Status tabs with counts */}
        <div className="flex flex-wrap gap-2">
          {["All", "Pending", "Approved", "Completed", "Cancelled"].map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={
                  "px-3 py-2 rounded-lg text-sm border transition " +
                  (active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200")
                }
              >
                {s} <span className={active ? "text-emerald-50/90" : "text-slate-500"}>({counts[s] ?? 0})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <div className="border-b px-5 py-3 text-sm text-slate-600">
          {filteredRows.length} result{filteredRows.length !== 1 ? "s" : ""}
        </div>
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading…</div>
        ) : filteredRows.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No bookings found.</div>
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
              {filteredRows.map((b) => {
                const st = stationMap[b.stationId];
                const prettyBook = prettyId("BOOK", b.id);
                const prettyStation = st ? prettyId("STATION", st.id) : "STATION—";
                return (
                  <tr key={b.id} className="border-t hover:bg-slate-50/60">
                    <td className="px-4 py-2">
                      <div className="font-medium text-black">{prettyBook}</div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-medium">{b.nic}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-black">{prettyStation}</span>
                        <span className="text-xs text-slate-500">{st?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Chip tone="sky">{fmtDate(b.date)}</Chip>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Chip tone="violet">
                        {fmtTime(b.start)} → {fmtTime(b.end)}
                      </Chip>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 justify-end">
                        <Btn variant="outline" color="slate" onClick={() => openDetails(b)} title="View details">
                          View
                        </Btn>

                        <Link
                          to={`/app/bookings/${b.id}`}
                          className="px-3 py-2 rounded-lg border hover:bg-slate-50"
                          title="Edit"
                        >
                          Edit
                        </Link>

                        {b.status === "Pending" && (
                          <Btn
                            onClick={() => doApprove(b.id)}
                            disabled={loadingAction === b.id}
                            title="Approve & Generate QR"
                          >
                            {loadingAction === b.id ? "…" : "Approve"}
                          </Btn>
                        )}

                        {b.status === "Approved" && (
                          <Link
                            to={`/app/bookings/${b.id}/qr`}
                            className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                            title="Show QR"
                          >
                            QR
                          </Link>
                        )}

                        {b.status !== "Cancelled" && b.status !== "Completed" && (
                          <Btn
                            color="rose"
                            onClick={() => doCancel(b.id)}
                            disabled={loadingAction === b.id}
                            title="Cancel"
                          >
                            {loadingAction === b.id ? "…" : "Cancel"}
                          </Btn>
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

      {/* ---------- View Drawer (pretty IDs only) ---------- */}
      {openView && selected && (
        <div className="fixed inset-0 z-40" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenView(false)} />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Booking Details</div>
              <button onClick={() => setOpenView(false)} className="px-3 py-1 rounded border hover:bg-slate-50">
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-slate-500">Booking</div>
                <div className="col-span-2">
                  <div className="font-medium">{prettyId("BOOK", selected.id)}</div>
                </div>

                <div className="text-slate-500">Owner NIC</div>
                <div className="col-span-2">{selected.nic}</div>

                <div className="text-slate-500">Station</div>
                <div className="col-span-2">
                  <div className="font-medium">
                    {stationMap[selected.stationId]
                      ? prettyId("STATION", stationMap[selected.stationId].id)
                      : "STATION—"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {stationMap[selected.stationId]?.name || "—"}
                  </div>
                </div>

                <div className="text-slate-500">Date</div>
                <div className="col-span-2">{fmtDate(selected.date)}</div>

                <div className="text-slate-500">Time</div>
                <div className="col-span-2">
                  {fmtTime(selected.start)} → {fmtTime(selected.end)}
                </div>

                <div className="text-slate-500">Status</div>
                <div className="col-span-2">
                  <StatusBadge status={selected.status} />
                </div>

                <div className="text-slate-500">QR Token</div>
                <div className="col-span-2 break-all">{selected.qrToken || "—"}</div>
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <Link
                  to={`/app/bookings/${selected.id}`}
                  className="px-3 py-2 border rounded-lg hover:bg-slate-50"
                  onClick={() => setOpenView(false)}
                >
                  Edit
                </Link>
                {selected.status === "Pending" && (
                  <Btn
                    onClick={() => doApprove(selected.id)}
                    disabled={loadingAction === selected.id}
                  >
                    {loadingAction === selected.id ? "…" : "Approve"}
                  </Btn>
                )}
                {selected.status === "Approved" && (
                  <Link
                    to={`/app/bookings/${selected.id}/qr`}
                    className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                    onClick={() => setOpenView(false)}
                  >
                    Show QR
                  </Link>
                )}
                {selected.status !== "Cancelled" && selected.status !== "Completed" && (
                  <Btn
                    color="rose"
                    onClick={() => doCancel(selected.id)}
                    disabled={loadingAction === selected.id}
                  >
                    {loadingAction === selected.id ? "…" : "Cancel"}
                  </Btn>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
