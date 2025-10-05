

// src/services/users.js
import * as api from "../api/users";

export async function listUsers() {
  try {
    const data = await api.listUsers();
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
    const data = await api.createUser({
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
    await api.updateUser(username, req);
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