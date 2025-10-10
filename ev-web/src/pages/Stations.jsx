import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listStations,
  updateStation,
  listOperatorsForStation,
  deleteStation,
} from "../services/stations";
import { useAuth } from "../auth/useAuth";
import toast from "react-hot-toast";

/* ---------- helpers ---------- */
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function prettyId(prefix, raw, width = 3) {
  if (!raw) return `${prefix}${"".padStart(width, "0")}`;
  const n = (hashCode(String(raw)) % 1000) + 1;
  return `${prefix}${String(n).padStart(width, "0")}`;
}
function initials(nameOrUser = "") {
  const s = String(nameOrUser).trim();
  if (!s) return "OP";
  const parts = s.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/* tiny icons */
const ChevronDown = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
);
const RefreshIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M20 11a8 8 0 10-1.78 5.03M20 11V5m0 6h-6"/></svg>
);

/* ---------- component ---------- */
export default function Stations() {
  const { role } = useAuth();
  const isBackoffice = role === "Backoffice";
  const isOperator = role === "Operator";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // operators state
  const [opsMap, setOpsMap] = useState({});     // { stationId: [{username,isActive,role}] }
  const [loadingOps, setLoadingOps] = useState({}); // { stationId: bool }
  const [openOps, setOpenOps] = useState(() => new Set()); // expanded rows

  // View drawer
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  async function refresh() {
    try {
      setLoading(true);
      const data = await listStations();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load stations");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  const toggleOps = async (stationId) => {
    const next = new Set(openOps);
    const willOpen = !next.has(stationId);
    if (willOpen && !opsMap[stationId]) {
      await loadOperatorsFor(stationId);
    }
    if (willOpen) next.add(stationId);
    else next.delete(stationId);
    setOpenOps(next);
  };

  async function loadOperatorsFor(stationId) {
    setLoadingOps((x) => ({ ...x, [stationId]: true }));
    try {
      const list = await listOperatorsForStation(stationId);
      setOpsMap((x) => ({ ...x, [stationId]: list || [] }));
    } catch (e) {
      toast.error("Failed to load operators");
      console.error(e);
    } finally {
      setLoadingOps((x) => ({ ...x, [stationId]: false }));
    }
  }

  async function toggleActive(st) {
    if (!isBackoffice) return;
    try {
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
      const msg = e?.response?.data?.error || e?.response?.data || "Failed to update station";
      toast.error(String(msg));
      console.error(e);
    }
  }

  async function doDelete(st) {
    if (!isBackoffice) return;
    const ok = window.confirm(`Delete station "${st.name}"?\nThis action cannot be undone.`);
    if (!ok) return;
    try {
      await deleteStation(st.id);
      toast.success("Station deleted");
      if (selected?.id === st.id) setOpenView(false);
      refresh();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data || "Delete failed";
      toast.error(String(msg));
      console.error(e);
    }
  }

  function openDetails(st) {
    setSelected(st);
    setOpenView(true);
    if (!opsMap[st.id]) loadOperatorsFor(st.id);
  }

  const activeCount = useMemo(() => items.filter((s) => s.isActive).length, [items]);

  /* ---------- Operator dashboard ---------- */
  if (isOperator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">My Station</h1>
            <p className="text-slate-500 text-sm">View your assigned station details and operators.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No station assigned to your account.</div>
        ) : (
          items.map((s) => (
            <div key={s.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">{prettyId("STATION", s.id)}</div>
                  <div className="text-lg font-semibold text-black">{s.name}</div>
                  <div className="text-slate-600 text-sm">{s.address}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge color={s.isActive ? "emerald" : "slate"} text={s.isActive ? "Active" : "Inactive"} />
                  <Badge color="sky" text={s.type} />
                  <Badge color="violet" text={`${s.slots} slots`} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <Kpi title="Latitude" value={s.latitude} />
                <Kpi title="Longitude" value={s.longitude} />
                <Kpi title="Status" value={s.isActive ? "Active" : "Inactive"} />
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button onClick={() => openDetails(s)} className="px-3 py-1.5 rounded-lg border hover:bg-slate-50">
                  View
                </button>
                <OperatorsToggle
                  open={openOps.has(s.id)}
                  loading={!!loadingOps[s.id]}
                  count={(opsMap[s.id] || []).length}
                  onClick={() => toggleOps(s.id)}
                  onRefresh={() => loadOperatorsFor(s.id)}
                />
              </div>

              {/* Collapsible operators panel */}
              {openOps.has(s.id) && (
                <OperatorsPanel
                  loading={!!loadingOps[s.id]}
                  operators={opsMap[s.id]}
                />
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  /* ---------- Backoffice dashboard ---------- */
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Stations</h1>
          <p className="text-slate-500 text-sm">
            {items.length} total · {activeCount} active
          </p>
        </div>
        <Link
          to="/app/stations/new"
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
        >
          + New Station
        </Link>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Station</th>
              <th className="px-4 py-3 text-center">Type</th>
              <th className="px-4 py-3 text-center">Slots</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Operators</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-500">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-500">No stations found</td></tr>
            ) : (
              items.map((s) => (
                <tr key={s.id} className="border-t align-top hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-500">{prettyId("STATION", s.id)}</div>
                    <div className="font-medium text-black">{s.name}</div>
                    <div className="text-slate-600">{s.address}</div>
                  </td>
                  <td className="px-4 py-3 text-center"><Badge color="sky" text={s.type} /></td>
                  <td className="px-4 py-3 text-center">{s.slots}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge color={s.isActive ? "emerald" : "slate"} text={s.isActive ? "Active" : "Inactive"} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <OperatorsToggle
                        open={openOps.has(s.id)}
                        loading={!!loadingOps[s.id]}
                        count={(opsMap[s.id] || []).length}
                        onClick={() => toggleOps(s.id)}
                        onRefresh={() => loadOperatorsFor(s.id)}
                        size="sm"
                      />
                      {openOps.has(s.id) && (
                        <OperatorsPanel
                          loading={!!loadingOps[s.id]}
                          operators={opsMap[s.id]}
                          compact
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button onClick={() => openDetails(s)} className="px-3 py-1.5 rounded-lg border hover:bg-slate-50">
                        View
                      </button>
                      <Link to={`/app/stations/${encodeURIComponent(s.id)}`} className="px-3 py-1.5 rounded-lg border hover:bg-slate-50">
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleActive(s)}
                        className={`px-3 py-1.5 rounded-lg text-white ${
                          s.isActive ? "bg-black hover:bg-black/90" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {s.isActive ? "Deactivate" : "Activate"}
                      </button>
                      {isBackoffice && (
                        <button
                          onClick={() => doDelete(s)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- View Drawer ---------- */}
      {openView && selected && (
        <div className="fixed inset-0 z-40" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenView(false)} />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Station Details</div>
              <button onClick={() => setOpenView(false)} className="px-3 py-1 rounded border">Close</button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-slate-500">Station</div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-400">{prettyId("STATION", selected.id)}</div>
                  <div className="font-medium">{selected.name}</div>
                </div>

                <div className="text-slate-500">Address</div>
                <div className="col-span-2">{selected.address || "—"}</div>

                <div className="text-slate-500">Type</div>
                <div className="col-span-2">{selected.type}</div>

                <div className="text-slate-500">Slots</div>
                <div className="col-span-2">{selected.slots}</div>

                <div className="text-slate-500">Coordinates</div>
                <div className="col-span-2">
                  <div>Lat: {selected.latitude}</div>
                  <div>Lng: {selected.longitude}</div>
                </div>

                <div className="text-slate-500">Status</div>
                <div className="col-span-2">
                  <Badge color={selected.isActive ? "emerald" : "slate"} text={selected.isActive ? "Active" : "Inactive"} />
                </div>

                <div className="text-slate-500">Operators</div>
                <div className="col-span-2">
                  <div className="mb-2">
                    <OperatorsToggle
                      open={openOps.has(selected.id)}
                      loading={!!loadingOps[selected.id]}
                      count={(opsMap[selected.id] || []).length}
                      onClick={() => toggleOps(selected.id)}
                      onRefresh={() => loadOperatorsFor(selected.id)}
                      size="sm"
                    />
                  </div>
                  {openOps.has(selected.id) && (
                    <OperatorsPanel
                      loading={!!loadingOps[selected.id]}
                      operators={opsMap[selected.id]}
                    />
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <Link
                  to={`/app/stations/${encodeURIComponent(selected.id)}`}
                  className="px-3 py-2 border rounded-lg hover:bg-slate-50"
                  onClick={() => setOpenView(false)}
                >
                  Edit
                </Link>
                {isBackoffice && (
                  <>
                    <button
                      onClick={() => toggleActive(selected)}
                      className={`px-3 py-2 rounded-lg text-white ${
                        selected.isActive ? "bg-black hover:bg-black/90" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {selected.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => doDelete(selected)}
                      className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Friendly operators UI bits ---------- */

function OperatorsToggle({ open, loading, count, onClick, onRefresh, size = "md" }) {
  const base = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={onClick}
        className={`${base} rounded-full border bg-white hover:bg-slate-50 flex items-center gap-2`}
        title={open ? "Hide operators" : "Show operators"}
      >
        <span className="font-medium">{open ? "Hide operators" : "Show operators"}</span>
        <span className="text-slate-500">({count || 0})</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <button
        onClick={onRefresh}
        className={`${base} rounded-full border bg-white hover:bg-slate-50 inline-flex items-center gap-1`}
        title="Refresh operators"
      >
        <RefreshIcon />
        <span>Refresh</span>
      </button>
      {loading && <span className="inline-flex items-center text-xs text-slate-500">Loading…</span>}
    </div>
  );
}

function OperatorsPanel({ loading, operators, compact = false }) {
  if (loading) {
    return (
      <div className="w-full border rounded-lg p-3 bg-slate-50 text-slate-500 text-sm">
        Fetching operators…
      </div>
    );
  }
  if (!operators || operators.length === 0) {
    return (
      <div className="w-full border rounded-lg p-3 bg-slate-50 text-slate-500 text-sm">
        No operators assigned.
      </div>
    );
  }
  return (
    <div className={`w-full border rounded-lg ${compact ? "p-2" : "p-3"} bg-white`}>
      <div className="flex flex-wrap gap-2">
        {operators.map((u) => (
          <div key={u.username} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-semibold">
              {initials(u.username)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{u.username}</span>
              <span className={`inline-flex items-center gap-1 text-xs ${
                u.isActive ? "text-emerald-700" : "text-slate-500"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  u.isActive ? "bg-emerald-500" : "bg-slate-400"
                }`} />
                {u.isActive ? "active" : "inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Small UI bits ---------- */
function Badge({ color = "slate", text }) {
  const colorMap = {
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-sky-100 text-sky-700",
    violet: "bg-violet-100 text-violet-700",
    slate: "bg-slate-200 text-slate-600",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[color]}`}>
      {text}
    </span>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-lg font-semibold mt-1 text-black">{String(value)}</div>
    </div>
  );
}
