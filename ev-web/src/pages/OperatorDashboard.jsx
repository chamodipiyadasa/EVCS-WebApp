// src/pages/OperatorDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { listStations } from "../services/stations";
import { listBookingsByStationDate, finalizeBooking } from "../services/bookings";
import toast from "react-hot-toast";

/* ---------- tiny helpers ---------- */
const two = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
};
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
function fmtHm(t) {
  if (!t) return "";
  if (typeof t === "string") {
    const m = t.match(/^(\d{2}:\d{2})/);
    return m ? m[1] : t;
  }
  return t.toString?.() || "";
}

/* Build a synthetic set of visual “slots” so operators can see status at a glance.
   Your backend doesn’t return slot numbers per booking, so we map bookings onto
   N visual cards based on station.slots just for the dashboard view. */
function buildVisualSlots(station, bookingsToday, maintenanceSet) {
  const count = Number(station?.slots) || 0;
  const cards = [];
  const approved = bookingsToday.filter((b) => b.status === "Approved");
  const pending = bookingsToday.filter((b) => b.status === "Pending");

  for (let i = 0; i < count; i++) {
    const name = `Slot ${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`; // A1..A4, B1..B4...
    const isMaint = maintenanceSet.has(i);

    // naive visual mapping: approved bookings fill the first k slots
    const booking = approved[i] || null;

    let status = "Available";
    if (isMaint) status = "Maintenance";
    else if (booking) status = "Occupied";
    else if (pending[i]) status = "Reserved";

    cards.push({
      index: i,
      name,
      power: station?.type === "DC" ? "50kW" : "22kW",
      current: station?.type || "AC",
      status,
      booking,
    });
  }
  return cards;
}

export default function OperatorDashboard() {
  const [station, setStation] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(() => new Set());
  const [date] = useState(todayStr());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const stations = await listStations().catch(() => []);
        // pick the first station (or later: pick the operator's assigned station)
        const st = stations?.[0] ?? null;
        setStation(st);

        if (st?.id) {
          const dayBookings = await listBookingsByStationDate(st.id, date).catch(() => []);
          setBookings(dayBookings || []);
        } else {
          setBookings([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  const kpis = useMemo(() => {
    const total = Number(station?.slots) || 0;
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const approved = bookings.filter((b) => b.status === "Approved").length;
    const available = Math.max(total - approved, 0);
    return { total, pending, approved, available };
  }, [station, bookings]);

  const visualSlots = useMemo(
    () => buildVisualSlots(station, bookings, maintenance),
    [station, bookings, maintenance]
  );

  const statusBadge = (online) => (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
        online
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-rose-500"}`} />
      {online ? "Online" : "Offline"}
    </span>
  );

  function toggleMaintenance(idx) {
    setMaintenance((prev) => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  }

  async function complete(bookingId) {
    try {
      await finalizeBooking(bookingId);
      toast.success("Session marked as Completed");
      // refresh list
      if (station?.id) {
        const dayBookings = await listBookingsByStationDate(station.id, date).catch(() => []);
        setBookings(dayBookings || []);
      }
    } catch {
      toast.error("Failed to finalize");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Station Operator Portal</h1>
        <p className="text-slate-500 text-sm">
          Manage your charging station and monitor slot status
        </p>
      </div>

      {/* Station details */}
      <div className="bg-white border rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="text-lg font-semibold flex items-center gap-3">
              EV Charging Station {prettyId("ST", station?.id)}
            </div>
            <ul className="mt-2 space-y-1 text-slate-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                {station?.address || "—"}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                {station?.type || "AC/DC"} Fast Charging
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Operating Hours: 24/7
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3">
            {statusBadge(station?.isActive ?? true)}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Kpi label="Total Slots" value={kpis.total} />
          <Kpi label="Active" value={kpis.approved} accent="emerald" />
          <Kpi label="Available" value={kpis.available} accent="blue" />
          <Kpi label="Pending" value={kpis.pending} accent="amber" />
        </div>
      </div>

      {/* Charging slots status */}
      <div className="bg-white border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Charging Slots Status</div>
          <div className="text-sm text-slate-500">Date: {date}</div>
        </div>

        {loading ? (
          <div className="text-slate-500 text-sm">Loading…</div>
        ) : (visualSlots?.length ?? 0) === 0 ? (
          <div className="text-slate-500 text-sm">No slots configured for this station.</div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {visualSlots.map((s) => (
              <SlotCard
                key={s.index}
                slot={s}
                onToggleMaint={() => toggleMaintenance(s.index)}
                onComplete={
                  s.booking && s.status === "Occupied"
                    ? () => complete(s.booking.id)
                    : null
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Today’s bookings list (quick table) */}
      <div className="bg-white border rounded-2xl p-5">
        <div className="text-lg font-semibold mb-3">Today’s Bookings</div>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading…</div>
        ) : bookings.length === 0 ? (
          <div className="text-slate-500 text-sm">No bookings found for today.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Booking</Th>
                  <Th>Owner NIC</Th>
                  <Th>Time</Th>
                  <Th>Status</Th>
                  <Th className="text-right pr-3">Action</Th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <Td className="font-medium">{prettyId("BOOKING", b.id)}</Td>
                    <Td>{b.nic}</Td>
                    <Td>{fmtHm(b.start)}–{fmtHm(b.end)}</Td>
                    <Td><StatusBadge status={b.status} /></Td>
                    <Td className="text-right pr-3">
                      {b.status === "Approved" && (
                        <button
                          onClick={() => finalizeBooking(b.id).then(() => {
                            toast.success("Completed");
                            // quick refresh
                            if (station?.id) {
                              listBookingsByStationDate(station.id, date)
                                .then((x) => setBookings(x || []));
                            }
                          }).catch(()=>toast.error("Failed"))}
                          className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Complete
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */
function Kpi({ label, value, accent }) {
  const color = {
    emerald: "text-emerald-700 bg-emerald-50",
    blue: "text-blue-700 bg-blue-50",
    amber: "text-amber-700 bg-amber-50",
  }[accent] || "text-slate-700 bg-slate-50";

  return (
    <div className="rounded-xl border p-4 flex items-center justify-between">
      <div className="text-slate-500 text-sm">{label}</div>
      <div className={`px-3 py-1 rounded-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function SlotCard({ slot, onToggleMaint, onComplete }) {
  const palette = {
    Available: "bg-blue-50 text-blue-700",
    Reserved: "bg-amber-50 text-amber-700",
    Occupied: "bg-emerald-50 text-emerald-700",
    Maintenance: "bg-rose-50 text-rose-700",
  }[slot.status];

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{slot.name}</div>
        <span className={`px-3 py-1 rounded-lg text-sm ${palette}`}>{slot.status}</span>
      </div>
      <div className="mt-1 text-slate-500 text-sm">
        {slot.current} · {slot.power}
      </div>

      {slot.booking && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div className="text-slate-600">
            Customer NIC: <b>{slot.booking.nic}</b>
          </div>
          <div className="text-slate-600">
            Time: {fmtHm(slot.booking.start)} – {fmtHm(slot.booking.end)}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMaint}
          className={`px-3 py-1 rounded border text-sm ${
            slot.status === "Maintenance"
              ? "border-rose-300 text-rose-700 hover:bg-rose-50"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {slot.status === "Maintenance" ? "Clear Maintenance" : "Set Maintenance"}
        </button>

        {onComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
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

function Th({ children, className = "" }) {
  return <th className={`px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}
