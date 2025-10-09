// src/services/schedules.js
import api from "../api/client";

/* ---------- helpers ---------- */
function toHHMMSS(t) {
  if (!t) return "";
  const [h = "00", m = "00", s = "00"] = String(t).split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
}
function normSlots(slots = []) {
  return (slots || []).map((s) => ({
    start: toHHMMSS(s.start),
    end: toHHMMSS(s.end),
    available: Boolean(s.available),
    capacity: Math.max(1, Number(s.capacity || 1)),
  }));
}

/* ---------- queries ---------- */

export async function getSchedule(stationId, date /* YYYY-MM-DD */) {
  const { data } = await api.get("/schedules", { params: { stationId, date } });
  // Backend returns an array; we use the first item or null
  return (data && data[0]) || null;
}

/* ---------- mutations ---------- */

export async function upsertSchedule({ stationId, date, slots }) {
  const body = {
    stationId,
    date,                // YYYY-MM-DD (DateOnly)
    slots: normSlots(slots), // TimeOnly -> "HH:mm:ss"
  };
  try {
    const { data } = await api.put("/schedules", body);
    return data;
  } catch (err) {
    // Bubble useful backend error if present
    const msg = err?.response?.data?.error || err?.response?.data || err.message;
    const e = new Error(msg);
    e.response = err.response;
    throw e;
  }
}
