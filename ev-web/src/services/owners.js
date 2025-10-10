// src/services/owners.js
import api from "../api/client";

/** Normalize a single owner object (case-insensitive from API) */
function normOwner(o = {}) {
  return {
    nic: o.nic ?? o.Nic ?? "",
    fullName: o.fullName ?? o.FullName ?? "",
    email: o.email ?? o.Email ?? "",
    phone: o.phone ?? o.Phone ?? "",
    active: (o.active ?? o.Active ?? o.isActive ?? o.IsActive) ?? true,
  };
}

/** Normalize list */
function normOwners(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normOwner);
}

/* -------------------- error helper -------------------- */
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
    if (
      !pd.error &&
      (!pd.title || /One or more validation errors/i.test(pd.title))
    ) {
      const first = Object.values(fieldErrors)[0];
      if (first?.length) message = first.join(" · ");
    }
  }

  return { message, fieldErrors };
}

/* -------------------- CRUD -------------------- */

// List owners
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
 * Create new owner
 * Backend controller: POST /api/owners
 * DTO: CreateOwnerRequest { Nic, FullName, Email, Phone, Password }
 */
export async function createOwner(req) {
  const nic = String(req.nic || "").trim();
  const fullName = String(req.fullName || "").trim();
  const email = String(req.email || "").trim();
  const phone = String(req.phone || "").trim();
  const password = String(req.password || "").trim(); // required by API model

  const payload = {
    Nic: nic,
    FullName: fullName,
    Email: email,
    Phone: phone,
    Password: password,
  };

  try {
    const { data } = await api.post("/owners", payload, {
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

/**
 * Update owner
 * PUT /api/owners/{nic}
 * DTO: UpdateOwnerRequest { FullName, Email, Phone, IsActive }
 */
export async function updateOwner(nic, req) {
  const payload = {
    FullName: String(req.fullName || "").trim(),
    Email: String(req.email || "").trim(),
    Phone: String(req.phone || "").trim(),
    IsActive: typeof req.active === "boolean" ? req.active : !!req.IsActive,
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

/* -------------------- Activate / Deactivate via Update -------------------- */

/**
 * Toggle active using the only supported endpoint (PUT /owners/{nic})
 * We must send FullName/Email/Phone as well, so we fetch the current owner first.
 */
async function setOwnerActive(nic, active) {
  const current = await getOwner(nic); // contains fullName, email, phone, active
  await updateOwner(nic, {
    fullName: current.fullName,
    email: current.email,
    phone: current.phone,
    active: Boolean(active),
  });
}

export async function deactivateOwner(nic) {
  await setOwnerActive(nic, false);
}

export async function reactivateOwner(nic) {
  await setOwnerActive(nic, true);
}

// Delete owner (if backend supports it). Falls back cleanly if 404.
export async function deleteOwner(nic) {
  try {
    await api.delete(`/owners/${encodeURIComponent(nic)}`);
  } catch (err) {
    // bubble the original error so UI can show a friendly message
    throw err;
  }
}
