// src/pages/Stations.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listStations,
  updateStation,
  listOperatorsForStation,
} from "../services/stations";
import { useAuth } from "../auth/useAuth";
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
  const n = (hashCode(String(raw)) % 1000) + 1; // 001..1000
  return `${prefix}${String(n).padStart(width, "0")}`;
}

export default function Stations() {
  const { role } = useAuth();
  const isBackoffice = role === "Backoffice";
  const isOperator = role === "Operator";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // lazy loaded per-station operator lists
  const [opsMap, setOpsMap] = useState({}); // {stationId: [{username,...}]}
  const [loadingOps, setLoadingOps] = useState({}); // {stationId: bool}

  async function refresh() {
    setLoading(true);
    try {
      const data = await listStations();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load stations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleActive(st) {
    if (!isBackoffice) return;
    try {
      // API requires all fields for Update
      await updateStation(st.id, {
        name: st.name,
        address: st.address,
        latitude: st.latitude,
        longitude: st.longitude,
        type: st.type,
        slots: st.slots,
        isActive: !st.isActive,
      });
      toast.success(st.isActive ? "Station deactivated" : "Station activated");
      refresh();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data ||
        "Failed to update station";
      toast.error(String(msg));
      console.error(e);
    }
  }

  async function loadOperatorsFor(stationId) {
    if (opsMap[stationId]) return; // already loaded
    setLoadingOps((x) => ({ ...x, [stationId]: true }));
    try {
      const list = await listOperatorsForStation(stationId);
      setOpsMap((x) => ({ ...x, [stationId]: list || [] }));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load operators");
    } finally {
      setLoadingOps((x) => ({ ...x, [stationId]: false }));
    }
  }

  const activeCount = useMemo(
    () => items.filter((s) => s.isActive).length,
    [items]
  );

  /* ---------- Operator view: single (or very few) stations ---------- */
  if (isOperator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Station</h1>
            <p className="text-slate-500 text-sm">
              You can view status and assigned operators.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            No station assigned to your account.
          </div>
        ) : (
          items.map((s) => (
            <div
              key={s.id}
              className="bg-white border rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">
                    {prettyId("STATION", s.id)}
                  </div>
                  <div className="text-lg font-semibold">{s.name}</div>
                  <div className="text-slate-600 text-sm">{s.address}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      s.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-sky-100 text-sky-700">
                    {s.type}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-violet-100 text-violet-700">
                    {s.slots} slots
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <Kpi title="Latitude" value={s.latitude} />
                <Kpi title="Longitude" value={s.longitude} />
                <Kpi title="Status" value={s.isActive ? "Active" : "Inactive"} />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => loadOperatorsFor(s.id)}
                  className="text-sm underline text-blue-700 hover:text-blue-900"
                >
                  View assigned operators
                </button>
                <div className="mt-2 text-sm">
                  {loadingOps[s.id] ? (
                    <div className="text-slate-500">Loading operators…</div>
                  ) : opsMap[s.id] ? (
                    opsMap[s.id].length === 0 ? (
                      <div className="text-slate-500">No operators found.</div>
                    ) : (
                      <ul className="list-disc pl-5">
                        {opsMap[s.id].map((u) => (
                          <li key={u.username}>
                            {u.username}{" "}
                            <span className="text-slate-500">
                              ({u.role}, {u.isActive ? "active" : "inactive"})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )
                  ) : (
                    <div className="text-slate-500">
                      Click “View assigned operators”.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  /* ---------- Backoffice view: full table + actions ---------- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Stations</h1>
          <p className="text-slate-500 text-sm">
            {items.length} total · {activeCount} active
          </p>
        </div>
        <Link
          to="/app/stations/new"
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Station
        </Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Station</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Slots</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Operators</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No stations found
                </td>
              </tr>
            ) : (
              items.map((s) => (
                <tr key={s.id} className="border-t align-top">
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-500">
                      {prettyId("STATION", s.id)}
                    </div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-slate-600">{s.address}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-700 text-xs">
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{s.slots}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        s.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => loadOperatorsFor(s.id)}
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      {opsMap[s.id] ? "Refresh" : "Load"} operators
                    </button>
                    <div className="mt-2 text-xs">
                      {loadingOps[s.id] ? (
                        <div className="text-slate-500">Loading…</div>
                      ) : opsMap[s.id] ? (
                        opsMap[s.id].length === 0 ? (
                          <div className="text-slate-500">None</div>
                        ) : (
                          <ul className="list-disc pl-4">
                            {opsMap[s.id].map((u) => (
                              <li key={u.username}>
                                {u.username}{" "}
                                <span className="text-slate-500">
                                  ({u.isActive ? "active" : "inactive"})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/app/stations/${encodeURIComponent(s.id)}`}
                        className="px-3 py-1.5 rounded border hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleActive(s)}
                        className={`px-3 py-1.5 rounded ${
                          s.isActive
                            ? "bg-rose-600 text-white hover:bg-rose-700"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
