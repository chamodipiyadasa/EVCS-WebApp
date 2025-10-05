
// src/services/operatorAssignments.js
// Frontend-only persistence for Operator ←→ Station assignment, in localStorage.
// Shape: { [stationId]: "operatorUsername" }

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
  return map[stationId] || "";
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
    if (u === operatorUsername) {
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
  // 1) clear old station for this operator (uniqueness guarantee)
  for (const [sid, u] of Object.entries(map)) {
    if (u === operatorUsername) delete map[sid];
  }
  // 2) set new station mapping
  if (stationId && operatorUsername) {
    map[stationId] = operatorUsername;
  }
  writeMap(map);
}

/** Convenience: unassign this operator from whatever station they had */
export function unassignOperator(operatorUsername) {
  clearAssignmentForOperator(operatorUsername);
}