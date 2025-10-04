import api from "./client";

// Server API paths are under /api/Stations (capital S). Use exact paths so we
// don't accidentally fetch the frontend route (which returns HTML and caused
// `data.map is not a function`).
export const listStations = () => {
  // axios resolves the full URL internally; log it via request config
  console.debug('[api] GET /api/Stations requesting baseURL=', api.defaults.baseURL)
  return api.get("/api/Stations").then(r => {
    // debug: log full response so we can inspect unexpected HTML or shapes
    console.debug('[api] GET /api/Stations response:', r)
    return r.data
  });
}

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
