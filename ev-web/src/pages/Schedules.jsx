import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { listStations, getStation } from "../services/stations";
import { getSchedule, upsertSchedule } from "../services/schedules";
import { listBookingsByStationDate } from "../services/bookings";

/* -------- small helpers -------- */
const H24 = Array.from({ length: 24 }, (_, h) => h);
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (iso, n) => { const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };
const fmtDayTab = (iso) => { const d=new Date(iso), isToday=iso===todayISO(); return {label:isToday?"Today":d.toLocaleDateString(undefined,{weekday:"short"}), sub:d.toLocaleDateString(undefined,{month:"short"})+" "+d.getDate()}; };
const hhmm = (h) => `${String(h).padStart(2,"0")}:00`;
const hourRange = (h) => [h*60, h*60+60];
const overlaps = (as,ae,bs,be)=>as<be && bs<ae;
const toMinutes = (t)=>{ if(t==null) return 0; if(typeof t==="object"){return (t.hour??0)*60+(t.minute??0)+(t.second??0)/60}
 if(typeof t==="number"){const ms=t>86400000?t%86400000:t; return Math.max(0,Math.min(1440,Math.floor(ms/60000)))} const [h="0",m="0",s="0"]=String(t).split(":"); return +h*60+ +m+ +s/60; };
const normalizeTime = (v,f="00:00:00")=>{ if(!v) return f; const p=String(v).split(":").map(x=>x.padStart(2,"0")); return p.length===1?`${p[0]}:00:00`:p.length===2?`${p[0]}:${p[1]}:00`:`${p[0]}:${p[1]}:${p[2]}`; };
const slotKey = (s,i)=>`${s?.start??"S"}_${s?.end??"E"}_${s?.capacity??"C"}_${s?.available!==false?"A":"M"}_${i}`;
const makeSlot=(sh=9,eh=10,cap=1,avail=true)=>({start:`${String(sh).padStart(2,"0")}:00:00`,end:`${String(eh).padStart(2,"0")}:00:00`,capacity:cap,available:avail});

/* -------- tiny UI bits -------- */
const Btn = ({ variant="solid", tone="emerald", className="", ...p }) => {
  const base="px-3 py-2 rounded-lg text-sm font-medium transition";
  const map = {
    solid: { emerald:"bg-emerald-600 hover:bg-emerald-700 text-white", black:"bg-black hover:bg-black/90 text-white", slate:"bg-slate-800 hover:bg-slate-900 text-white" },
    outline:{ slate:"border border-slate-300 text-slate-700 hover:bg-slate-50" },
    subtle:{ slate:"bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200"}
  };
  return <button className={`${base} ${map[variant]?.[tone]||map.solid.emerald} ${className}`} {...p} />;
};
const ChipTab = ({active,children,onClick})=>(
  <button onClick={onClick}
    className={`px-4 py-3 rounded-xl border transition ${active?"bg-emerald-600 text-white border-emerald-600":"bg-white text-slate-700 hover:bg-slate-50 border-slate-200"}`}>
    {children}
  </button>
);

/* ================== Component ================== */
export default function Schedules() {
  const [stations,setStations]=useState([]); const [stationId,setStationId]=useState(""); const [stationMeta,setStationMeta]=useState(null);
  const [baseDate,setBaseDate]=useState(todayISO()); const days=useMemo(()=>Array.from({length:7},(_,i)=>addDaysISO(baseDate,i)),[baseDate]); const [dayIndex,setDayIndex]=useState(0); const date=days[dayIndex];
  const [slots,setSlots]=useState([]); const [bookings,setBookings]=useState([]); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
  const [newWin,setNewWin]=useState({start:"09:00",end:"10:00",capacity:1,maintenance:false});

  /* load stations once */
  useEffect(()=>{ let off=false;(async()=>{
    try{ setLoading(true); const ss=await listStations().catch(()=>[]); if(off) return; setStations(ss||[]); if(ss?.length&&!stationId) setStationId(ss[0].id);}
    finally{ if(!off) setLoading(false);}
  })(); return ()=>{off=true}; },[]);

  /* station meta */
  useEffect(()=>{ let off=false;(async()=>{
    if(!stationId) return; const meta=await getStation(stationId).catch(()=>null); if(!off) setStationMeta(meta);
  })(); return ()=>{off=true};},[stationId]);

  /* schedule+bookings per day */
  useEffect(()=>{ let off=false;(async()=>{
    if(!stationId||!date) return;
    try{ setLoading(true);
      const [s,bs]=await Promise.all([getSchedule(stationId,date),listBookingsByStationDate(stationId,date).catch(()=>[])]);
      if(off) return; setSlots(s?.slots||[]); setBookings(bs||[]);
    } finally{ if(!off) setLoading(false); }
  })(); return ()=>{off=true};},[stationId,date]);

  const maxCols=Math.max(1,Number(stationMeta?.slots||1));

  /* editor actions */
  function addWindow(){ const last=slots[slots.length-1]; let sh=9,eh=10; if(last){ const h=parseInt(String(last.end).split(":")[0]||"10",10); sh=Math.min(23,h); eh=Math.min(24,h+1);} setSlots(p=>[...p,makeSlot(sh,eh,Math.min(maxCols,1),true)]); }
  function addWindowManual(){
    const start=normalizeTime(newWin.start), end=normalizeTime(newWin.end), capacity=Math.max(0,Math.min(maxCols,Number(newWin.capacity||0))), available=!newWin.maintenance;
    if(toMinutes(end)<=toMinutes(start)) return toast.error("End must be after Start");
    setSlots(p=>[...p,{start,end,capacity,available}].sort((a,b)=>toMinutes(a.start)-toMinutes(b.start)));
  }
  const updateSlot=(i,patch)=>setSlots(p=>p.map((s,idx)=>idx===i?{...s,...patch}:s));
  const removeSlot=(i)=>setSlots(p=>p.filter((_,idx)=>idx!==i));
  const duplicateSlot=(i)=>setSlots(p=>{const b=p[i]; return b?[...p,{...b}]:p;});

  async function save(){
    if(!stationId) return toast.error("Choose a station first");
    for(const s of slots){ const c=Number(s.capacity||0); if(c<0) return toast.error("Capacity cannot be negative"); if(c>maxCols) return toast.error(`Capacity (${c}) cannot exceed station slots (${maxCols})`);}
    const sorted=[...slots].map(s=>({ ...s, start:normalizeTime(s.start), end:normalizeTime(s.end)})).sort((a,b)=>toMinutes(a.start)-toMinutes(b.start));
    for(const w of sorted){ if(toMinutes(w.end)<=toMinutes(w.start)) return toast.error("Each window's end time must be after its start time"); }
    try{ setSaving(true); await upsertSchedule({stationId,date,slots:sorted}); toast.success("Schedule saved"); const bs=await listBookingsByStationDate(stationId,date).catch(()=>[]); setBookings(bs||[]); setSlots(sorted);}
    catch(e){ const msg=e?.response?.data?.error||e?.response?.data||e.message; toast.error(String(msg||"Save failed")); }
    finally{ setSaving(false); }
  }

  /* Quick view data */
  const hourRows=useMemo(()=>H24.map(h=>{
    const [hs,he]=hourRange(h);
    const overlapping=(slots||[]).filter(s=>overlaps(toMinutes(s.start),toMinutes(s.end),hs,he));
    const maintenance=overlapping.some(s=>s.available===false);
    const cap=overlapping.filter(s=>s.available!==false).reduce((sum,s)=>sum+Math.max(0,Number(s.capacity||0)),0);
    const capacity=Math.min(maxCols,Math.max(0,cap));
    const booked=maintenance?0:(bookings||[]).reduce((acc,b)=>acc+(overlaps(hs,he,toMinutes(b.start),toMinutes(b.end))?1:0),0);
    const available=maintenance?0:Math.max(0,capacity-booked);
    return {h,label:hhmm(h),capacity,booked,available,maintenance};
  }),[slots,bookings,maxCols]);

  /* -------- render -------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Schedules</div>
          <h1 className="text-2xl font-bold text-black">Publish & Quick View</h1>
          <p className="text-sm text-slate-600 mt-1">
            Add <b>manual windows</b>. Quick View shows booked vs available per hour; marked red during maintenance.
          </p>
        </div>
        {stationMeta && (
          <div className="text-sm text-slate-600">
            Capacity: <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{stationMeta.slots} vehicles</span>
          </div>
        )}
      </div>

      {/* Station & Date */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-auto">
            <label className="text-xs text-slate-500">Station</label>
            <select className="mt-1 w-full md:w-[320px] border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
              value={stationId} onChange={(e)=>setStationId(e.target.value)}>
              {(stations||[]).map(s=><option key={s.id} value={s.id}>{s.name} — {s.address}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Btn variant="outline" tone="slate" onClick={()=>{setBaseDate(addDaysISO(baseDate,-7));setDayIndex(0)}}>◀︎ 7d</Btn>
            <input type="date" className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
              value={baseDate} onChange={(e)=>{setBaseDate(e.target.value);setDayIndex(0)}}/>
            <Btn variant="outline" tone="slate" onClick={()=>{const t=todayISO();setBaseDate(t);setDayIndex(0)}}>Today</Btn>
            <Btn variant="outline" tone="slate" onClick={()=>{setBaseDate(addDaysISO(baseDate,7));setDayIndex(0)}}>7d ▶︎</Btn>
          </div>
        </div>

        {/* 7-day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d,i)=>{ const t=fmtDayTab(d); const active=i===dayIndex;
            return <ChipTab key={d} active={active} onClick={()=>setDayIndex(i)}>
              <div className="text-sm font-semibold">{t.label}</div>
              <div className={active?"text-emerald-50/90 text-xs":"text-slate-500 text-xs"}>{t.sub}</div>
            </ChipTab>;
          })}
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b px-5 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="font-semibold">Edit Windows — <span className="text-slate-600">{new Date(date).toLocaleDateString()}</span></div>
          <div className="flex flex-wrap gap-2">
            <Btn variant="subtle" tone="slate" onClick={addWindow}>+ Quick add (next hour)</Btn>
            <Btn onClick={save} className={saving?"opacity-70 cursor-not-allowed":""} disabled={saving}>{saving?"Saving…":"Save"}</Btn>
          </div>
        </div>

        {/* Manual add */}
        <div className="px-5 py-3 bg-slate-50/60 border-b flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-600">Add window:</span>
          <input type="time" step="300" className="border rounded px-2 py-1 w-28 focus:ring-2 focus:ring-emerald-500"
            value={String(newWin.start).slice(0,5)} onChange={(e)=>setNewWin(m=>({...m,start:e.target.value}))}/>
          <span className="text-slate-400">→</span>
          <input type="time" step="300" className="border rounded px-2 py-1 w-28 focus:ring-2 focus:ring-emerald-500"
            value={String(newWin.end).slice(0,5)} onChange={(e)=>setNewWin(m=>({...m,end:e.target.value}))}/>
          <input type="number" min={0} max={maxCols} className="border rounded px-2 py-1 w-24 text-center focus:ring-2 focus:ring-emerald-500"
            value={newWin.capacity} onChange={(e)=>setNewWin(m=>({...m,capacity:Number(e.target.value||0)}))}/>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={!!newWin.maintenance}
              onChange={(e)=>setNewWin(m=>({...m,maintenance:e.target.checked}))}/>
            Maintenance
          </label>
          <Btn tone="black" onClick={addWindowManual}>Add</Btn>
        </div>

        {/* Editable list */}
        {slots.length===0?(
          <div className="py-10 text-center text-slate-500">No windows yet. Use the row above to add a precise window.</div>
        ):(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="px-4 py-2 text-left">Start</th><th className="px-4 py-2 text-left">End</th>
                  <th className="px-4 py-2 text-center">Capacity</th><th className="px-4 py-2 text-center">Maintenance</th>
                  <th className="px-4 py-2 text-right w-48">Actions</th></tr>
              </thead>
              <tbody>
                {slots.map((s,idx)=>{ const cap=Number(s.capacity||0), capErr=cap>maxCols||cap<0;
                  return (
                    <tr key={slotKey(s,idx)} className="border-t hover:bg-slate-50/60">
                      <td className="px-4 py-2">
                        <input className="border rounded px-2 py-1 w-28 focus:ring-2 focus:ring-emerald-500"
                          value={String(s.start||"").slice(0,5)}
                          onChange={(e)=>updateSlot(idx,{start:normalizeTime(e.target.value,s.start)})}/>
                      </td>
                      <td className="px-4 py-2">
                        <input className="border rounded px-2 py-1 w-28 focus:ring-2 focus:ring-emerald-500"
                          value={String(s.end||"").slice(0,5)}
                          onChange={(e)=>updateSlot(idx,{end:normalizeTime(e.target.value,s.end)})}/>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input type="number" min={0} max={maxCols}
                          className={`border rounded px-2 py-1 w-24 text-center ${capErr?"border-rose-300 bg-rose-50":"focus:ring-emerald-500"} focus:ring-2`}
                          value={cap} onChange={(e)=>updateSlot(idx,{capacity:Number(e.target.value||0)})}/>
                        {capErr && <div className="text-rose-600 text-xs mt-1">≤ {maxCols}</div>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input type="checkbox" className="h-4 w-4 accent-emerald-600"
                          checked={s.available===false}
                          onChange={(e)=>updateSlot(idx,{available:e.target.checked?false:true})}/>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Btn variant="outline" tone="slate" onClick={()=>duplicateSlot(idx)}>Duplicate</Btn>
                          <Btn variant="outline" tone="slate" onClick={()=>removeSlot(idx)}>Remove</Btn>
                        </div>
                      </td>
                    </tr>
                  );})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white border rounded-xl px-4 py-3 shadow-sm text-sm flex flex-wrap items-center gap-6">
        <span className="text-slate-500">Legend:</span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-200 inline-block"/><span className="text-slate-700">Available</span></span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-200 inline-block"/><span className="text-slate-700">Booked</span></span>
        <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-200 inline-block"/><span className="text-slate-700">Maintenance</span></span>
      </div>

      {/* ======= Quick View (compact capacity bars) ======= */}
      <div className="bg-white border rounded-2xl shadow-sm">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <div className="font-semibold">Quick View — <span className="text-slate-600">{new Date(date).toLocaleDateString()}</span></div>
          <div className="text-sm text-slate-500">Max simultaneous vehicles: {maxCols}</div>
        </div>

        <div className="divide-y">
          {hourRows.map(r=>{
            const total=r.capacity||0, booked=r.booked||0, available=r.available||0;
            return (
              <div key={r.h} className="px-5 py-3 flex items-center gap-4">
                <div className="w-16 font-mono text-slate-700">{r.label}</div>
                <div className="flex-1">
                  {/* bar */}
                  <div className={`h-3 rounded-full overflow-hidden border ${r.maintenance?"border-rose-300 bg-rose-50":"border-slate-200 bg-slate-100"}`}>
                    {!r.maintenance && (
                      <div className="h-full flex">
                        <div style={{width: total?`${(booked/Math.max(1,total))*100}%`:"0%"}} className="h-full bg-amber-400/80" />
                        <div style={{width: total?`${(available/Math.max(1,total))*100}%`:"0%"}} className="h-full bg-emerald-300/80" />
                      </div>
                    )}
                  </div>
                  {/* labels */}
                  <div className="mt-1 text-xs text-slate-600 flex items-center gap-3">
                    {r.maintenance
                      ? <span className="text-rose-600">Maintenance</span>
                      : <>
                          <span><b>{available}</b> available</span>
                          <span className="text-slate-400">/</span>
                          <span><b>{booked}</b> booked</span>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500">{total} capacity</span>
                        </>
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && <div className="text-center text-slate-500 py-6">Loading…</div>}
    </div>
  );
}
