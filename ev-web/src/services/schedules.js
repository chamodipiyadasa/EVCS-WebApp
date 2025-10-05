// src/services/schedules.js
import api from "../api/client";

/** Ensure strict formats the API expects */
function toHms(hm) {
  if (!hm) return "";
  return hm.length === 5 ? hm + ":00" : hm; // "HH:mm" -> "HH:mm:ss"
}

/** GET /api/schedules?stationId=...&date=YYYY-MM-DD
 *  Some backends return a single object, others return [object].
 *  Normalize to a single object with { stationId, date, slots }.
 */
export async function getSchedule(stationId, date) {
  if (!stationId || !date) return null;
  const { data } = await api.get("/schedules", { params: { stationId, date } });
  if (!data) return null;

  // If array, take the first item that has a slots array (or the first item at least)
  if (Array.isArray(data)) {
    const first = data.find(x => Array.isArray(x?.slots) || Array.isArray(x?.Slots)) || data[0];
    return first ?? null;
  }
  return data; // already a single object
}

/** PUT /api/schedules with {stationId, date, slots: [{start,end,available,capacity}]} */
export async function upsertSchedule({ stationId, date, slots }) {
  const payload = {
    stationId,
    date, // MUST be "YYYY-MM-DD"
    slots: (slots || []).map(s => ({
      start: toHms(s.start), // MUST be "HH:mm:ss"
      end: toHms(s.end),
      available: s.available !== false,
      capacity: Number.isFinite(+s.capacity) ? +s.capacity : 1,
    })),
  };
  await api.put("/schedules", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return true;
}
