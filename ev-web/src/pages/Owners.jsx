// src/pages/Owners.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listOwners,
  deactivateOwner,
  reactivateOwner,
} from "../services/owners";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | inactive

  async function loadOwners() {
    try {
      setLoading(true);
      const res = await listOwners();
      setOwners(res);
    } catch (e) {
      console.error("Owners load failed:", e);
      // Show the actual server message if present
      const msg = e?.response?.data?.error || e?.message || "Failed to load owners";
      toast.error(String(msg));
      setOwners([]); // show empty state but with a reload button
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // quick auth sanity check — if token missing, backend will 401
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      toast.error("You are not logged in");
    }
    loadOwners();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (owners || [])
      .filter((o) =>
        status === "all"
          ? true
          : status === "active"
          ? o.active
          : !o.active
      )
      .filter((o) =>
        !needle
          ? true
          : (o.nic || "").toLowerCase().includes(needle) ||
            (o.fullName || "").toLowerCase().includes(needle) ||
            (o.email || "").toLowerCase().includes(needle) ||
            (o.phone || "").toLowerCase().includes(needle)
      );
  }, [owners, q, status]);

  async function handleDeactivate(nic) {
    try {
      await deactivateOwner(nic);
      toast.success("Owner deactivated");
      loadOwners();
    } catch (e) {
      const msg = e?.response?.data?.error || "Deactivation failed";
      toast.error(String(msg));
    }
  }

  async function handleReactivate(nic) {
    try {
      await reactivateOwner(nic);
      toast.success("Owner reactivated");
      loadOwners();
    } catch (e) {
      const msg = e?.response?.data?.error || "Reactivation failed";
      toast.error(String(msg));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">EV Owners</h1>
          <p className="text-slate-500 text-sm">
            Create, update, deactivate, and reactivate owners (NIC is the primary key).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Owner
          </Link>
          <button
            onClick={loadOwners}
            className="border px-4 py-2 rounded hover:bg-slate-50"
            title="Reload from server"
          >
            Reload
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border rounded-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <FilterChip label="All" active={status === "all"} onClick={() => setStatus("all")} />
          <FilterChip label="Active" active={status === "active"} onClick={() => setStatus("active")} />
          <FilterChip label="Inactive" active={status === "inactive"} onClick={() => setStatus("inactive")} />
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by NIC / name / email / phone"
            className="w-full md:w-96 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              setQ("");
              setStatus("all");
            }}
            className="px-3 py-2 rounded-lg border hover:bg-slate-50"
            title="Clear filters"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>NIC</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th className="text-right pr-4">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500">
                  No owners found.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.nic} className="border-t hover:bg-slate-50">
                  <Td className="font-medium">{o.nic}</Td>
                  <Td>{o.fullName}</Td>
                  <Td>{o.email}</Td>
                  <Td>{o.phone}</Td>
                  <Td>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        o.active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {o.active ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td className="text-right pr-4">
                    <div className="inline-flex gap-2">
                      <Link
                        to={`${encodeURIComponent(o.nic)}`}
                        className="px-3 py-1 rounded border hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      {o.active ? (
                        <button
                          onClick={() => handleDeactivate(o.nic)}
                          className="px-3 py-1 rounded border text-rose-700 border-rose-300 hover:bg-rose-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(o.nic)}
                          className="px-3 py-1 rounded border text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* UI bits */
function Th({ children, className = "" }) {
  return <th className={`px-4 py-3 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-sm ${
        active ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 hover:bg-slate-50 text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}
