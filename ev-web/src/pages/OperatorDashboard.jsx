// src/pages/OperatorDashboard.jsx
import { useEffect, useState } from "react";
import { listStations } from "../services/stations";
import { useAuth } from "../auth/useAuth";
import api from "../api/client";
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

export default function OperatorDashboard() {
  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Backend will return ONLY this operator’s stations (usually one)
        const stations = await listStations();
        if (!stations || stations.length === 0) {
          toast.error("No station assigned");
          setLoading(false);
          return;
        }

        const st = stations[0];
        setStation(st);

        // parallel fetch: today's bookings and schedules
        const [bRes, sRes] = await Promise.all([
          api.get(`/bookings?stationId=${st.id}&date=${today}`),
          api.get(`/schedules?stationId=${st.id}&date=${today}`)
        ]);

        setBookings(bRes.data || []);
        setSchedules(sRes.data || []);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading)
    return <div className="py-20 text-center text-slate-500">Loading...</div>;

  if (!station)
    return (
      <div className="py-20 text-center text-slate-500">
        No station assigned to this operator.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Station Overview */}
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">
              {prettyId("STATION", station.id)}
            </div>
            <div className="text-xl font-semibold">{station.name}</div>
            <div className="text-slate-600 text-sm">{station.address}</div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                station.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {station.isActive ? "Active" : "Inactive"}
            </span>
            <span className="px-2 py-1 rounded-full text-xs bg-sky-100 text-sky-700">
              {station.type}
            </span>
            <span className="px-2 py-1 rounded-full text-xs bg-violet-100 text-violet-700">
              {station.slots} slots
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <Kpi title="Latitude" value={station.latitude} />
          <Kpi title="Longitude" value={station.longitude} />
          <Kpi
            title="Status"
            value={station.isActive ? "Active" : "Inactive"}
          />
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="border-b px-5 py-3 font-semibold flex justify-between">
          <span>Today's Schedule ({today})</span>
          <span className="text-slate-500 text-sm">
            {schedules.length} entries
          </span>
        </div>
        {schedules.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No schedules for today.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-center">Capacity</th>
                <th className="px-4 py-2 text-center">Available</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, i) =>
                (s.slots || []).map((slot, j) => (
                  <tr key={`${i}-${j}`} className="border-t">
                    <td className="px-4 py-2">
                      {slot.start} → {slot.end}
                    </td>
                    <td className="px-4 py-2 text-center">{slot.capacity}</td>
                    <td className="px-4 py-2 text-center">
                      {slot.available ? "✅" : "❌"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Today's Bookings */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="border-b px-5 py-3 font-semibold flex justify-between">
          <span>Today's Bookings ({today})</span>
          <span className="text-slate-500 text-sm">
            {bookings.length} total
          </span>
        </div>
        {bookings.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No bookings for today.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">NIC</th>
                <th className="px-4 py-2 text-center">Time</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.nic}</td>
                  <td className="px-4 py-2 text-center">
                    {b.start} → {b.end}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        b.status === "Approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-lg font-semibold mt-1">{String(value)}</div>
    </div>
  );
}
