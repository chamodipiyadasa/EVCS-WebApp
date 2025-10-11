import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateUser, listUsers } from "../services/users";

export default function UserForm() {
  const { username } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", role: "", isActive: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const users = await listUsers();
        const u = users.find((x) => x.username === username);
        if (!u) {
          toast.error("User not found");
          nav("/app/users");
          return;
        }
        setForm(u);
      } catch {
        toast.error("Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
  }, [username, nav]);

  async function save(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateUser(username, {
        role: form.role,
        isActive: form.isActive,
        password: "",
        assignedStationId: form.assignedStationId ?? null,
      });
      toast.success("User updated");
      nav("/app/users");
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <div className="text-center py-8 text-slate-500">Loading user…</div>;

  return (
    <form
      onSubmit={save}
      className="max-w-xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-4"
    >
      <h1 className="text-xl font-semibold">Edit User</h1>

      <div>
        <label className="block text-sm text-slate-600 mb-1">Username</label>
        <input
          disabled
          className="border rounded-lg px-3 py-2 w-full bg-slate-100"
          value={form.username}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">Role</label>
        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="Backoffice">Backoffice</option>
          <option value="Operator">Operator</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        <span className="text-sm">Active</span>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => nav("/app/users")}
          className="px-3 py-2 border rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          disabled={saving}
          className={`px-4 py-2 rounded-lg text-white ${
            saving ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
