// src/services/stations.js
import api from "../api/client";

// List stations (role-aware: Backoffice -> all, Operator -> only my station)
export async function listStations() {
  const { data } = await api.get("/stations");
  return data || [];
}

// One station by id
export async function getStation(id) {
  const { data } = await api.get(`/stations/${id}`);
  return data;
}

// Create (Backoffice)
export async function createStation(req) {
  const { data } = await api.post("/stations", req);
  return data;
}

// Update (Backoffice) – req must include all fields the API expects
export async function updateStation(id, req) {
  await api.put(`/stations/${id}`, req);
}

// Assigned operators for a station
export async function listOperatorsForStation(id) {
  try {
    // Preferred (if backend has it)
    const { data } = await api.get(`/stations/${id}/operators`);
    return data || [];
  } catch (err) {
    // If that endpoint doesn't exist (404), fall back to /users and filter
    if (err?.response?.status === 404) {
      const { data: users } = await api.get("/users");
      const arr = Array.isArray(users) ? users : [];

      // support either a single 'assignedStationId' or an array 'assignedStations'
      const ops = arr.filter(
        (u) =>
          String(u.role).toLowerCase() === "operator" &&
          (
            u.assignedStationId === id ||
            (Array.isArray(u.assignedStations) && u.assignedStations.includes(id))
          )
      );
      return ops;
    }
    // bubble other errors
    throw err;
  }
}

// Delete (Backoffice) – hard delete station
export async function deleteStation(id) {
  await api.delete(`/stations/${encodeURIComponent(id)}`);
}

