// src/pages/Schedules.jsx
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { listStations, getStation } from "../services/stations";
import { getSchedule, upsertSchedule } from "../services/schedules";
import { listBookingsByStationDate } from "../services/bookings";

/* ---------------- helpers ---------------- */

const HOUR_ROWS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
const toISO = (d) => d.toISOString().slice(0, 10);
const todayISO = () => toISO(new Date());
const addDaysISO = (iso, n) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

const toMin = (hhmm) => {
  const [h = "0", m = "0"] = String(hhmm || "00:00").split(":");
  return Number(h) * 60 + Number(m);
};
const norm = (t) => {
  if (!t) return "00:00";
  const [h = "00", m = "00"] = t.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};

const overlaps = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;

/** Given schedule windows, return status for hour h and slotIndex k
 * statuses: "available" | "maintenance" | "closed"
 */
function cellStatusForHour(slots, bookings, stationSlots, hour, slotIndex) {
  const hStart = hour * 60;
  const hEnd = hStart + 60;

  // Find any schedule window covering this hour block
  const covering = (slots || []).find((w) => {
    const s = toMin(w.start);
    const e = toMin(w.end);
    return overlaps(s, e, hStart, hEnd);
  });

  if (!covering) return "closed"; // no schedule window → closed

  if (covering.available === false) return "maintenance";

  // capacity N exposes N columns as available (A1..AN)
  if ((covering.capacity || 0) > slotIndex) return "available";

  // slot index exceeds capacity
  return "closed";
}

function fmtDayTab(dateISO) {
  const d = new Date(dateISO);
  const isToday = dateISO === todayISO();
  return {
    label: isToday
      ? "Today"
      : d.toLocaleDateString(undefined, { weekday: "short" }),
    sub: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  };
}

/* ---------------- component ---------------- */

export default function Schedules() {
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("");
  const [stationMeta, setStationMeta] = useState(null); // for Slots count

  // 7-day strip + calendar jump
  const [baseDate, setBaseDate] = useState(todayISO());
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysISO(baseDate, i)),
    [baseDate]
  );
  const [dayIndex, setDayIndex] = useState(0);
  const date = days[dayIndex];

  // data
  const [windows, setWindows] = useState([]); // schedule windows
  const [bookings, setBookings] = useState([]); // overlay
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // lightweight editor popover
  const [editOpen, setEditOpen] = useState(false);
  const [editModel, setEditModel] = useState({ start: "09:00", end: "10:00", capacity: 1, available: true });

  const maxCapacity = Math.max(1, Number(stationMeta?.slots || 1));

  /* -------- load stations once -------- */
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const ss = await listStations().catch(() => []);
        if (cancel) return;
        setStations(ss || []);
        if (!stationId && ss?.length) setStationId(ss[0].id);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load stations");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => (cancel = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- station meta (Slots count) -------- */
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!stationId) return;
      try {
        const meta = await getStation(stationId).catch(() => null);
        if (!cancel) setStationMeta(meta);
      } catch {}
    })();
    return () => (cancel = true);
  }, [stationId]);

  /* -------- schedule + bookings for selected day -------- */
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!stationId || !date) return;
      try {
        setLoading(true);
        const [sch, bs] = await Promise.all([
          getSchedule(stationId, date),
          listBookingsByStationDate(stationId, date).catch(() => []),
        ]);

        if (cancel) return;
        const mapped = (sch?.slots || []).map((x) => ({
          start: (x.start || "").slice(0, 5), // HH:mm
          end: (x.end || "").slice(0, 5),
          capacity: Number(x.capacity || 0),
          available: x.available !== false,
        }));

        setWindows(mapped);
        setBookings(bs || []);
      } catch (e) {
        console.error(e);
        if (!cancel) {
          setWindows([]);
          setBookings([]);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => (cancel = true);
  }, [stationId, date]);

  /* ---------------- editor ---------------- */

  function openEditor(preset) {
    setEditModel({
      start: preset?.start || "09:00",
      end: preset?.end || "10:00",
      capacity: Math.min(maxCapacity, Number(preset?.capacity || 1)),
      available: preset?.available ?? true,
    });
    setEditOpen(true);
  }

  function addWindow(model) {
    const n = {
      start: norm(model.start),
      end: norm(model.end),
      capacity: Math.min(maxCapacity, Math.max(0, Number(model.capacity || 0))),
      available: model.available !== false,
    };
    if (toMin(n.end) <= toMin(n.start)) {
      toast.error("End time must be after Start time");
      return;
    }
    setWindows((prev) => {
      const merged = [...prev, n].sort((a, b) => toMin(a.start) - toMin(b.start));
      return merged;
    });
    setEditOpen(false);
  }

  async function saveAll() {
    try {
      setSaving(true);
      const payload = (windows || []).map((w) => ({
        ...w,
        start: `${w.start}:00`,
        end: `${w.end}:00`,
      }));
      await upsertSchedule({ stationId, date, slots: payload });
      toast.success("Schedule saved");

      // refresh bookings overlay
      const bs = await listBookingsByStationDate(stationId, date).catch(() => []);
      setBookings(bs || []);
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.error || e?.response?.data || e.message;
      toast.error(String(msg || "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  function removeAllWindowsOnHour(h) {
    const start = h * 60, end = start + 60;
    setWindows((prev) =>
      prev.filter((w) => !overlaps(toMin(w.start), toMin(w.end), start, end))
    );
  }

  /* ---------------- UI pieces ---------------- */

  const cols = Math.max(1, Number(stationMeta?.slots || 1));
  const colHeaders = Array.from({ length: cols }, (_, i) => `Slot ${String.fromCharCode(65 + i)}`);

  function Legend() {
    return (
      <div className="flex gap-6 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-300 inline-block" /> Available
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-300 inline-block" /> Booked
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-rose-300 inline-block" /> Maintenance
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-200 inline-block" /> Closed
        </span>
      </div>
    );
  }

  function BookedBadge({ hour }) {
    // Show a tiny badge if this hour has bookings
    const count = (bookings || []).filter((b) => {
      const s = toMin((b.start || "").slice(0, 5));
      const e = toMin((b.end || "").slice(0, 5));
      return overlaps(s, e, hour * 60, hour * 60 + 60);
    }).length;

    if (!count) return null;
    return (
      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
        {count} booking{count > 1 ? "s" : ""}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <div className="text-slate-500 text-xs">Schedules</div>
        <div className="text-2xl font-semibold">Station Schedule</div>
        <p className="text-slate-500 text-sm">
          Quickly review a day. Windows define when slots are available; capacity ≤{" "}
          <b>{stationMeta?.slots ?? "…"}</b> shows how many columns turn green. Operators see the result; Backoffice edits.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs text-slate-500">Station</div>
            <select
              className="mt-1 border rounded-lg px-3 py-2 min-w-[260px]"
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
            >
              {(stations || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.address}
                </option>
              ))}
            </select>
            {!!stationMeta && (
              <div className="text-xs text-slate-500 mt-1">
                Slots (max capacity): <b>{stationMeta.slots}</b>
              </div>
            )}
          </div>

        {/* Calendar jump + 7-day strip */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBaseDate(addDaysISO(baseDate, -7))}
              className="px-3 py-2 rounded-lg border bg-slate-50 hover:bg-slate-100"
              title="Previous 7 days"
            >
              ◀︎ 7d
            </button>
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={baseDate}
              onChange={(e) => {
                setBaseDate(e.target.value);
                setDayIndex(0);
              }}
            />
            <button
              onClick={() => { setBaseDate(todayISO()); setDayIndex(0); }}
              className="px-3 py-2 rounded-lg border bg-slate-50 hover:bg-slate-100"
            >
              Today
            </button>
            <button
              onClick={() => setBaseDate(addDaysISO(baseDate, 7))}
              className="px-3 py-2 rounded-lg border bg-slate-50 hover:bg-slate-100"
              title="Next 7 days"
            >
              7d ▶︎
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {days.map((d, i) => {
            const { label, sub } = fmtDayTab(d);
            const active = i === dayIndex;
            return (
              <button
                key={d}
                onClick={() => setDayIndex(i)}
                className={
                  "px-4 py-3 rounded-xl border transition " +
                  (active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200")
                }
              >
                <div className="text-sm font-semibold">{label}</div>
                <div className={active ? "text-blue-100 text-xs" : "text-slate-500 text-xs"}>
                  {sub}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <Legend />
          <div className="flex gap-2">
            <button
              onClick={() => openEditor({ start: "09:00", end: "10:00", capacity: Math.min(1, maxCapacity), available: true })}
              className="px-3 py-2 rounded-lg border bg-slate-50 hover:bg-slate-100"
            >
              + Add window
            </button>
            <button
              onClick={saveAll}
              disabled={saving}
              className={"px-3 py-2 rounded-lg text-white " + (saving ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700")}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b px-5 py-3 font-semibold">
          Schedule for {new Date(date).toLocaleDateString()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left w-32">Time</th>
                {colHeaders.map((h) => (
                  <th key={h} className="px-4 py-2 text-center">{h}</th>
                ))}
                <th className="px-4 py-2 text-right w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {HOUR_ROWS.map((hh, row) => (
                <tr key={`row-${hh}`} className="border-t">
                  <td className="px-4 py-2 font-medium text-slate-700">
                    {hh}
                    <BookedBadge hour={row} />
                  </td>

                  {/* slot columns */}
                  {Array.from({ length: cols }, (_, k) => {
                    const st = cellStatusForHour(windows, bookings, cols, row, k);
                    const bg =
                      st === "available"
                        ? "bg-emerald-100 text-emerald-700"
                        : st === "maintenance"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-500";
                    const label =
                      st === "available" ? "Available" : st === "maintenance" ? "Maintenance" : "Closed";
                    return (
                      <td key={`c-${row}-${k}`} className="px-2 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${bg}`}>{label}</span>
                      </td>
                    );
                  })}

                  {/* row actions */}
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          openEditor({
                            start: `${String(row).padStart(2, "0")}:00`,
                            end: `${String(Math.min(row + 1, 24)).padStart(2, "0")}:00`,
                            capacity: Math.min(1, maxCapacity),
                            available: true,
                          })
                        }
                        className="px-2 py-1 rounded border bg-slate-50 hover:bg-slate-100"
                      >
                        Edit windows
                      </button>
                      <button
                        onClick={() => removeAllWindowsOnHour(row)}
                        className="px-2 py-1 rounded border bg-rose-50 text-rose-700 hover:bg-rose-100"
                      >
                        Clear hour
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Drawer (simple) */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setEditOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Add / Update Window</div>
              <button onClick={() => setEditOpen(false)} className="px-3 py-1 rounded border">Close</button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-slate-600">Start</div>
                <input
                  type="time"
                  step="900"
                  className="border rounded px-3 py-2 w-40"
                  value={norm(editModel.start)}
                  onChange={(e) => setEditModel((m) => ({ ...m, start: norm(e.target.value) }))}
                />
              </div>
              <div>
                <div className="text-sm text-slate-600">End</div>
                <input
                  type="time"
                  step="900"
                  className="border rounded px-3 py-2 w-40"
                  value={norm(editModel.end)}
                  onChange={(e) => setEditModel((m) => ({ ...m, end: norm(e.target.value) }))}
                />
              </div>
              <div>
                <div className="text-sm text-slate-600">
                  Capacity <span className="text-slate-400">(0–{maxCapacity})</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={maxCapacity}
                  className="border rounded px-3 py-2 w-32"
                  value={editModel.capacity}
                  onChange={(e) =>
                    setEditModel((m) => ({ ...m, capacity: Number(e.target.value || 0) }))
                  }
                />
              </div>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editModel.available === false}
                  onChange={(e) => setEditModel((m) => ({ ...m, available: e.target.checked ? false : true }))}
                />
                <span className="text-sm text-slate-600">Mark as maintenance</span>
              </label>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => addWindow(editModel)}
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add / Merge
                </button>
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-3 py-2 rounded border bg-slate-50 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>

              <div className="text-xs text-slate-500 mt-4">
                Tip: You can add multiple windows (e.g., 09:00–12:00 capacity 2, then 14:00–18:00 capacity 1). The table
                will turn <b>green</b> for exposed slots, <b>rose</b> for maintenance, and <b>grey</b> when closed.
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-center text-slate-500 py-6">Loading…</div>}
    </div>
  );
}
