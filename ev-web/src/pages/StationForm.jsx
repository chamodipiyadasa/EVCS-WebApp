import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getStation, createStation, updateStation } from "../api/stations";
import toast from "react-hot-toast";

export default function StationForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const editing = !!id;
  const [form, setForm] = useState({ name:"", type:"AC", slots:4 });

  useEffect(()=>{ if(editing){ getStation(id).then(d=>setForm(d)); }}, [id]);

  const save = async (e)=>{
    e.preventDefault();
    try {
      if(editing) await updateStation(id, form);
      else await createStation(form);
      toast.success("Saved");
      nav("/stations");
    } catch { toast.error("Save failed"); }
  };

  return (
    <form onSubmit={save} className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">{editing?"Edit Station":"New Station"}</h1>
      <input className="border rounded px-3 py-2 w-full" placeholder="Name"
             value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
      <select className="border rounded px-3 py-2 w-full"
              value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
        <option value="AC">AC</option>
        <option value="DC">DC</option>
      </select>
      <input className="border rounded px-3 py-2 w-full" type="number" placeholder="Slots"
             value={form.slots} onChange={e=>setForm({...form, slots:e.target.value})}/>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Save</button>
        <button type="button" className="border px-3 py-2 rounded" onClick={()=>nav("/stations")}>Cancel</button>
      </div>
    </form>
  );
}
