// src/pages/Users.jsx
import { useEffect, useState } from "react";
import { listUsers, createUser, assignStation, unassignStation } from "../services/users";
import { listStations } from "../services/stations";
import toast from "react-hot-toast";

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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "Operator",
    stationId: "",
  });

  async function refresh() {
    try {
      const [u, s] = await Promise.all([listUsers(), listStations()]);
      setUsers(Array.isArray(u) ? u : []);
      setStations(Array.isArray(s) ? s : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users or stations");
    }
  }

  useEffect(() => { refresh(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return toast.error("Fill username and password");
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        isActive: true,
        assignedStationId: form.role === "Operator" ? (form.stationId || null) : null,
      };
      const newUser = await createUser(payload);
      toast.success(`${newUser.role} created`);
      setForm({ username: "", password: "", role: "Operator", stationId: "" });
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Create failed");
    }
  }

  async function handleAssign(u, stationId) {
    try {
      if (!stationId) {
        await unassignStation(u.username);
        toast.success(`Unassigned ${u.username}`);
      } else {
        await assignStation(u.username, stationId);
        toast.success(`Assigned ${u.username}`);
      }
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Assignment failed");
    }
  }

  const stationLabel = (stationId) => {
    const s = stations.find((x) => x.id === stationId);
    return s ? `${prettyId("STATION", s.id)} — ${s.name}` : stationId || "—";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Users</h1>

      {/* Create user */}
      <form onSubmit={onCreate} className="bg-white border rounded-xl p-4 grid md:grid-cols-4 gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="border rounded px-3 py-2"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value, stationId: "" })}
        >
          <option value="Operator">Operator</option>
          <option value="Backoffice">Backoffice</option>
        </select>

        {form.role === "Operator" && (
          <select
            className="border rounded px-3 py-2"
            value={form.stationId}
            onChange={(e) => setForm({ ...form, stationId: e.target.value })}
          >
            <option key="st-none" value="">Assign to Station…</option>
            {stations.map((s, idx) => (
              <option key={s.id || `st-${idx}`} value={s.id || ""}>
                {s.id ? `${prettyId("STATION", s.id)} — ${s.name}` : s.name || `Station ${idx + 1}`}
              </option>
            ))}
          </select>
        )}

        <button className="bg-blue-600 text-white px-4 py-2 rounded col-span-4">Create</button>
      </form>

      {/* Users list */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Username</th>
              <th>Role</th>
              <th>Active</th>
              <th>Assigned Station</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id || u.username || `row-${idx}`} className="border-t">
                <td className="px-4 py-2">{u.username || <i className="text-slate-400">unknown</i>}</td>
                <td className="text-center">{u.role || "—"}</td>
                <td className="text-center">{u.isActive ? "✅" : "❌"}</td>
                <td className="text-center">{stationLabel(u.assignedStationId)}</td>
                <td className="text-center">
                  {u.role === "Operator" && (
                    <select
                      className="border rounded px-2 py-1"
                      value={u.assignedStationId || ""}
                      onChange={(e) => handleAssign(u, e.target.value)}
                    >
                      <option key="opt-unassigned" value="">Unassigned</option>
                      {stations.map((s, sIdx) => (
                        <option key={s.id || `opt-st-${sIdx}`} value={s.id || ""}>
                          {s.name || `Station ${sIdx + 1}`}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">No users</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
