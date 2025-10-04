import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStation, createStation, updateStation } from '../services/stations'
import toast from 'react-hot-toast'

export default function StationForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const editing = !!id
  const [form,setForm] = useState({ name:'', address:'', latitude:0, longitude:0, type:'AC', slots:4 })
  useEffect(()=>{ if(editing){ getStation(id).then(setForm) } },[id])
  const save = async (e)=>{
    e.preventDefault()
    try{
      console.debug('[stations] save payload', form)
      if(editing) await updateStation(id, form)
      else await createStation(form)
      toast.success('Station saved')
      // navigate back to the stations list under /app
      nav('/app/stations')
    }catch(err){
      console.error('Failed to save station', err, err?.response?.data)
      const msg = err?.response?.data?.message || err?.response?.data || err.message || 'Failed to save station'
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }
  return (
    <form onSubmit={save} className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">{editing?'Edit Station':'New Station'}</h1>
      <input className="border rounded px-3 py-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
      <input className="border rounded px-3 py-2 w-full" placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/>
      <div className="grid grid-cols-2 gap-2">
        <input className="border rounded px-3 py-2" placeholder="Latitude" type="number" step="any" value={form.latitude} onChange={e=>setForm({...form, latitude: Number(e.target.value)})}/>
        <input className="border rounded px-3 py-2" placeholder="Longitude" type="number" step="any" value={form.longitude} onChange={e=>setForm({...form, longitude: Number(e.target.value)})}/>
      </div>
      <select className="border rounded px-3 py-2 w-full" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
        <option>AC</option><option>DC</option>
      </select>
      <input className="border rounded px-3 py-2 w-full" type="number" placeholder="Slots" value={form.slots} onChange={e=>setForm({...form, slots:Number(e.target.value)})}/>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Save</button>
  <button type="button" className="border px-3 py-2 rounded" onClick={()=>nav('/app/stations')}>Cancel</button>
      </div>
    </form>
  )
}
