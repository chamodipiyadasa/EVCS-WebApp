import { useEffect, useMemo, useState } from "react";
import {
  listOwners,
  deactivateOwner,
  reactivateOwner,
  deleteOwner,
} from "../services/owners";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | inactive

  // view drawer
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  async function loadOwners() {
    try {
      setLoading(true);
      const res = await listOwners();
      setOwners(res);
    } catch (e) {
      console.error("Owners load failed:", e);
      const msg = e?.response?.data?.error || e?.message || "Failed to load owners";
      toast.error(String(msg));
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) toast.error("You are not logged in");
    loadOwners();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (owners || [])
      .filter((o) =>
        status === "all" ? true : status === "active" ? o.active : !o.active
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

  async function handleDelete(nic, fullName) {
    const ok = window.confirm(`Delete owner "${fullName || nic}"?\nThis cannot be undone.`);
    if (!ok) return;
    try {
      await deleteOwner(nic);
      toast.success("Owner deleted");
      // if drawer is showing the same NIC, close it
      if (selected?.nic === nic) setOpenView(false);
      loadOwners();
    } catch (e) {
      const code = e?.response?.status;
      const msg =
        e?.response?.data?.error ||
        (code === 404 ? "Delete not supported by the backend." : e?.message) ||
        "Delete failed";
      toast.error(String(msg));
    }
  }

  function openDetails(o) {
    setSelected(o);
    setOpenView(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">EV Owners</h1>
          <p className="text-slate-500 text-sm">
            Manage owner accounts — view, edit, activate/deactivate, or delete.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="new"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm"
          >
            + Add Owner
          </Link>
          <button
            onClick={loadOwners}
            className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
            title="Reload from server"
          >
            Reload
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip label="All" active={status === "all"} onClick={() => setStatus("all")} />
          <FilterChip label="Active" active={status === "active"} onClick={() => setStatus("active")} />
          <FilterChip label="Inactive" active={status === "inactive"} onClick={() => setStatus("inactive")} />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by NIC, name, email or phone"
            className="flex-1 md:w-96 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => { setQ(""); setStatus("all"); }}
            className="px-3 py-2 rounded-lg border hover:bg-slate-50 text-sm"
            title="Clear filters"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="hidden md:block bg-white border rounded-2xl shadow-sm overflow-hidden">
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
              <tr><td colSpan={6} className="py-10 text-center text-slate-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-500">No owners found.</td></tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.nic} className="border-t hover:bg-slate-50 transition-colors">
                  <Td className="font-medium text-black">{o.nic}</Td>
                  <Td>{o.fullName}</Td>
                  <Td>{o.email || "—"}</Td>
                  <Td>{o.phone || "—"}</Td>
                  <Td>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      o.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {o.active ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td className="text-right pr-4">
                    <div className="inline-flex flex-wrap gap-2">
                      <button
                        onClick={() => openDetails(o)}
                        className="px-3 py-1 rounded-lg border hover:bg-slate-50"
                        title="View"
                      >
                        View
                      </button>
                      <Link
                        to={`${encodeURIComponent(o.nic)}`}
                        className="px-3 py-1 rounded-lg border hover:bg-slate-50"
                        title="Edit"
                      >
                        Edit
                      </Link>
                      {o.active ? (
                        <button
                          onClick={() => handleDeactivate(o.nic)}
                          className="px-3 py-1 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50"
                          title="Deactivate"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(o.nic)}
                          className="px-3 py-1 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          title="Reactivate"
                        >
                          Reactivate
                        </button>
                      )}
                      {/* <button
                        onClick={() => handleDelete(o.nic, o.fullName)}
                        className="px-3 py-1 rounded-lg bg-black text-white hover:bg-black/90"
                        title="Delete"
                      >
                        Delete
                      </button> */}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No owners found.</div>
        ) : (
          filtered.map((o) => (
            <div key={o.nic} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-black">{o.fullName}</div>
                  <div className="text-xs text-slate-500">NIC: {o.nic}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  o.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {o.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                <div>{o.email || "—"}</div>
                <div>{o.phone || "—"}</div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => openDetails(o)}
                  className="flex-1 text-center border rounded-lg px-3 py-2 hover:bg-slate-50"
                >
                  View
                </button>
                <Link
                  to={`${encodeURIComponent(o.nic)}`}
                  className="flex-1 text-center border rounded-lg px-3 py-2 hover:bg-slate-50"
                >
                  Edit
                </Link>
                {o.active ? (
                  <button
                    onClick={() => handleDeactivate(o.nic)}
                    className="flex-1 text-center rounded-lg bg-black text-white px-3 py-2 hover:bg-black/90"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivate(o.nic)}
                    className="flex-1 text-center rounded-lg bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700"
                  >
                    Reactivate
                  </button>
                )}
                {/* <button
                  onClick={() => handleDelete(o.nic, o.fullName)}
                  className="flex-1 text-center rounded-lg border px-3 py-2 hover:bg-slate-50"
                >
                  Delete
                </button> */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ---------- View Drawer ---------- */}
      {openView && selected && (
        <div className="fixed inset-0 z-40" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenView(false)} />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Owner Details</div>
              <button onClick={() => setOpenView(false)} className="px-3 py-1 rounded border">Close</button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-slate-500">NIC</div>
                <div className="col-span-2 font-medium">{selected.nic}</div>

                <div className="text-slate-500">Name</div>
                <div className="col-span-2">{selected.fullName || "—"}</div>

                <div className="text-slate-500">Email</div>
                <div className="col-span-2">{selected.email || "—"}</div>

                <div className="text-slate-500">Phone</div>
                <div className="col-span-2">{selected.phone || "—"}</div>

                <div className="text-slate-500">Status</div>
                <div className="col-span-2">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    selected.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {selected.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <Link
                  to={`${encodeURIComponent(selected.nic)}`}
                  className="px-3 py-2 border rounded-lg hover:bg-slate-50"
                  onClick={() => setOpenView(false)}
                >
                  Edit
                </Link>
                {selected.active ? (
                  <button
                    onClick={() => handleDeactivate(selected.nic)}
                    className="px-3 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivate(selected.nic)}
                    className="px-3 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    Reactivate
                  </button>
                )}
                {/* <button
                  onClick={() => handleDelete(selected.nic, selected.fullName)}
                  className="px-3 py-2 rounded-lg bg-black text-white hover:bg-black/90"
                >
                  Delete
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */
function Th({ children, className = "" }) {
  return <th className={`px-4 py-3 text-left font-medium text-slate-700 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
        active ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
