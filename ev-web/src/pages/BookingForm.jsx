import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBooking, createBooking, updateBooking } from "../api/bookings";
import toast from "react-hot-toast";

export default function BookingForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const editing = !!id;
  const [form, setForm] = useState({ ownerNic:"", stationId:"", date:"", start:"", end:"" });

  useEffect(()=>{ if(editing){ getBooking(id).then(d=>setForm(d)); }}, [id]);

  const save = async (e)=>{
    e.preventDefault();
    try {
      if(editing) await updateBooking(id, form);
      else await createBooking(form);
      toast.success("Saved");
      nav("/bookings");
    } catch { toast.error("Save failed (check 7-day/12-hour rules)"); }
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">{editing?"Edit Booking":"New Booking"}</h1>
      <input className="border rounded px-3 py-2 w-full" placeholder="Owner NIC" value={form.ownerNic} onChange={e=>setForm({...form, ownerNic:e.target.value})}/>
      <input className="border rounded px-3 py-2 w-full" placeholder="Station ID" value={form.stationId} onChange={e=>setForm({...form, stationId:e.target.value})}/>
      <input className="border rounded px-3 py-2 w-full" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
      <input className="border rounded px-3 py-2 w-full" type="time" value={form.start} onChange={e=>setForm({...form, start:e.target.value})}/>
      <input className="border rounded px-3 py-2 w-full" type="time" value={form.end} onChange={e=>setForm({...form, end:e.target.value})}/>
      <div className="text-sm text-slate-500">⚠️ Rules: Create ≤7 days, Update/Cancel ≥12h before</div>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Save</button>
        <button type="button" className="border px-3 py-2 rounded" onClick={()=>nav("/bookings")}>Cancel</button>
      </div>
    </form>
  );
}
