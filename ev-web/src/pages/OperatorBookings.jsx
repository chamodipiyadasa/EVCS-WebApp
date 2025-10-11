// src/pages/OperatorBookings.jsx
import { useEffect, useMemo, useState } from "react";
import { listStations } from "../services/stations";
import { listBookingsByStationDate, scanQr, finalizeBooking } from "../services/bookings";
import toast from "react-hot-toast";

/* helpers */
const two = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}`;
};
const fmtHM = (x) => (typeof x === "string" ? (x.match(/^(\d{2}:\d{2})/)?.[1] || x) : (x?.toString?.() || ""));

function StatusBadge({ status }) {
  const map = {
    Pending: "bg-violet-100 text-violet-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Completed: "bg-slate-200 text-slate-700",
    Canceled: "bg-rose-100 text-rose-700",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>;
}
const Chip = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
      active ? "bg-black text-white border-black" : "border-slate-300 text-slate-700 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);
const Kpi = ({ label, value, tone }) => {
  const toneCls =
    tone === "emerald" ? "bg-emerald-50 text-emerald-700" :
    tone === "violet"  ? "bg-violet-50 text-violet-700"  :
    "bg-slate-100 text-slate-700";
  return (
    <div className="rounded-xl border p-3 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 inline-block px-2 py-1 rounded font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
};
const Th = ({ children, align = "left", className = "" }) => (
  <th className={`px-4 py-3 text-${align} font-medium ${className}`}>{children}</th>
);
const Td = ({ children, align = "left", className = "" }) => (
  <td className={`px-4 py-3 align-top text-${align} ${className}`}>{children}</td>
);

export default function OperatorBookings() {
  const [date, setDate] = useState(todayStr());
  const [station, setStation] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR modal
  const [qrOpen, setQrOpen] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [scanLoading, setScanLoading] = useState(false);

  // status filter
  const [statusFilter, setStatusFilter] = useState("All"); // All | Approved | Pending | Completed | Canceled

  useEffect(() => {
    (async () => {
      const s = await listStations().catch(() => []);
      setStation(s?.[0] ?? null);
    })();
  }, []);

  const load = async (sid, d) => {
    if (!sid || !d) return;
    setLoading(true);
    try {
      const data = await listBookingsByStationDate(sid, d);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (station?.id) load(station.id, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station, date]);

  const totals = useMemo(() => {
    const all = items.length;
    const approved = items.filter((b) => b.status === "Approved").length;
    const pending = items.filter((b) => b.status === "Pending").length;
    const completed = items.filter((b) => b.status === "Completed").length;
    return { all, approved, pending, completed };
  }, [items]);

  const filtered = useMemo(() => {
    if (statusFilter === "All") return items;
    return items.filter((b) => b.status === statusFilter);
  }, [items, statusFilter]);

  async function doScan() {
    if (!qrToken.trim()) return toast.error("Enter a QR token");
    setScanLoading(true);
    try {
      const res = await scanQr(qrToken.trim());
      toast.success(`QR verified • Booking ${res.bookingId}`);
      setQrOpen(false); setQrToken("");
      if (station?.id) load(station.id, date);
    } catch (e) {
      console.error(e);
      toast.error("QR verification failed");
    } finally {
      setScanLoading(false);
    }
  }

  async function complete(id) {
    try {
      await finalizeBooking(id);
      toast.success("Marked as Completed");
      if (station?.id) load(station.id, date);
    } catch (e) {
      console.error(e);
      toast.error("Failed to finalize");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Operator • Bookings</h1>
          <p className="text-slate-500 text-sm">View and process bookings for your station.</p>
        </div>
        <button onClick={() => setQrOpen(true)} className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
          Scan / Verify QR
        </button>
      </div>

      {/* Filters + KPIs */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-500">Station</div>
              <div className="font-medium">{station ? `${station.name} (${station.type})` : "—"}</div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-xs text-slate-500">Date</div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded px-3 py-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
            <Kpi label="All" value={totals.all} />
            <Kpi label="Approved" value={totals.approved} tone="emerald" />
            <Kpi label="Pending" value={totals.pending} tone="violet" />
            <Kpi label="Completed" value={totals.completed} />
          </div>
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2">
          {["All", "Approved", "Pending", "Completed", "Canceled"].map((s) => (
            <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </div>

      {/* Table */}
      <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between bg-black text-white">
          <div className="font-semibold">Bookings</div>
          <div className="text-xs opacity-80">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-slate-700 border-b border-emerald-200">
              <tr>
                <Th>Owner NIC</Th>
                <Th align="center">Time</Th>
                <Th align="center">Status</Th>
                <Th align="right" className="pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center text-slate-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-14 text-center text-slate-500">No bookings found.</td></tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="border-b border-emerald-100 hover:bg-emerald-50/40">
                    <Td className="font-medium text-black">{b.nic}</Td>
                    <Td align="center">{fmtHM(b.start)} – {fmtHM(b.end)}</Td>
                    <Td align="center"><StatusBadge status={b.status} /></Td>
                    <Td align="right" className="pr-4">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded-lg border border-violet-300 text-violet-700 hover:bg-violet-50"
                          onClick={() => setQrOpen(true)}
                          title="Scan / verify QR"
                        >
                          Scan QR
                        </button>
                        {b.status === "Approved" && (
                          <button
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() => complete(b.id)}
                            title="Mark as completed"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* QR modal */}
      {qrOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-3 bg-violet-600 text-white font-semibold">Scan / Verify QR</div>
            <div className="p-5 space-y-3">
              <p className="text-slate-600 text-sm">
                Paste the QR token (or use a scanner to input) to verify a booking.
              </p>
              <input
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="QR token"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
              />
              <div className="pt-1 flex items-center justify-end gap-2">
                <button className="px-3 py-2 rounded-lg border hover:bg-slate-50" onClick={() => setQrOpen(false)}>
                  Close
                </button>
                <button
                  className="px-3 py-2 rounded-lg bg-black text-white hover:bg-black/90"
                  onClick={doScan}
                  disabled={scanLoading}
                >
                  {scanLoading ? "Verifying…" : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
