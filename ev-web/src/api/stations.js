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
  api.get(`/api/Stations/${id}`).then(r => r.data);

export const createStation = (dto) =>
  api.post(`/api/Stations`, dto).then(r => r.data);

export const updateStation = (id, dto) =>
  api.put(`/api/Stations/${id}`, dto).then(r => r.data);

// Deactivate station by updating its isActive flag
export const deactivateStation = (id) =>
  api.put(`/api/Stations/${id}`, { isActive: false }).then(r => r.data);
