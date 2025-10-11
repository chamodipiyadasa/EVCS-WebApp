// src/pages/BookingForm.jsx
import { useEffect, useMemo, useState } from "react";
import { listStations } from "../services/stations";
import {
  createBooking,
  updateBooking,
  getBooking,
  listBookingsByStationDate,
} from "../services/bookings";
import api from "../api/client";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

/* ---------- helpers ---------- */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysISO(d, n) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}
function hhmmss(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}
function toHHMMSS(t) {
  if (!t) return "";
  const [h = "00", m = "00", s = "00"] = String(t).split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
}
function slotKey(slot, i) {
  const start = toHHMMSS(slot?.start);
  const end = toHHMMSS(slot?.end);
  return `${start || "start"}-${end || "end"}-${i}`;
}
function slotLabel(slot) {
  const start = toHHMMSS(slot?.start);
  const end = toHHMMSS(slot?.end);
  if (!start || !end) return "Invalid slot";
  return `${start.slice(0,5)} → ${end.slice(0,5)} (cap ${slot?.capacity ?? 1})`;
}

// minutes helpers
function toMinutes(t) {
  if (!t) return 0;
  if (typeof t === "object") {
    const h = Number(t.hour ?? 0);
    const m = Number(t.minute ?? 0);
    const s = Number(t.second ?? 0);
    return h * 60 + m + s / 60;
  }
  if (typeof t === "number") {
    const ms = t > 86400000 ? t % 86400000 : t;
    return Math.floor(ms / 60000);
  }
  const [h = "0", m = "0", s = "0"] = String(t).split(":");
  return Number(h) * 60 + Number(m) + Number(s) / 60;
}
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export default function BookingForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("");
  const [nic, setNic] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState(""); // "HH:mm:ss|HH:mm:ss"

  const [schedule, setSchedule] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---------- initial data ---------- */
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        setLoading(true);
        const ss = await listStations().catch(() => []);
        if (!cancelled) setStations(ss);

        if (isEdit) {
          const b = await getBooking(id);
          const d = `${b.date.year}-${String(b.date.month).padStart(2, "0")}-${String(
            b.date.day
          ).padStart(2, "0")}`;
          const start = hhmmss(b.start.hour, b.start.minute);
          const end = hhmmss(b.end.hour, b.end.minute);
          if (!cancelled) {
            setNic(b.nic);
            setStationId(b.stationId);
            setDate(d);
            setSlot(`${start}|${end}`);
          }
        } else if (ss.length > 0) {
          if (!cancelled) setStationId(ss[0].id);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load form data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  /* ---------- schedule load ---------- */
  useEffect(() => {
    let cancelled = false;
    async function loadSchedule() {
      try {
        if (!stationId || !date) {
          setSchedule(null);
          return;
        }
        const { data } = await api.get("/schedules", { params: { stationId, date } });
        if (!cancelled) setSchedule((data || [])[0] || null);
      } catch (e) {
        console.error(e);
        if (!cancelled) setSchedule(null);
      }
    }
    loadSchedule();
    return () => {
      cancelled = true;
    };
  }, [stationId, date]);

  /* ---------- conflicts ---------- */
  useEffect(() => {
    let cancelled = false;
    async function loadConflicts() {
      try {
        if (!stationId || !date) {
          setConflicts([]);
          return;
        }
        const data = await listBookingsByStationDate(stationId, date);
        if (!cancelled) setConflicts(data || []);
      } catch {
        if (!cancelled) setConflicts([]);
      }
    }
    loadConflicts();
    return () => {
      cancelled = true;
    };
  }, [stationId, date]);

  /* ---------- build slot models with live availability ---------- */
  const slotModels = useMemo(() => {
    if (!schedule) return [];
    const slots = (schedule.slots || [])
      .filter((s) => !!toHHMMSS(s?.start) && !!toHHMMSS(s?.end))
      .map((s, i) => {
        const start = toHHMMSS(s.start);
        const end = toHHMMSS(s.end);
        const startM = toMinutes(start);
        const endM = toMinutes(end);
        const isMaint = s.available === false;

        // bookings overlapping this window
        const bookedCount = isMaint
          ? 0
          : (conflicts || []).reduce((acc, b) => {
              const bs = toMinutes(b.start);
              const be = toMinutes(b.end);
              return acc + (overlaps(startM, endM, bs, be) ? 1 : 0);
            }, 0);

        const capacity = Math.max(0, Number(s.capacity || 0));
        const left = isMaint ? 0 : Math.max(0, capacity - bookedCount);
        const state = isMaint
          ? "maintenance"
          : capacity === 0
          ? "blocked"
          : left === 0
          ? "full"
          : left <= 1
          ? "low"
          : "ok";

        return {
          key: slotKey(s, i),
          start,
          end,
          label: `${start.slice(0,5)} → ${end.slice(0,5)}`,
          capacity,
          bookedCount,
          left,
          state, // maintenance | blocked | full | low | ok
        };
      });

    // sort earliest first
    return slots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [schedule, conflicts]);

  /* ---------- date window ---------- */
  const minDate = todayISO();
  const maxDate = addDaysISO(new Date(), 7);

  /* ---------- submit ---------- */
  async function submit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      if (!stationId || !nic || !date || !slot) {
        toast.error("Please fill all fields");
        return;
      }
      const [start, end] = slot.split("|");
      if (isEdit) {
        await updateBooking(id, { date, start, end });
        toast.success("Booking updated");
        nav("/app/bookings");
      } else {
        await createBooking({ nic, stationId, date, start, end });
        toast.success("Booking created");
        nav("/app/bookings");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <div className="py-20 text-center text-slate-500">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Management</div>
          <div className="text-2xl font-bold text-black">
            {isEdit ? "Edit Booking" : "New Booking"}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="bg-white border rounded-2xl p-5 shadow-sm space-y-5">
        {!isEdit && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1">Owner NIC</label>
              <input
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                placeholder="e.g. 200012345678"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1">Station</label>
              <select
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isEdit && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1">Owner NIC</label>
              <input className="border rounded-lg px-3 py-2 bg-slate-50" value={nic} disabled />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-500 mb-1">Station</label>
              <input
                className="border rounded-lg px-3 py-2 bg-slate-50"
                value={stations.find((s) => s.id === stationId)?.name || stationId}
                disabled
              />
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="text-xs text-slate-500 mt-1">
              Bookings allowed only within 7 days from today.
            </div>
          </div>

          {/* Slots Picker */}
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Time Slot</label>

            {/* Professional card grid for slots */}
            {slotModels.length === 0 ? (
              <div className="border rounded-lg px-3 py-2 text-sm text-slate-500 bg-slate-50">
                No published windows for this date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {slotModels.map((s) => {
                  const value = `${s.start}|${s.end}`;
                  const active = slot === value;

                  const stateStyles = {
                    maintenance: "border-rose-300 bg-rose-50 text-rose-700",
                    blocked: "border-slate-300 bg-slate-50 text-slate-500",
                    full: "border-slate-300 bg-slate-50 text-slate-500",
                    low: "border-amber-300 bg-amber-50 text-amber-800",
                    ok: "border-emerald-300 bg-emerald-50 text-emerald-800",
                  }[s.state];

                  const cursor = s.state === "full" || s.state === "maintenance" || s.state === "blocked"
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer";

                  return (
                    <label
                      key={s.key}
                      className={`border rounded-xl p-3 flex items-start gap-3 ${stateStyles} ${cursor} ${active ? "ring-2 ring-emerald-500" : ""}`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        className="mt-0.5"
                        value={value}
                        disabled={s.state === "full" || s.state === "maintenance" || s.state === "blocked"}
                        checked={active}
                        onChange={() => setSlot(value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {s.label}
                        </div>
                        <div className="text-xs mt-0.5">
                          Capacity <b>{s.capacity}</b> · Booked <b>{s.bookedCount}</b> · Left{" "}
                          <b>{s.left}</b>
                        </div>
                        {s.state === "maintenance" && (
                          <div className="text-xs mt-1">Maintenance window</div>
                        )}
                        {s.state === "full" && (
                          <div className="text-xs mt-1">Fully booked</div>
                        )}
                        {s.state === "low" && (
                          <div className="text-xs mt-1">Hurry—almost full</div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Assistive select (fallback / keyboard users) */}
            <select
              className="mt-2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              <option value="">Select a slot…</option>
              {slotModels.map((s) => (
                <option
                  key={`opt-${s.key}`}
                  value={`${s.start}|${s.end}`}
                  disabled={s.state === "maintenance" || s.state === "full" || s.state === "blocked"}
                >
                  {s.label} — left {s.left}/{s.capacity}
                </option>
              ))}
            </select>

            <div className="text-xs text-slate-500 mt-1">
              Slots are generated from the station’s schedule for the chosen date.
            </div>
          </div>
        </div>

        {/* Friendly conflicts panel */}
        {!!conflicts.length && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
            <div className="font-medium text-amber-900">
              Heads up — {conflicts.length} booking{conflicts.length !== 1 ? "s" : ""} already exist for this day.
            </div>
            <div className="text-amber-800 text-sm mt-1">
              Availability shown above already accounts for current bookings.
              If a slot is marked <b>Fully booked</b> or <b>Maintenance</b>, please pick another window.
            </div>
          </div>
        )}

        <div className="pt-2 flex gap-3">
          <button
            disabled={saving}
            className={`rounded-lg px-4 py-2 text-white ${saving ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700"} disabled:opacity-50`}
          >
            {isEdit ? "Save Changes" : "Create Booking"}
          </button>
          <button
            type="button"
            onClick={() => nav("/app/bookings")}
            className="border rounded-lg px-4 py-2 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
