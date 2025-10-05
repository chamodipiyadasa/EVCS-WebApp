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

// Assigned operators for a station (both Backoffice & Operator can call)
export async function listOperatorsForStation(id) {
  const { data } = await api.get(`/stations/${id}/operators`);
  return data || [];
}
