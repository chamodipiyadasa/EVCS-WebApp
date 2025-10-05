// src/pages/BookingForm.jsx
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getBooking, createBooking, updateBooking } from "../services/bookings";
import { listStations } from "../services/stations";
import { getSchedule } from "../services/schedules";
import toast from "react-hot-toast";

/* ---------- pretty ID (frontend-only) ---------- */
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

export default function BookingForm() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const [sp] = useSearchParams();

  // 7-day window
  const today = useMemo(() => new Date(), []);
  const minDate = useMemo(() => today.toISOString().slice(0, 10), [today]);
  const maxDate = useMemo(
    () => new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    [today]
  );

  // reference data
  const [stations, setStations] = useState([]);
  const [scheduleRaw, setScheduleRaw] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [manual, setManual] = useState(false);

  // form state (match backend)
  const [form, setForm] = useState({
    nic: "",
    stationId: sp.get("stationId") || "",
    date: sp.get("date") || minDate,
    start: "",
    end: "",
  });

  /* --------- time helpers / normalizers --------- */
  const two = (n) => String(n).padStart(2, "0");
  const toHmss = (hm) => (hm && hm.length === 5 ? hm + ":00" : hm);

  function toHmFromAny(val) {
    if (typeof val === "string") {
      const m = val.match(/^(\d{2}):(\d{2})/);
      if (m) return `${m[1]}:${m[2]}`;
    }
    if (val && typeof val === "object") {
      const h = val.hours ?? val.Hours ?? val.hour ?? val.Hour;
      const m = val.minutes ?? val.Minutes ?? val.minute ?? val.Minute;
      if (Number.isFinite(h) && Number.isFinite(m)) return `${two(h)}:${two(m)}`;
      if (typeof val.Value === "string") return toHmFromAny(val.Value);
      if (typeof val.value === "string") return toHmFromAny(val.value);
    }
    return "";
  }
  function pick(obj, keys) {
    for (const k of keys) {
      if (obj && obj[k] !== undefined) return obj[k];
    }
    return undefined;
  }
  function normSlot(raw) {
    if (!raw || typeof raw !== "object") return null;
    const startRaw = pick(raw, ["start", "Start", "from", "From", "begin", "Begin"]);
    const endRaw = pick(raw, ["end", "End", "to", "To", "finish", "Finish"]);
    let start = toHmFromAny(startRaw);
    let end = toHmFromAny(endRaw);

    if (!start) {
      for (const v of Object.values(raw)) {
        const t = toHmFromAny(v);
        if (t) { start = t; break; }
      }
    }
    if (!end) {
      for (const v of Object.values(raw)) {
        const t = toHmFromAny(v);
        if (t && t !== start) { end = t; break; }
      }
    }
    const available = (raw.available ?? raw.Available ?? true) !== false;
    const capVal = pick(raw, ["capacity", "Capacity", "cap", "Cap"]);
    const capacity = capVal != null ? Number(capVal) : undefined;

    if (!start || !end) return null;
    return { start, end, available, capacity };
  }
  function extractSlots(sch) {
    if (!sch) return [];
    const arr1 = sch.slots ?? sch.Slots;
    if (Array.isArray(arr1)) return arr1.map(normSlot).filter(Boolean);
    if (Array.isArray(sch)) return sch.map(normSlot).filter(Boolean);
    for (const v of Object.values(sch)) {
      if (Array.isArray(v)) return v.map(normSlot).filter(Boolean);
    }
    return [];
  }

  /* --------- data loads --------- */
  useEffect(() => {
    listStations()
      .then((s) => {
        setStations(s || []);
        // if coming from /bookings/new with ?stationId, keep it; else default first
        if (!form.stationId && s && s.length) {
          setForm((f) => ({ ...f, stationId: s[0].id }));
        }
      })
      .catch(() => setStations([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editing) return;
    getBooking(id)
      .then((b) =>
        setForm({
          nic: b.nic,
          stationId: b.stationId,
          date: String(b.date),
          start: toHmFromAny(b.start),
          end: toHmFromAny(b.end),
        })
      )
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load booking");
      });
  }, [editing, id]);

  useEffect(() => {
    if (!form.stationId || !form.date) {
      setScheduleRaw(null);
      setSlots([]);
      return;
    }
    setLoadingSchedule(true);
    getSchedule(form.stationId, form.date)
      .then((sch) => {
        setScheduleRaw(sch ?? null);
        const s = extractSlots(sch ?? null);
        setSlots(s);
        setManual(s.length === 0);
      })
      .catch(() => {
        setScheduleRaw(null);
        setSlots([]);
        setManual(true);
      })
      .finally(() => setLoadingSchedule(false));
  }, [form.stationId, form.date]);

  const onPickSlot = (s) => {
    if (!s?.start || !s?.end) return;
    setForm((f) => ({ ...f, start: s.start, end: s.end }));
  };

  /* --------- submit --------- */
  const save = async (e) => {
    e.preventDefault();

    if (!editing && !form.nic.trim()) return toast.error("NIC is required");
    if (!form.stationId) return toast.error("Select a station");
    if (!form.date) return toast.error("Select a date");
    if (!form.start || !form.end) return toast.error("Pick a slot");

    try {
      if (editing) {
        await updateBooking(id, {
          date: form.date,
          start: toHmss(form.start),
          end: toHmss(form.end),
        });
        toast.success("Booking updated");
        nav(`/app/bookings?stationId=${encodeURIComponent(form.stationId)}&date=${encodeURIComponent(form.date)}`);
      } else {
        const created = await createBooking({
          nic: form.nic.trim(),
          stationId: form.stationId,
          date: form.date,
          start: toHmss(form.start),
          end: toHmss(form.end),
        });
        // show pretty booking id on success
        const pretty = prettyId("BOOKING", created?.id);
        toast.success(`Created ${pretty}`);
        nav(`/app/bookings?stationId=${encodeURIComponent(form.stationId)}&date=${encodeURIComponent(form.date)}`);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Booking failed";
      toast.error(msg);
      console.error(err);
    }
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">{editing ? "Edit Booking" : "New Booking"}</h1>

      {!editing && (
        <div>
          <label className="text-sm text-slate-600">Owner NIC</label>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="923456789V"
            value={form.nic}
            onChange={(e) => setForm({ ...form, nic: e.target.value })}
          />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-slate-600">Station</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={form.stationId}
            onChange={(e) => setForm({ ...form, stationId: e.target.value, start: "", end: "" })}
            disabled={editing}
          >
            <option value="">Select a station…</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {/* show pretty station id in dropdown */}
                {prettyId("STATION", s.id)} — {s.name} ({s.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600">Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={form.date}
            min={minDate}
            max={maxDate}
            onChange={(e) => setForm({ ...form, date: e.target.value, start: "", end: "" })}
          />
          <p className="text-xs text-slate-500 mt-1">Bookings allowed only within the next 7 days.</p>
        </div>
      </div>

      {/* Slots / Manual */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Available slots</div>
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
            Manual time entry
          </label>
        </div>

        {loadingSchedule ? (
          <div className="text-slate-500 text-sm mt-2">Loading schedule…</div>
        ) : manual ? (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm text-slate-600">Start (HH:mm)</label>
              <input
                type="time"
                className="border rounded px-3 py-2 w-full"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">End (HH:mm)</label>
              <input
                type="time"
                className="border rounded px-3 py-2 w-full"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
              />
            </div>
            <p className="text-xs text-slate-500 col-span-2">
              Use manual entry if slots don’t appear (backend schedule shape can vary).
            </p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-rose-600 text-sm mt-2">No schedule published or no slots for this day.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            {slots.map((slot, i) => {
              const selected = form.start === slot.start && form.end === slot.end;
              const disabled = slot.available === false || (slot.capacity ?? 0) <= 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !disabled && onPickSlot(slot)}
                  disabled={disabled}
                  className={`px-3 py-2 rounded border text-sm ${
                    selected
                      ? "bg-blue-600 text-white border-blue-600"
                      : disabled
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {slot.start} – {slot.end} {slot.capacity != null ? `· cap ${slot.capacity}` : ""}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-3 text-sm text-slate-700">
          Selected:{" "}
          {form.start && form.end ? (
            <b>
              {form.date} {form.start}–{form.end}
            </b>
          ) : (
            <span className="text-slate-500">none</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        <button type="button" className="border px-4 py-2 rounded" onClick={() => nav("/app/bookings")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
