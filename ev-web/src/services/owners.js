// src/services/owners.js
import api from "../api/client";

/** Normalize a single owner object coming from API (case-insensitive fields) */
function normOwner(o = {}) {
  return {
    nic: o.nic ?? o.Nic ?? "",
    fullName: o.fullName ?? o.FullName ?? "",
    email: o.email ?? o.Email ?? "",
    phone: o.phone ?? o.Phone ?? "",
    active: (o.active ?? o.Active ?? o.isActive ?? o.IsActive) ?? true,
  };
}

/** Normalize an array (or fallback to empty) */
function normOwners(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normOwner);
}

// ✅ Get all EV owners
export async function listOwners() {
  const { data } = await api.get("/owners", {
    // cache buster helps during dev when proxies cache
    params: { _t: Date.now() },
  });
  // normalize casing/shape
  const owners = Array.isArray(data) ? data : data?.items ?? [];
  return normOwners(owners);
}

// ✅ Get owner by NIC
export async function getOwner(nic) {
  const { data } = await api.get(`/owners/${encodeURIComponent(nic)}`);
  return normOwner(data);
}

// ✅ Create new owner
export async function createOwner(req) {
  // ensure required fields exist
  const payload = {
    nic: req.nic,
    fullName: req.fullName ?? "",
    email: req.email ?? "",
    phone: req.phone ?? "",
  };
  const { data } = await api.post("/owners", payload);
  return normOwner(data);
}

// ✅ Update owner details
export async function updateOwner(nic, req) {
  const payload = {
    fullName: req.fullName ?? "",
    email: req.email ?? "",
    phone: req.phone ?? "",
  };
  await api.put(`/owners/${encodeURIComponent(nic)}`, payload);
}

// ✅ Deactivate owner
export async function deactivateOwner(nic) {
  await api.put(`/owners/${encodeURIComponent(nic)}/deactivate`);
}

// ✅ Reactivate owner
export async function reactivateOwner(nic) {
  await api.put(`/owners/${encodeURIComponent(nic)}/reactivate`);
}
