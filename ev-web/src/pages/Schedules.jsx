import { useEffect, useMemo, useState } from "react";
import { listStations } from "../services/stations";
import { getSchedule, upsertSchedule } from "../services/schedules";
import toast from "react-hot-toast";

/* Pretty ID + helpers */
function hashCode(str){let h=0;for(let i=0;i<str.length;i++){h=(h<<5)-h+str.charCodeAt(i);h|=0;}return Math.abs(h);}
function prettyId(prefix, raw, w=3){if(!raw) return `${prefix}${"".padStart(w,"0")}`;const n=(hashCode(String(raw))%1000)+1;return `${prefix}${String(n).padStart(w,"0")}`;}
const two = n => String(n).padStart(2,"0");
const toHms = hm => (hm?.length===5 ? hm+":00" : hm || "");
const fromAnyToHm = (v)=>{
  if (typeof v === "string") {
    const m = v.match(/^(\d{2}):(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;
  }
  if (v && typeof v === "object") {
    const h = v.hours ?? v.Hours ?? v.hour ?? v.Hour;
    const m = v.minutes ?? v.Minutes ?? v.minute ?? v.Minute;
    if (Number.isFinite(h) && Number.isFinite(m)) return `${two(h)}:${two(m)}`;
  }
  return "";
};
function normalizeSlots(resp){
  if (!resp) return [];
  const obj = Array.isArray(resp) ? (resp[0] ?? null) : resp;
  if (!obj) return [];
  const arr = obj.slots ?? obj.Slots ?? [];
  return (Array.isArray(arr) ? arr : [])
    .map(s => ({
      start: fromAnyToHm(s.start ?? s.Start),
      end: fromAnyToHm(s.end ?? s.End),
      capacity: Number(s.capacity ?? s.Capacity ?? 1),
      available: (s.available ?? s.Available) !== false,
    }))
    .filter(s => s.start && s.end)
    .sort((a,b)=> a.start.localeCompare(b.start));
}
const fmtDate = (d) => d.toISOString().slice(0,10);
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate()+n);
const shortDow = (d) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];

export default function Schedules(){
  const today = new Date().toISOString().slice(0,10);

  const [stations,setStations] = useState([]);
  const [stationId,setStationId] = useState(localStorage.getItem("sch_stationId") || "");
  const [date,setDate] = useState(localStorage.getItem("sch_date") || today);
  const [slots,setSlots] = useState([]);
  const [draft,setDraft] = useState({ start:"", end:"", capacity:1, available:true, editIndex:-1 });
  const [loading,setLoading] = useState(false);
  const [overview,setOverview] = useState([]);
  const [month,setMonth] = useState(new Date());

  // load stations
  useEffect(()=>{
    (async ()=>{
      const s = await listStations().catch(()=>[]);
      setStations(s || []);
      if (!stationId && s.length) setStationId(s[0].id);
    })();
  }, []);

  // persist selection
  useEffect(()=>{
    if (stationId) localStorage.setItem("sch_stationId", stationId);
    if (date) localStorage.setItem("sch_date", date);
  },[stationId, date]);

  // load schedule for the selected date
  useEffect(()=>{
    if (!stationId || !date){ setSlots([]); return; }
    (async ()=>{
      setLoading(true);
      try {
        const resp = await getSchedule(stationId, date);
        setSlots(normalizeSlots(resp));
      } finally { setLoading(false); }
    })();
  },[stationId,date]);

  // load 30-day overview for the small calendar
  useEffect(()=>{
    if (!stationId){ setOverview([]); return; }
    (async ()=>{
      const start = new Date();
      const days = Array.from({length:30},(_,i)=>addDays(start,i));
      const tasks = days.map(d=>getSchedule(stationId,fmtDate(d)).catch(()=>null));
      const results = await Promise.all(tasks);
      const data = results.map((r,i)=>({
        date: fmtDate(days[i]),
        count: normalizeSlots(r).length,
      }));
      setOverview(data);
    })();
  },[stationId]);

  const stationLabel = useMemo(()=>{
    const s = stations.find(x=>x.id===stationId);
    return s ? `${prettyId("STATION", s.id)} — ${s.name}` : "—";
  },[stations,stationId]);

  function addOrUpdateSlot(){
    const {start,end,capacity,available,editIndex} = draft;
    if(!start||!end) return toast.error("Start & End required");
    if(start>=end) return toast.error("End must be after Start");
    const overlaps = slots.some((s,i)=>i!==editIndex && !(end<=s.start||start>=s.end));
    if(overlaps) return toast.error("Time overlaps existing slot");
    const upd = {start,end,capacity:+capacity||1,available:!!available};
    if(editIndex>=0){
      const copy=[...slots];copy[editIndex]=upd;setSlots(copy);
    }else setSlots([...slots,upd].sort((a,b)=>a.start.localeCompare(b.start)));
    setDraft({start:"",end:"",capacity:1,available:true,editIndex:-1});
  }
  async function saveSchedule(){
    if(!stationId||!date) return toast.error("Pick station & date");
    try{
      await upsertSchedule({stationId,date,slots});
      toast.success("Schedule saved");
    }catch(e){
      console.error(e);toast.error(e?.response?.data?.error||"Failed to save");
    }
  }

  // --- Small calendar grid ---
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const monthDays = Array.from({length:daysInMonth},(_,i)=>new Date(month.getFullYear(),month.getMonth(),i+1));
  const overviewMap = useMemo(()=>{
    const map={}; overview.forEach(o=>map[o.date]=o.count); return map;
  },[overview]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Station Schedules</h1>
          <p className="text-slate-500 text-sm">Manage available time slots and view schedule overview</p>
        </div>
        <button onClick={saveSchedule} className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700">💾 Save</button>
      </div>

      {/* Station + date selectors */}
      <div className="bg-white border rounded-xl p-4 grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="text-sm text-slate-600">Station</label>
          <select className="border rounded px-3 py-2 w-full" value={stationId} onChange={e=>setStationId(e.target.value)}>
            {stations.map(s=>(
              <option key={s.id} value={s.id}>{prettyId("STATION",s.id)} — {s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Date</label>
          <input type="date" className="border rounded px-3 py-2 w-full" value={date} onChange={e=>setDate(e.target.value)}/>
        </div>
      </div>

      {/* 7-Day Quick Overview */}
      <div className="bg-white border rounded-xl p-3 overflow-x-auto">
        <div className="font-medium mb-2">Upcoming 7 days</div>
        <div className="flex gap-2">
          {overview.slice(0,7).map(d=>{
            const day=new Date(d.date);const active=d.date===date;
            return(
              <button key={d.date}
                onClick={()=>setDate(d.date)}
                className={`px-3 py-2 rounded-lg border text-sm ${active?'bg-blue-600 text-white border-blue-600':d.count>0?'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100':'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                <div className="font-medium">{shortDow(day)} {two(day.getDate())}</div>
                <div className="text-xs">{d.count} slot{d.count!==1?"s":""}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📅 Compact Monthly Calendar */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded">←</button>
          <div className="font-medium">{month.toLocaleString("default",{month:"long",year:"numeric"})}</div>
          <button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded">→</button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {monthDays.map((d)=>{
            const dateStr=fmtDate(d);
            const cnt=overviewMap[dateStr]||0;
            const isActive=date===dateStr;
            return(
              <button key={dateStr}
                onClick={()=>setDate(dateStr)}
                className={`py-2 rounded text-sm transition ${
                  isActive?"bg-blue-600 text-white":
                  cnt>0?"bg-emerald-50 text-emerald-700 hover:bg-emerald-100":"hover:bg-slate-50 text-slate-700"
                }`}>
                <div className="font-medium">{d.getDate()}</div>
                <div className="text-[10px]">{cnt>0?`${cnt} slot${cnt>1?"s":""}`:""}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots for selected day */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div className="font-medium">{stationLabel} — <span className="text-slate-500">{date}</span></div>
          <div className="text-sm text-slate-500">{slots.length} slot{slots.length!==1?"s":""}</div>
        </div>
        {loading?(
          <div className="text-slate-500 text-sm mt-3">Loading…</div>
        ):slots.length===0?(
          <div className="text-slate-500 text-sm mt-3">No slots saved for this day.</div>
        ):(
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr><Th>#</Th><Th>Start</Th><Th>End</Th><Th>Cap</Th><Th>Avail</Th></tr></thead>
              <tbody>{slots.map((s,i)=>(
                <tr key={i} className="border-t"><Td>{i+1}</Td><Td>{s.start}</Td><Td>{s.end}</Td><Td>{s.capacity}</Td>
                  <Td>{s.available?"✅":"❌"}</Td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add slot */}
      <div className="bg-white border rounded-xl p-4">
        <div className="font-medium mb-3">Add / Edit slot</div>
        <div className="grid sm:grid-cols-5 gap-3">
          <input type="time" className="border rounded px-3 py-2" value={draft.start} onChange={e=>setDraft({...draft,start:e.target.value})}/>
          <input type="time" className="border rounded px-3 py-2" value={draft.end} onChange={e=>setDraft({...draft,end:e.target.value})}/>
          <input type="number" min={1} className="border rounded px-3 py-2" value={draft.capacity} onChange={e=>setDraft({...draft,capacity:e.target.value})}/>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={draft.available} onChange={e=>setDraft({...draft,available:e.target.checked})}/>Avail</label>
          <button onClick={addOrUpdateSlot} className="bg-emerald-600 text-white rounded px-4 py-2 hover:bg-emerald-700">{draft.editIndex>=0?"Update":"Add"}</button>
        </div>
      </div>
    </div>
  );
}

function Th({children}){return <th className="px-3 py-2 text-left font-medium">{children}</th>;}
function Td({children}){return <td className="px-3 py-2">{children}</td>;}
