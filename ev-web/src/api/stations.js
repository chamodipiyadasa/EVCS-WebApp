import api from "./client";

// List all stations
export const listStations = () =>
  api.get("/stations").then(r => r.data);

// Get station by ID
export const getStation = (id) =>
  api.get(`/stations/${id}`).then(r => r.data);

// Create new station
export const createStation = (dto) =>
  api.post("/stations", dto).then(r => r.data);

// Update station
export const updateStation = (id, dto) =>
  api.put(`/stations/${id}`, dto).then(r => r.data);

// Deactivate station (backend enforces "no active bookings" rule)
export const deactivateStation = (id) =>
  api.put(`/stations/${id}/deactivate`).then(r => r.data);
