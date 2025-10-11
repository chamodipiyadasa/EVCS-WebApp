import { useEffect, useMemo, useState } from "react";
import { listOwners } from "../services/owners";
import { listStations } from "../services/stations";
import { listBookingsByStationDate } from "../services/bookings";

/* ---------- helpers ---------- */
const todayISO = () => new Date().toISOString().slice(0, 10);

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
const prettyId = (prefix, raw) =>
  `${prefix}${String((hashCode(String(raw)) % 1000) + 1).padStart(3, "0")}`;

const hhmm = (t) => {
  if (!t) return "--:--";
  if (typeof t === "object") {
    const h = String(t.hour ?? 0).padStart(2, "0");
    const m = String(t.minute ?? 0).padStart(2, "0");
    return `${h}:${m}`;
  }
  const [h = "00", m = "00"] = String(t).split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};
const hourOf = (t) =>
  typeof t === "object"
    ? Number(t.hour ?? 0)
    : Number(String(t).split(":")[0] || 0);

const badge = (status) => {
  switch (status) {
    case "Approved":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Completed":
      return "bg-sky-100 text-sky-700 border-sky-200";
    default:
      return "bg-rose-100 text-rose-700 border-rose-200";
  }
};

/* ---------- tiny charts (no external libs) ---------- */
function Sparkline({ values = [] }) {
  const width = 320;
  const height = 60;
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * (height - 6) - 3;
    return `${x},${y}`;
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-20"
      aria-label="Bookings per hour"
    >
      <polyline
        fill="none"
        stroke="#10B981"
        strokeWidth="3"
        points={pts.join(" ")}
      />
      <line
        x1="0"
        y1={height - 2}
        x2={width}
        y2={height - 2}
        stroke="#e2e8f0"
      />
    </svg>
  );
}

function BarList({ data = [] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="flex items-center gap-2">
            <div className="w-28 text-sm truncate text-slate-700">
              {d.label}
            </div>
            <div className="flex-1 h-2 bg-slate-200 rounded">
              <div
                className="h-2 rounded bg-emerald-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 w-6 text-right">
              {d.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- main component ---------- */
export default function Dashboard() {
  const [summary, setSummary] = useState({
    users: 2,
    owners: 0,
    stations: 0,
    activeBookings: 0,
  });
  const [recent, setRecent] = useState([]);
  const [byHour, setByHour] = useState(Array(24).fill(0));
  const [byStation, setByStation] = useState([]);
  const [stationsMap, setStationsMap] = useState({});
  const [now] = useState(() => new Date().toISOString());

  useEffect(() => {
    (async () => {
      try {
        const [owners, stations] = await Promise.all([
          listOwners(),
          listStations(),
        ]);
        const stationMap = {};
        for (const s of stations) stationMap[s.id] = s;
        setStationsMap(stationMap);

        const today = todayISO();
        const all = await Promise.all(
          stations.map((s) => listBookingsByStationDate(s.id, today).catch(() => []))
        );
        const bookings = all.flat();

        const active = bookings.filter((b) =>
          ["Pending", "Approved"].includes(b.status)
        ).length;
        const sortedRecent = [...bookings].sort(
          (a, b) => hourOf(b.start) - hourOf(a.start)
        );
        setRecent(sortedRecent.slice(0, 8));

        const hours = Array(24).fill(0);
        for (const b of bookings) hours[hourOf(b.start)]++;
        setByHour(hours);

        const perStation = {};
        for (const b of bookings)
          perStation[b.stationId] = (perStation[b.stationId] || 0) + 1;
        const top = Object.entries(perStation)
          .map(([id, v]) => ({
            label: stationMap[id]?.name || id.slice(0, 6),
            value: v,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        setByStation(top);

        setSummary({
          users: 2,
          owners: owners.length,
          stations: stations.length,
          activeBookings: active,
        });
      } catch {
        setSummary((s) => ({ ...s, owners: 0, stations: 0, activeBookings: 0 }));
      }
    })();
  }, []);

  const statusCounts = useMemo(() => {
    const c = { Pending: 0, Approved: 0, Completed: 0, Cancelled: 0 };
    for (const r of recent) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [recent]);

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview & Analytics</p>
        </div>
        <div className="text-slate-500 text-xs md:text-sm">
          {new Date(now).toLocaleString()}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi title="System Users" value={summary.users} note="+3 this month" />
        <Kpi title="EV Owners" value={summary.owners} note="+12 this month" />
        <Kpi title="Stations" value={summary.stations} note="100% uptime" />
        <Kpi
          title="Active Bookings"
          value={summary.activeBookings}
          note="Pending + Approved"
        />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-black">Bookings by Hour</div>
            <div className="text-xs text-slate-500">
              Peak: {byHour.indexOf(Math.max(...byHour))}:00
            </div>
          </div>
          <Sparkline values={byHour} />
          <div className="text-xs text-slate-500 mt-2">
            Today ({todayISO()})
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <div className="font-semibold text-black mb-3">
            Top Stations (Today)
          </div>
          {byStation.length ? (
            <BarList data={byStation} />
          ) : (
            <div className="text-slate-500 text-sm text-center py-6">
              No data
            </div>
          )}
        </div>
      </div>

      {/* recent activity */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between mb-3 gap-3">
          <div className="font-semibold text-black">Recent Activity</div>
          <div className="text-xs text-slate-600 flex flex-wrap gap-3">
            <span>✅ {statusCounts.Approved} Approved</span>
            <span>🕓 {statusCounts.Pending} Pending</span>
            <span>🏁 {statusCounts.Completed} Completed</span>
            <span>❌ {statusCounts.Cancelled} Cancelled</span>
          </div>
        </div>
        {recent.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No recent activity
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((b) => {
              const station = stationsMap[b.stationId]?.name || "—";
              return (
                <li
                  key={b.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-black font-medium truncate">
                      {station} — {hhmm(b.start)}–{hhmm(b.end)}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {prettyId("BOOK", b.id)} • NIC {b.nic}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs border rounded-full ${badge(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* KPI card */
function Kpi({ title, value, note }) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm text-center sm:text-left">
      <div className="text-slate-500 text-xs sm:text-sm">{title}</div>
      <div className="text-2xl sm:text-3xl font-bold text-black mt-1">
        {value}
      </div>
      {note && <div className="text-emerald-600 text-xs mt-1">{note}</div>}
    </div>
  );
}
