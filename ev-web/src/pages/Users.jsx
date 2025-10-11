// src/pages/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  listUsers, createUser, assignStation, unassignStation, updateUser,
} from "../services/users";
import { listStations } from "../services/stations";
import { listOwners, deactivateOwner, reactivateOwner } from "../services/owners";

/* small helpers */
const hashCode = (s) => { let h = 0; for (let i=0;i<s.length;i++){ h=(h<<5)-h+s.charCodeAt(i); h|=0;} return Math.abs(h); };
const prettyId = (p, raw, w=3) => `${p}${String(((hashCode(String(raw))%1000)+1)).padStart(w,"0")}`;
const badgeCls = (b) => b ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                           : "bg-rose-100 text-rose-700 border-rose-200";

/* -------- component -------- */
export default function Users() {
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [toggling, setToggling] = useState(null);

  const [form, setForm] = useState({ username:"", password:"", role:"Operator", stationId:"", isActive:true });

  // view drawer
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  const stationsMap = useMemo(() => Object.fromEntries((stations||[]).map(s=>[s.id,s])), [stations]);
  const stationLabel = (id) => id ? (stationsMap[id] ? `${prettyId("STATION", id)} — ${stationsMap[id].name}` : String(id).slice(0,10)) : "—";

  const backoffices = useMemo(() => (users||[]).filter(u=>u.role==="Backoffice"), [users]);
  const operators  = useMemo(() => (users||[]).filter(u=>u.role==="Operator"), [users]);

  async function refresh() {
    try {
      setLoading(true);
      const [u,s,o] = await Promise.all([listUsers().catch(()=>[]), listStations().catch(()=>[]), listOwners().catch(()=>[])]);
      setUsers(u||[]); setStations(s||[]); setOwners(o||[]);
    } catch {
      toast.error("Failed to load data");
      setUsers([]); setStations([]); setOwners([]);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ refresh(); }, []);

  async function onCreate(e){
    e.preventDefault();
    const { username, password, role, stationId, isActive } = form;
    if (!username.trim() || !password.trim()) return toast.error("Username and password required");
    try {
      setSavingUser(true);
      await createUser({
        username: username.trim(),
        password, role,
        isActive: !!isActive,
        assignedStationId: role==="Operator" ? (stationId||null) : null,
      });
      toast.success(`${role} ${username} created`);
      setForm({ username:"", password:"", role:"Operator", stationId:"", isActive:true });
      refresh();
    } catch { toast.error("Create failed"); }
    finally { setSavingUser(false); }
  }

  async function toggleActive(u){
    try {
      setToggling(u.username);
      const next = !u.isActive;
      setUsers(prev=>prev.map(x=> (x.username===u.username? {...x,isActive:next}:x)));
      await updateUser(u.username, { role:u.role, isActive:next, assignedStationId:u.assignedStationId??null, password:"" });
      toast.success(`${u.username} is now ${next?"Active":"Inactive"}`);
    } catch { toast.error("Failed to update status"); refresh(); }
    finally { setToggling(null); }
  }

  async function handleAssign(u, nextStationId){
    const prev = users;
    setAssigning(u.username);
    setUsers(prev=>prev.map(x=> x.username===u.username ? {...x, assignedStationId:(nextStationId||"")} : x));
    try {
      if (!nextStationId){ await unassignStation(u.username); toast.success(`Unassigned ${u.username}`); }
      else { await assignStation(u.username, nextStationId); toast.success(`Assigned ${u.username} to ${stationsMap[nextStationId]?.name||prettyId("STATION",nextStationId)}`); }
    } catch {
      toast.error("Assignment failed"); setUsers(prev);
    } finally { setAssigning(null); }
  }

  // optional owners quick actions (kept short)
  async function onOwnerDeactivate(nic){ try{ await deactivateOwner(nic); toast.success("Owner deactivated"); refresh(); } catch{ toast.error("Failed to deactivate"); } }
  async function onOwnerReactivate(nic){ try{ await reactivateOwner(nic); toast.success("Owner reactivated"); refresh(); } catch{ toast.error("Failed to reactivate"); } }

  const RowActions = ({ u }) => (
    <div className="flex justify-end gap-2">
      <button onClick={()=>{ setSelected(u); setOpenView(true); }} className="px-3 py-1 rounded-lg border hover:bg-slate-50">View</button>
      <Link to={`/app/users/${encodeURIComponent(u.username)}`} className="px-3 py-1 rounded-lg border hover:bg-slate-50">Edit</Link>
      <button
        disabled={toggling===u.username}
        onClick={()=>toggleActive(u)}
        className={`px-3 py-1 rounded-lg text-white ${u.isActive?"bg-black/80 hover:bg-black":"bg-emerald-600 hover:bg-emerald-700"}`}
      >
        {toggling===u.username ? "Saving…" : (u.isActive ? "Deactivate" : "Activate")}
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Administration</div>
          <h1 className="text-2xl font-bold text-black">Users & Roles</h1>
        </div>
        <button onClick={refresh} className="px-3 py-2 rounded-lg border hover:bg-slate-50">Reload</button>
      </div>

      {/* Create user */}
      <form onSubmit={onCreate} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-black">Add New System User</div>
          <div className="text-xs text-slate-500">Operators can be assigned to a station</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="border rounded-lg px-3 py-2" placeholder="Username" value={form.username} onChange={(e)=>setForm(f=>({...f,username:e.target.value}))}/>
          <input className="border rounded-lg px-3 py-2" type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm(f=>({...f,password:e.target.value}))}/>
          <select className="border rounded-lg px-3 py-2" value={form.role} onChange={(e)=>setForm(f=>({...f,role:e.target.value,stationId:""}))}>
            <option value="Operator">Operator</option><option value="Backoffice">Backoffice</option>
          </select>
          {form.role==="Operator" ? (
            <select className="border rounded-lg px-3 py-2" value={form.stationId} onChange={(e)=>setForm(f=>({...f,stationId:e.target.value}))}>
              <option value="">Assign to Station…</option>
              {(stations||[]).map(s=> <option key={s.id} value={s.id}>{prettyId("STATION",s.id)} — {s.name}</option>)}
            </select>
          ) : <div className="border rounded-lg px-3 py-2 text-slate-400">Not applicable</div>}
          <label className="inline-flex items-center gap-2 border rounded-lg px-3 py-2">
            <input type="checkbox" checked={form.isActive} onChange={(e)=>setForm(f=>({...f,isActive:!!e.target.checked}))}/>
            <span className="text-sm text-slate-700">Active</span>
          </label>
        </div>
        <div className="flex items-center justify-end">
          <button disabled={savingUser} className={`px-4 py-2 rounded-lg text-white ${savingUser?"bg-emerald-300":"bg-emerald-600 hover:bg-emerald-700"}`}>
            {savingUser ? "Creating…" : "Create User"}
          </button>
        </div>
      </form>

      {/* Backoffice table */}
      <Section title={`Backoffice Users · ${backoffices.length}`}>
        <Table
          loading={loading}
          headers={["Username","Status","Actions"]}
          rows={backoffices.map(u => ({
            key: u.id||u.username,
            cells: [
              <div><div className="font-medium text-black">{u.username}</div><div className="text-xs text-slate-500">{u.id?prettyId("USER",u.id):""}</div></div>,
              <span className={`px-2 py-1 text-xs rounded-full border ${badgeCls(!!u.isActive)}`}>{u.isActive?"Active":"Inactive"}</span>,
              <RowActions u={u}/>
            ]
          }))}
        />
      </Section>

      {/* Operators table */}
      <Section title={`Operators · ${operators.length}`}>
        <Table
          loading={loading}
          headers={["Username","Status","Assigned Station","Assign / Unassign"]}
          rows={operators.map(u => ({
            key: u.id||u.username,
            cells: [
              <div><div className="font-medium text-black">{u.username}</div><div className="text-xs text-slate-500">{u.id?prettyId("USER",u.id):""}</div></div>,
              <span className={`px-2 py-1 text-xs rounded-full border ${badgeCls(!!u.isActive)}`}>{u.isActive?"Active":"Inactive"}</span>,
              <div className="font-medium">{stationLabel(u.assignedStationId)}</div>,
              <div className="flex items-center justify-end gap-2">
                <select
                  disabled={assigning===u.username}
                  className="border rounded-lg px-3 py-1.5 min-w-[240px]"
                  value={u.assignedStationId || ""}
                  onChange={(e)=>handleAssign(u, e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {(stations||[]).map(s => <option key={s.id} value={s.id}>{prettyId("STATION",s.id)} — {s.name}</option>)}
                </select>
                <Link to={`/app/users/${encodeURIComponent(u.username)}`} className="px-3 py-1 rounded-lg border hover:bg-slate-50">Edit</Link>
                <button
                  disabled={toggling===u.username}
                  onClick={()=>toggleActive(u)}
                  className={`px-3 py-1 rounded-lg text-white ${u.isActive?"bg-black/80 hover:bg-black":"bg-emerald-600 hover:bg-emerald-700"}`}
                >
                  {toggling===u.username ? "Saving…" : (u.isActive ? "Deactivate" : "Activate")}
                </button>
              </div>
            ]
          }))}
        />
      </Section>

      {/* View Drawer */}
      {openView && selected && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setOpenView(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl p-5 overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">User Details</div>
              <button onClick={()=>setOpenView(false)} className="px-3 py-1 rounded border">Close</button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <Row k="Username" v={selected.username}/>
              <Row k="Role" v={selected.role}/>
              <Row k="Status" v={<span className={`px-2 py-1 text-xs rounded-full border ${badgeCls(!!selected.isActive)}`}>{selected.isActive?"Active":"Inactive"}</span>} />
              {selected.role==="Operator" && <Row k="Assigned Station" v={stationLabel(selected.assignedStationId)} />}
              <div className="pt-3 flex gap-2 justify-end">
                <Link to={`/app/users/${encodeURIComponent(selected.username)}`} className="px-3 py-2 border rounded-lg hover:bg-slate-50" onClick={()=>setOpenView(false)}>Edit</Link>
                <button onClick={()=>toggleActive(selected)} className={`px-3 py-2 rounded-lg text-white ${selected.isActive?"bg-black/80 hover:bg-black":"bg-emerald-600 hover:bg-emerald-700"}`}>
                  {selected.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-center text-slate-500 py-6">Loading…</div>}
    </div>
  );
}

/* small UI bits (compact) */
function Section({ title, children }) {
  return (
    <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="border-b px-5 py-3 font-semibold text-black">{title}</div>
      {children}
    </section>
  );
}
function Table({ loading, headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>{headers.map((h,i)=><th key={i} className={`px-4 py-2 ${i===headers.length-1?"text-right": i===1?"text-center":""}`}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={headers.length} className="py-10 text-center text-slate-500">Loading…</td></tr>
          ) : rows.length===0 ? (
            <tr><td colSpan={headers.length} className="py-10 text-center text-slate-500">No data</td></tr>
          ) : (
            rows.map(r=>(
              <tr key={r.key} className="border-top border-t">{r.cells.map((c,i)=>
                <td key={i} className={`px-4 py-2 ${i===headers.length-1?"text-right": i===1?"text-center":""}`}>{c}</td>
              )}</tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-slate-500">{k}</div>
      <div className="col-span-2 font-medium break-all">{v ?? "—"}</div>
    </div>
  );
}
