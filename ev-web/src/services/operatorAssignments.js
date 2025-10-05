// src/services/operatorAssignments.js
// New model: map by OPERATOR → STATION (many operators can point to the same station).
// Shape in localStorage: { [operatorUsername]: "stationId" }

const KEY = "evcs_operator_assignments_v2";

/* ---------- storage helpers ---------- */
function readMap() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}
function writeMap(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

/* ---------- public API ---------- */

// Get the whole operator→station map
export function getAssignments() {
  return { ...readMap() };
}

// Get the stationId for a given operator (or "")
export function findStationForOperator(operatorUsername) {
  const map = readMap();
  return map[operatorUsername] || "";
}

// Assign (or reassign) an operator to a station. Pass "" to unassign.
export function setOperatorStation(operatorUsername, stationId) {
  if (!operatorUsername) return;
  const map = readMap();
  if (!stationId) delete map[operatorUsername];       // unassign
  else map[operatorUsername] = stationId;             // (re)assign
  writeMap(map);
}

// Unassign an operator from any station
export function unassignOperator(operatorUsername) {
  setOperatorStation(operatorUsername, "");
}

// Return an array of operators for a station
export function findOperatorsForStation(stationId) {
  if (!stationId) return [];
  const map = readMap();
  return Object.keys(map).filter(op => map[op] === stationId);
}

// Danger: wipe all local assignments (useful if you used the old format)
export function resetAllAssignments() {
  writeMap({});
}
