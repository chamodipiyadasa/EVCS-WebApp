import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStation, createStation, updateStation } from '../services/stations'

export default function StationForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const editing = !!id
  const [form,setForm] = useState({ name:'', type:'AC', slots:4 })
  useEffect(()=>{ if(editing){ getStation(id).then(setForm) } },[id])
  const save = async (e)=>{
    e.preventDefault()
    if(editing) await updateStation(id, form)
    else await createStation(form)
    nav('/stations')
  }
  return (
    <form onSubmit={save} className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">{editing?'Edit Station':'New Station'}</h1>
      <input className="border rounded px-3 py-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
      <select className="border rounded px-3 py-2 w-full" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
        <option>AC</option><option>DC</option>
      </select>
      <input className="border rounded px-3 py-2 w-full" type="number" placeholder="Slots" value={form.slots} onChange={e=>setForm({...form, slots:Number(e.target.value)})}/>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Save</button>
        <button type="button" className="border px-3 py-2 rounded" onClick={()=>nav('/stations')}>Cancel</button>
      </div>
    </form>
  )
}
