// src/pages/OperatorDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { listStations } from "../services/stations";
import { useAuth } from "../auth/useAuth";
import { getSchedule, upsertSchedule } from "../services/schedules";
import api from "../api/client";
import toast from "react-hot-toast";

/* ---------- helpers ---------- */
const todayISO = () => new Date().toISOString().slice(0, 10);
function hashCode(str){let h=0;for(let i=0;i<str.length;i++){h=(h<<5)-h+str.charCodeAt(i);h|=0;}return Math.abs(h)}
function prettyId(prefix, raw, width=3){if(!raw)return `${prefix}${"".padStart(width,"0")}`;const n=(hashCode(String(raw))%1000)+1;return `${prefix}${String(n).padStart(width,"0")}`}
const Pill=({tone="slate",children})=>{
  const map={
    emerald:"bg-emerald-100 text-emerald-700",
    sky:"bg-sky-100 text-sky-700",
    violet:"bg-violet-100 text-violet-700",
    rose:"bg-rose-100 text-rose-700",
    slate:"bg-slate-200 text-slate-600",
    black:"bg-black text-white"
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[tone]}`}>{children}</span>;
};
const StatusBadge=({status})=>{
  const tone=status==="Approved"?"emerald":status==="Pending"?"violet":status==="Completed"?"sky":"rose";
  return <Pill tone={tone}>{status}</Pill>;
};
// OSM iframe (no API key)
function osmEmbedUrl(lat, lon, zoom=15){
  const d=0.01;const bbox=`${lon-d},${lat-d},${lon+d},${lat+d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}#map=${zoom}/${lat}/${lon}`;
}

/* ====================================================== */
export default function OperatorDashboard(){
  const { user } = useAuth();
  const [station,setStation]=useState(null);
  const [loading,setLoading]=useState(true);
  const [bookings,setBookings]=useState([]);
  const [schedule,setSchedule]=useState(null);
  const [toggling,setToggling]=useState(null);

  const today=todayISO();
  const slots=useMemo(()=>schedule?.slots||[],[schedule]);

  useEffect(()=>{(async()=>{
    try{
      setLoading(true);
      const stations=await listStations();
      if(!stations?.length){toast.error("No station assigned");return;}
      const st=stations[0]; setStation(st);
      const [bRes, sch]=await Promise.all([
        api.get(`/bookings`,{params:{stationId:st.id,date:today}}),
        getSchedule(st.id,today),
      ]);
      setBookings(bRes.data||[]);
      setSchedule(sch||{stationId:st.id,date:today,slots:[]});
    }catch(e){console.error(e);toast.error("Failed to load dashboard");}
    finally{setLoading(false);}
  })();},[user]);

  async function toggleMaintenance(idx){
    try{
      setToggling(idx);
      const next=slots.map((s,i)=> i===idx?{...s,available:s.available===false?true:false}:s);
      await upsertSchedule({stationId:station.id,date:today,slots:next});
      setSchedule(p=>({...p,slots:next}));
      toast.success(next[idx].available===false?"Marked Maintenance":"Reopened");
    }catch(e){console.error(e);toast.error(e?.response?.data?.error||e?.message||"Update failed");}
    finally{setToggling(null);}
  }

  if(loading) return <div className="py-20 text-center text-slate-500">Loading…</div>;
  if(!station) return <div className="py-20 text-center text-slate-500">No station assigned.</div>;

  const hasCoords = Number.isFinite(+station.latitude) && Number.isFinite(+station.longitude);
  const mapSrc = hasCoords ? osmEmbedUrl(+station.latitude,+station.longitude) : null;

  return (
    <div className="space-y-8">
      {/* Station card */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">{prettyId("STATION",station.id)}</div>
            <div className="text-2xl font-bold text-black">{station.name}</div>
            <div className="text-slate-600">{station.address || "No address on file"}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill tone={station.isActive?"emerald":"slate"}>{station.isActive?"Active":"Inactive"}</Pill>
              <Pill tone="violet">{station.type}</Pill>
              <Pill tone="black">{station.slots} slots</Pill>
            </div>
          </div>
          <div className="w-full sm:w-[380px] rounded-xl overflow-hidden border">
            {mapSrc ? (
              <iframe title="Station map" src={mapSrc} className="w-full h-56" loading="lazy" />
            ) : (
              <div className="w-full h-56 grid place-items-center bg-slate-50 text-slate-500">Map unavailable</div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule table */}
      <CardTable
        title={`Today's Schedule (${today})`}
        countLabel={`${slots.length} window${slots.length!==1?"s":""}`}
        headerTone="black"
        rows={slots.map((slot,i)=>{
          const time=`${String(slot.start).slice(0,5)} → ${String(slot.end).slice(0,5)}`;
          const maint=slot.available===false;
          return (
            <tr key={`${slot.start}-${slot.end}-${i}`} className="border-b border-emerald-100 hover:bg-emerald-50/40">
              <TdLeft>{time}</TdLeft>
              <TdCenter>{slot.capacity}</TdCenter>
              <TdCenter>{maint ? <Pill tone="rose">Maintenance</Pill> : <Pill tone="emerald">Open</Pill>}</TdCenter>
              <TdRight>
                <button
                  disabled={toggling===i}
                  onClick={()=>toggleMaintenance(i)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition
                    ${maint ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            : "border-rose-300 text-rose-700 hover:bg-rose-50"}
                    ${toggling===i?"opacity-60 cursor-not-allowed":""}
                  `}
                >
                  {toggling===i ? "Saving…" : (maint ? "Reopen" : "Mark Maintenance")}
                </button>
              </TdRight>
            </tr>
          );
        })}
        head={[
          <Th key="t" wide>Time</Th>,
          <Th key="c" center>Capacity</Th>,
          <Th key="s" center>State</Th>,
          <Th key="a" right>Maintenance</Th>,
        ]}
      />

      {/* Bookings table */}
      <CardTable
        title={`Today's Bookings (${today})`}
        countLabel={`${bookings.length} total`}
        headerTone="black"
        rows={bookings.map(b=>(
          <tr key={b.id} className="border-b border-emerald-100 hover:bg-emerald-50/40">
            <TdLeft className="font-medium text-black">{b.nic}</TdLeft>
            <TdCenter>{String(b.start).slice(0,5)} → {String(b.end).slice(0,5)}</TdCenter>
            <TdCenter><StatusBadge status={b.status} /></TdCenter>
          </tr>
        ))}
        head={[
          <Th key="o" wide>Owner NIC</Th>,
          <Th key="t" center>Time</Th>,
          <Th key="st" center>Status</Th>,
        ]}
      />
    </div>
  );
}

/* ---------- compact table/card primitives with brand styling ---------- */
function CardTable({ title, countLabel, head, rows, headerTone="black" }){
  return (
    <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className={`px-5 py-3 flex items-center justify-between ${headerTone==="black"?"bg-black text-white":"bg-slate-50 text-slate-700"}`}>
        <div className="font-semibold">{title}</div>
        <div className="text-xs opacity-80">{countLabel}</div>
      </div>
      {rows.length===0 ? (
        <div className="py-10 text-center text-slate-500">No data.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-slate-700 border-b border-emerald-200">
              <tr>{head}</tr>
            </thead>
            <tbody className="bg-white">{rows}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
function Th({ children, center, right, wide }){
  return (
    <th className={`px-4 py-2 ${center?"text-center":right?"text-right":"text-left"} ${wide?"min-w-[180px]":""} font-medium`}>
      {children}
    </th>
  );
}
function TdLeft({ children, className="" }){ return <td className={`px-4 py-2 text-left ${className}`}>{children}</td>; }
function TdCenter({ children, className="" }){ return <td className={`px-4 py-2 text-center ${className}`}>{children}</td>; }
function TdRight({ children, className="" }){ return <td className={`px-4 py-2 text-right ${className}`}>{children}</td>; }
