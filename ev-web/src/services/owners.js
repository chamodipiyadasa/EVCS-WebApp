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

/* -------------------- helpers -------------------- */

function extractProblemDetails(err) {
  const pd = err?.response?.data;
  if (!pd) return { message: err?.message || "Request failed", fieldErrors: {} };

  let message =
    pd.error ||
    pd.title ||
    (pd.detail && String(pd.detail)) ||
    (typeof pd === "string" ? pd : "Request failed");

  const fieldErrors = {};
  if (pd.errors && typeof pd.errors === "object") {
    for (const [k, v] of Object.entries(pd.errors)) {
      const arr = Array.isArray(v) ? v : [v];
      fieldErrors[k] = arr.filter(Boolean).map(String);
    }
    if (!pd.error && (!pd.title || /One or more validation errors/i.test(pd.title))) {
      const first = Object.values(fieldErrors)[0];
      if (first?.length) message = first.join(" · ");
    }
  }

  return { message, fieldErrors };
}

/* -------------------- CRUD -------------------- */

// Get all EV owners
export async function listOwners() {
  const { data } = await api.get("/owners", { params: { _t: Date.now() } });
  const owners = Array.isArray(data) ? data : data?.items ?? [];
  return normOwners(owners);
}

// Get owner by NIC
export async function getOwner(nic) {
  const { data } = await api.get(`/owners/${encodeURIComponent(nic)}`);
  return normOwner(data);
}

/**
 * Create new owner  → POST /api/Registration/owner
 * Backend expects a login for the owner, so we send:
 *  - Username (use NIC by default)
 *  - Password (from the form)
 * and the owner profile fields.
 */
export async function createOwner(req) {
  const nic = String(req.nic || "").trim();
  const fullName = String(req.fullName || "").trim();
  const email = String(req.email || "").trim();
  const phone = String(req.phone || "").trim();
  const username = String(req.username || nic).trim();
  const password = String(req.password || "").trim();

  const payload = {
    // owner profile (camel + Pascal just in case)
    nic, Nic: nic,
    fullName, FullName: fullName,
    email, Email: email,
    phone, Phone: phone,

    // login data expected by backend Registration
    username, Username: username,
    password, Password: password,
  };

  try {
    const { data } = await api.post("/Registration/owner", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return normOwner(data);
  } catch (err) {
    const { message, fieldErrors } = extractProblemDetails(err);
    const e = new Error(message || "Create owner failed");
    e.response = err.response;
    e.fieldErrors = fieldErrors;
    throw e;
  }
}

// Update owner details → PUT /owners/{nic}
export async function updateOwner(nic, req) {
  const fullName = String(req.fullName || "").trim();
  const email = String(req.email || "").trim();
  const phone = String(req.phone || "").trim();

  const payload = {
    fullName, FullName: fullName,
    email, Email: email,
    phone, Phone: phone,
  };

  try {
    await api.put(`/owners/${encodeURIComponent(nic)}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const { message, fieldErrors } = extractProblemDetails(err);
    const e = new Error(message || "Update owner failed");
    e.response = err.response;
    e.fieldErrors = fieldErrors;
    throw e;
  }
}

// Deactivate / Reactivate
export async function deactivateOwner(nic) {
  await api.put(`/owners/${encodeURIComponent(nic)}/deactivate`);
}
export async function reactivateOwner(nic) {
  await api.put(`/owners/${encodeURIComponent(nic)}/reactivate`);
}
