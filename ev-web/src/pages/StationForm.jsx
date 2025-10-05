import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStation, createStation, updateStation } from "../services/stations";
import toast from "react-hot-toast";

export default function StationForm() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    type: "AC",
    slots: 1
  });

  useEffect(() => {
    if (editing) {
      getStation(id).then((s) => setForm({
        name: s.name,
        address: s.address || "",
        latitude: s.latitude || "",
        longitude: s.longitude || "",
        type: s.type,
        slots: s.slots
      }));
    }
  }, [editing, id]);

  const save = async (e) => {
    e.preventDefault();
    const dto = {
      name: form.name,
      address: form.address,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      type: form.type,
      slots: parseInt(form.slots)
    };

    try {
      if (editing) {
        await updateStation(id, dto);
      } else {
        await createStation(dto);
      }
      toast.success("Station saved");
      nav("/app/stations");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save station";
      toast.error(msg);
      console.error(err);
    }
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">
        {editing ? "Edit Station" : "New Station"}
      </h1>
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Station Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.0001"
          className="border rounded px-3 py-2 w-full"
          placeholder="Latitude"
          value={form.latitude}
          onChange={(e) => setForm({ ...form, latitude: e.target.value })}
        />
        <input
          type="number"
          step="0.0001"
          className="border rounded px-3 py-2 w-full"
          placeholder="Longitude"
          value={form.longitude}
          onChange={(e) => setForm({ ...form, longitude: e.target.value })}
        />
      </div>
      <select
        className="border rounded px-3 py-2 w-full"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="AC">AC</option>
        <option value="DC">DC</option>
      </select>
      <input
        type="number"
        min="1"
        className="border rounded px-3 py-2 w-full"
        placeholder="Number of Slots"
        value={form.slots}
        onChange={(e) => setForm({ ...form, slots: e.target.value })}
      />
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Save</button>
        <button
          type="button"
          className="border px-3 py-2 rounded"
          onClick={() => nav("/app/stations")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
