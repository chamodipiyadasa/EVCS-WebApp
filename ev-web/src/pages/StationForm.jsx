import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { getStation, createStation, updateStation } from "../services/stations";
import toast from "react-hot-toast";

// Map
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Basic Leaflet default icon fix for modern bundlers
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Small helper: debounce
function useDebounced(value, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

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
    slots: 1,
  });

  // --- Search state ---
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 350);
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [openList, setOpenList] = useState(false);
  const listRef = useRef(null);

  // Load station if editing
  useEffect(() => {
    if (!editing) return;
    (async () => {
      try {
        const s = await getStation(id);
        setForm({
          name: s.name || "",
          address: s.address || "",
          latitude: s.latitude ?? "",
          longitude: s.longitude ?? "",
          type: s.type || "AC",
          slots: s.slots ?? 1,
        });
      } catch (e) {
        toast.error("Failed to load station");
      }
    })();
  }, [editing, id]);

  // Search (OpenStreetMap Nominatim)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!dq?.trim()) {
        setResults([]);
        return;
      }
      try {
        setLoadingSearch(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          dq
        )}&limit=8&addressdetails=1`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();
        if (!cancelled) {
          setResults(
            Array.isArray(data)
              ? data.map((r) => ({
                  id: r.place_id,
                  label: r.display_name,
                  lat: parseFloat(r.lat),
                  lon: parseFloat(r.lon),
                }))
              : []
          );
          setOpenList(true);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoadingSearch(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dq]);

  // Close results list when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (!listRef.current) return;
      if (!listRef.current.contains(e.target)) setOpenList(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Selected position
  const position = useMemo(() => {
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng)
      ? [lat, lng]
      : null;
  }, [form.latitude, form.longitude]);

  const defaultCenter = useMemo(() => {
    // Prefer user-entered coords; else a global-friendly center
    return position ?? [20, 0];
  }, [position]);

  function pickResult(r) {
    setForm((f) => ({
      ...f,
      address: r.label,
      latitude: r.lat,
      longitude: r.lon,
    }));
    setQ(r.label);
    setOpenList(false);
  }

  // Click map to set coords
  function ClickToSetMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
      },
    });
    return null;
  }

  // Use browser geolocation
  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        toast.success("Location captured");
      },
      () => toast.error("Unable to get your location"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const save = async (e) => {
    e.preventDefault();

    // Basic checks
    if (!form.name.trim()) return toast.error("Name is required");
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return toast.error("Please provide valid latitude/longitude");
    }

    const dto = {
      name: form.name.trim(),
      address: form.address.trim(),
      latitude: lat,
      longitude: lng,
      type: form.type,
      slots: parseInt(form.slots || 1, 10),
    };

    try {
      if (editing) await updateStation(id, dto);
      else await createStation(dto);
      toast.success("Station saved");
      nav("/app/stations");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save station";
      toast.error(msg);
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <form
        onSubmit={save}
        className="w-full max-w-3xl bg-white border rounded-2xl shadow-sm p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {editing ? "Edit Station" : "New Station"}
          </h1>
        </div>

        {/* Search address */}
        <div className="relative" ref={listRef}>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Search address / place
          </label>
          <input
            className="border rounded-lg px-3 py-2 w-full"
            placeholder="Type to search (e.g. 'Galle Face, Colombo')"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => q && results.length && setOpenList(true)}
          />
          <p className="text-xs text-slate-500 mt-1">
            You can skip this and manually enter the address, or click on the map to set coordinates.
          </p>

          {openList && (loadingSearch || results.length > 0) && (
            <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-auto">
              {loadingSearch && (
                <div className="px-3 py-2 text-sm text-slate-500">Searching…</div>
              )}
              {!loadingSearch &&
                results.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => pickResult(r)}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                  >
                    {r.label}
                  </button>
                ))}
              {!loadingSearch && results.length === 0 && q.trim() && (
                <div className="px-3 py-2 text-sm text-slate-500">
                  No results — type a different query or enter details below.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manual fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Station Name
            </label>
            <input
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Station name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Address
            </label>
            <input
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="Street, city"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="e.g. 6.927079"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="e.g. 79.861244"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </div>
        </div>

        {/* Map + quick actions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-600">
              Click on the map to set coordinates
            </div>
            <button
              type="button"
              onClick={useMyLocation}
              className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
            >
              Use My Location
            </button>
          </div>

          <div className="h-72 rounded-xl overflow-hidden border">
            <MapContainer
              center={defaultCenter}
              zoom={position ? 15 : 3}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickToSetMarker />
              {position && <Marker position={position} />}
            </MapContainer>
          </div>
        </div>

        {/* Type & slots */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Charger Type
            </label>
            <select
              className="border rounded-lg px-3 py-2 w-full"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="AC">AC</option>
              <option value="DC">DC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Number of Slots
            </label>
            <input
              type="number"
              min="1"
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="1"
              value={form.slots}
              onChange={(e) => setForm({ ...form, slots: e.target.value })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            className="border px-4 py-2 rounded-lg hover:bg-slate-50"
            onClick={() => nav("/app/stations")}
          >
            Cancel
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
