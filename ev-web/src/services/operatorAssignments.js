
// src/services/operatorAssignments.js
// Frontend-only persistence for Operator ←→ Station assignment, in localStorage.
// Shape: { [stationId]: ["operatorUsername", ...] }

const KEY = "evcs_operator_assignments_v1";

function readMap() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function writeMap(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

/** Return a shallow copy of the current map */
export function getAssignments() {
  return { ...readMap() };
}

/** Which operator is assigned to this station? */
export function getAssignedOperator(stationId) {
  const map = readMap();
  const v = map[stationId];
  if (!v) return [];
  return Array.isArray(v) ? [...v] : [v];
}

/** Remove mapping for this station (if any) */
export function clearAssignmentForStation(stationId) {
  const map = readMap();
  if (map[stationId]) {
    delete map[stationId];
    writeMap(map);
  }
}

/** Remove any station currently assigned to this operator (if any) */
export function clearAssignmentForOperator(operatorUsername) {
  if (!operatorUsername) return;
  const map = readMap();
  let changed = false;
  for (const [sid, u] of Object.entries(map)) {
    if (Array.isArray(u)) {
      const idx = u.indexOf(operatorUsername);
      if (idx !== -1) {
        u.splice(idx, 1);
        changed = true;
        if (u.length === 0) delete map[sid];
      }
    } else if (u === operatorUsername) {
      // backwards-compat: single value
      delete map[sid];
      changed = true;
    }
  }
  if (changed) writeMap(map);
}

/**
 * Assign an operator to a station (frontend-only).
 * Ensures the operator is NOT assigned to any other station.
 */
export function assignOperatorToStation(stationId, operatorUsername) {
  const map = readMap();
  if (!stationId || !operatorUsername) {
    writeMap(map);
    return;
  }
  // 1) remove this operator from any other station arrays (uniqueness guarantee)
  for (const [sid, u] of Object.entries(map)) {
    if (Array.isArray(u)) {
      const idx = u.indexOf(operatorUsername);
      if (idx !== -1) {
        u.splice(idx, 1);
        if (u.length === 0) delete map[sid];
      }
    } else if (u === operatorUsername) {
      // backwards-compat: single value
      delete map[sid];
    }
  }

  // 2) add operator to target station array (allow many operators per station)
  const existing = map[stationId];
  if (!existing) {
    map[stationId] = [operatorUsername];
  } else if (Array.isArray(existing)) {
    if (!existing.includes(operatorUsername)) existing.push(operatorUsername);
  } else {
    // backwards-compat: convert single value to array
    if (existing !== operatorUsername) map[stationId] = [existing, operatorUsername];
  }

  writeMap(map);
}

/** Convenience: unassign this operator from whatever station they had */
export function unassignOperator(operatorUsername) {
  clearAssignmentForOperator(operatorUsername);
}