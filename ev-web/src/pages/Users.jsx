// src/pages/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { listUsers, createUser } from "../services/users";
import { listStations } from "../services/stations";
import {
  getAssignments,
  setOperatorStation,
  unassignOperator,
  findStationForOperator,
  resetAllAssignments,
} from "../services/operatorAssignments";
import toast from "react-hot-toast";

/* -------- helpers -------- */
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
function safeRowKey(u, i) {
  return u?.id ?? u?.username ?? `row-${i}`;
}
function StationBadge({ station }) {
  if (!station) return <span className="text-slate-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-2`}>
      <span className="font-medium">{station.name}</span>
      <span className="text-xs text-slate-500">({station.type})</span>
      <span
        className={`ml-2 text-[11px] rounded-full px-2 py-0.5 border ${
          station.isActive
            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
            : "border-rose-300 text-rose-700 bg-rose-50"
        }`}
        title={station.isActive ? "Active" : "Inactive"}
      >
        {station.isActive ? "Active" : "Inactive"}
      </span>
    </span>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [assignMap, setAssignMap] = useState({});
  const [loading, setLoading] = useState(true);

  // local per-row edit selection for reassignment
  const [editSelection, setEditSelection] = useState({}); // { [username]: stationId or "" }

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "Operator",
    stationId: "",
  });

  async function refresh() {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([listUsers(), listStations()]);
      setUsers(Array.isArray(u) ? u : []);
      setStations(Array.isArray(s) ? s : []);
      setAssignMap(getAssignments());
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users/stations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const operators = useMemo(
    () => (users || []).filter((x) => x.role === "Operator"),
    [users]
  );

  function stationForUsername(username) {
    const sid = findStationForOperator(username);
    if (!sid) return null;
    return (stations || []).find((s) => s.id === sid) || { id: sid, name: sid, isActive: false, type: "?" };
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim())
      return toast.error("Username & password required");
    if (form.role === "Operator" && !form.stationId)
      return toast.error("Pick a station for the operator");

    try {
      const created = await createUser({
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        isActive: true,
      });

      if (form.role === "Operator") {
        setOperatorStation(created.username, form.stationId); // ✅ one operator → one station
      }

      toast.success(`${created.role} created`);
      setForm({ username: "", password: "", role: "Operator", stationId: "" });
      await refresh();
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.error || "Create user failed";
      toast.error(String(msg));
    }
  }

  function beginEdit(username) {
    const current = findStationForOperator(username) || "";
    setEditSelection((m) => ({ ...m, [username]: current }));
  }

  async function applyEdit(username) {
    const targetStationId = editSelection[username] ?? "";
    if (!username) return;

    if (targetStationId === "") {
      unassignOperator(username);
      toast.success("Operator unassigned");
    } else {
      setOperatorStation(username, targetStationId); // ✅ can point many operators to same station
      toast.success("Assignment updated");
    }

    setEditSelection((m) => {
      const c = { ...m };
      delete c[username];
      return c;
    });
    setAssignMap(getAssignments());
  }

  function cancelEdit(username) {
    setEditSelection((m) => {
      const c = { ...m };
      delete c[username];
      return c;
    });
  }

  function onResetAssignments() {
    resetAllAssignments();
    setAssignMap(getAssignments());
    toast.success("All local assignments cleared");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-slate-500 text-sm">
            Create Backoffice or Operator accounts. Assign (and reassign) Operators to stations.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetAssignments}
          className="text-xs border px-3 py-1.5 rounded hover:bg-slate-50"
          title="Clear local operator→station mappings stored in this browser"
        >
          Reset assignments
        </button>
      </div>

      {/* Create form */}
      <form onSubmit={onCreate} className="bg-white border rounded-xl p-4 grid md:grid-cols-4 gap-3">
        <div>
          <label className="text-sm text-slate-600">Username</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="e.g. op_nimal"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Password</label>
          <input
            className="border rounded px-3 py-2 w-full"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="StrongPassword!23"
          />
        </div>
        <div>
          <label className="text-sm text-slate-600">Role</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value, stationId: "" })}
          >
            <option value="Operator">Operator</option>
            <option value="Backoffice">Backoffice</option>
          </select>
        </div>

        {form.role === "Operator" && (
          <div>
            <label className="text-sm text-slate-600">Assign to Station</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.stationId}
              onChange={(e) => setForm({ ...form, stationId: e.target.value })}
            >
              <option value="">Select station…</option>
              {stations.map((s, i) => (
                <option key={s.id ?? `station-${i}`} value={s.id}>
                  {prettyId("STATION", s.id)} — {s.name} ({s.type})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="md:col-span-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create User
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3 text-left">Assigned Station</th>
              <th className="px-4 py-3 text-left">Change Assignment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">Loading…</td>
              </tr>
            ) : (users || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">No users</td>
              </tr>
            ) : (
              users.map((u, i) => {
                const assignedStation = u.role === "Operator" ? stationForUsername(u.username) : null;
                const isEditing = editSelection[u.username] !== undefined;

                return (
                  <tr key={safeRowKey(u, i)} className="border-t">
                    <td className="px-4 py-3 font-medium">{u?.username ?? "—"}</td>
                    <td className="px-4 py-3 text-center">{u?.role ?? "—"}</td>
                    <td className="px-4 py-3 text-center">{u?.isActive ? "Yes" : "No"}</td>

                    {/* Assigned Station + status */}
                    <td className="px-4 py-3">
                      {u.role === "Operator" ? (
                        assignedStation ? (
                          <div className="mb-1">
                            <span className="text-xs text-slate-500 mr-2">
                              {prettyId("STATION", assignedStation.id)}
                            </span>
                            <StationBadge station={assignedStation} />
                          </div>
                        ) : (
                          <span className="text-slate-400">— Unassigned —</span>
                        )
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Reassign UI */}
                    <td className="px-4 py-3">
                      {u.role !== "Operator" ? (
                        <span className="text-slate-400">—</span>
                      ) : !isEditing ? (
                        <button
                          className="border px-3 py-1.5 rounded hover:bg-slate-50"
                          onClick={() => beginEdit(u.username)}
                        >
                          {assignedStation ? "Reassign" : "Assign"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded px-2 py-1"
                            value={editSelection[u.username] ?? ""}
                            onChange={(e) =>
                              setEditSelection((m) => ({ ...m, [u.username]: e.target.value }))
                            }
                          >
                            <option value="">— Unassigned —</option>
                            {stations.map((s, idx) => (
                              <option key={s.id ?? `s-${idx}`} value={s.id}>
                                {prettyId("STATION", s.id)} — {s.name}
                                {s.isActive ? "" : " (Inactive)"}
                              </option>
                            ))}
                          </select>
                          <button
                            className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                            onClick={() => applyEdit(u.username)}
                          >
                            Save
                          </button>
                          <button
                            className="border px-3 py-1.5 rounded hover:bg-slate-50"
                            onClick={() => cancelEdit(u.username)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
