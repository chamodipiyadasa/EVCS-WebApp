import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStation, createStation, updateStation } from '../services/stations'
import toast from 'react-hot-toast'

export default function StationForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const editing = !!id
  const [form,setForm] = useState({ name:'', address:'', latitude:'', longitude:'', type:'AC', slots:4 })
  const [errors,setErrors] = useState({})
  const [saving,setSaving] = useState(false)
  useEffect(()=>{ if(editing){ getStation(id).then(setForm) } },[id])
  const save = async (e)=>{
    e.preventDefault()
    // client-side validation
    const v = validate(form)
    setErrors(v)
    if(Object.keys(v).length>0) return

    setSaving(true)
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
    }finally{
      setSaving(false)
    }
  }
  return (
    <form onSubmit={save} className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">{editing?'Edit Station':'New Station'}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium">Name</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium">Type</label>
          <select className="border rounded px-3 py-2 w-full" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option>AC</option><option>DC</option>
          </select>
          {errors.type && <div className="text-red-600 text-sm mt-1">{errors.type}</div>}
        </div>

        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-medium">Address</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/>
          {errors.address && <div className="text-red-600 text-sm mt-1">{errors.address}</div>}
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium">Latitude</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="Latitude" type="number" step="any" value={form.latitude} onChange={e=>setForm({...form, latitude: e.target.value})}/>
          {errors.latitude && <div className="text-red-600 text-sm mt-1">{errors.latitude}</div>}
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium">Longitude</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="Longitude" type="number" step="any" value={form.longitude} onChange={e=>setForm({...form, longitude: e.target.value})}/>
          {errors.longitude && <div className="text-red-600 text-sm mt-1">{errors.longitude}</div>}
        </div>

        <div className="col-span-1">
          <label className="block text-sm font-medium">Slots</label>
          <input className="border rounded px-3 py-2 w-full" type="number" placeholder="Slots" value={form.slots} onChange={e=>setForm({...form, slots:Number(e.target.value)})}/>
          {errors.slots && <div className="text-red-600 text-sm mt-1">{errors.slots}</div>}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button type="button" className="border px-3 py-2 rounded" onClick={()=>nav('/app/stations')}>Cancel</button>
        <button type="button" className="ml-auto text-sm text-slate-500 underline" onClick={()=>{
      </div>
    </form>
  )
}

function validate(f){
  const e = {}
  if(!f.name || f.name.trim().length<2) e.name = 'Name is required (min 2 chars)'
  if(!f.address || f.address.trim().length<3) e.address = 'Address is required'
  if(f.latitude === '' || isNaN(Number(f.latitude))) e.latitude = 'Latitude is required'
  if(f.longitude === '' || isNaN(Number(f.longitude))) e.longitude = 'Longitude is required'
  if(!f.type) e.type = 'Type is required'
  if(!Number.isFinite(Number(f.slots)) || Number(f.slots) < 1) e.slots = 'Slots must be 1 or more'
  return e
}
