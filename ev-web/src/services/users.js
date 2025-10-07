// src/services/users.js
import api from "../api/client";

export async function listUsers() {
  try {
    const { data } = await api.get("/users");
    return data; // [{ id, username, role, isActive }]
  } catch (err) {
    // Bubble up the server's message so UI can display it
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.title ||
      err?.response?.data?.detail ||
      err?.message ||
      "Unknown error";
    const e = new Error(String(msg));
    e.httpStatus = err?.response?.status;
    e.raw = err;
    throw e;
  }
}

export async function createUser({ username, password, role, isActive = true }) {
  try {
    const { data } = await api.post("/users", {
      username,
      password,
      role,
      isActive,
    });
    return data;
  } catch (err) {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.title ||
      err?.response?.data?.detail ||
      err?.message ||
      "Unknown error";
    const e = new Error(String(msg));
    e.httpStatus = err?.response?.status;
    e.raw = err;
    throw e;
  }
}

export async function updateUser(username, req) {
  try {
    await api.put(`/users/${encodeURIComponent(username)}`, req);
  } catch (err) {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.title ||
      err?.response?.data?.detail ||
      err?.message ||
      "Unknown error";
    const e = new Error(String(msg));
    e.httpStatus = err?.response?.status;
    e.raw = err;
    throw e;
  }
}

export async function assignStation(username, stationId) {
  const { data } = await api.post(`/users/${username}/assign/${stationId}`);
  return data;
}

export async function unassignStation(username) {
  const { data } = await api.post(`/users/${username}/unassign`);
  return data;
}

// Current logged-in user (resolved by JWT)
export async function getMe() {
  const { data } = await api.get("/users/me");
  return data; // { id, username, role, isActive, assignedStationId }
}
