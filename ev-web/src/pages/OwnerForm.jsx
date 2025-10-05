// src/pages/OwnerForm.jsx
import { useState, useEffect } from "react";
import { createOwner, getOwner, updateOwner } from "../services/owners";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function OwnerForm() {
  const { nic } = useParams();
  const editing = !!nic;
  const nav = useNavigate();

  const [form, setForm] = useState({
    nic: "",
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (editing) {
      getOwner(nic).then(setForm).catch(() => toast.error("Failed to load"));
    }
  }, [editing, nic]);

  async function save(e) {
    e.preventDefault();
    try {
      if (editing) {
        await updateOwner(nic, form);
        toast.success("Owner updated");
      } else {
        await createOwner(form);
        toast.success("Owner created");
      }
      nav("/app/owners");
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  }

  return (
    <form onSubmit={save} className="max-w-lg space-y-3">
      <h1 className="text-xl font-semibold">
        {editing ? "Edit Owner" : "Add Owner"}
      </h1>
      {!editing && (
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="NIC"
          value={form.nic}
          onChange={(e) => setForm({ ...form, nic: e.target.value })}
        />
      )}
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Full Name"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save
        </button>
        <button
          type="button"
          onClick={() => nav("/app/owners")}
          className="border px-4 py-2 rounded hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
