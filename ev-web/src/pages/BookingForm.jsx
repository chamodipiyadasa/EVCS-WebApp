import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getBooking, createBooking, updateBooking } from '../services/bookings'

export default function BookingForm(){
  const { id } = useParams()
  const nav = useNavigate()
  const editing = !!id
  const [form,setForm] = useState({ ownerNIC:'', stationId:'', date:'', start:'', end:'' })
  useEffect(()=>{ if(editing){ getBooking(id).then(b=> setForm({
    ownerNIC:b.ownerNIC, stationId:b.stationId, date:b.start?.slice(0,10)||'', start:b.start?.slice(11,16)||'', end:b.end?.slice(11,16)||''
  })) } },[id])
  const save = async (e)=>{
    e.preventDefault()
    const startISO = new Date(`${form.date}T${form.start||'00:00'}:00Z`).toISOString()
    const endISO = new Date(`${form.date}T${form.end||'00:00'}:00Z`).toISOString()
    const dto = { ownerNIC:form.ownerNIC, stationId:form.stationId, start:startISO, end:endISO }
    if(editing) await updateBooking(id, dto)
    else await createBooking(dto)
    nav('/bookings')
  }
  return (
    <form onSubmit={save} className="max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">{editing?'Edit Booking':'New Booking'}</h1>
      <input className="border rounded px-3 py-2 w-full" placeholder="Owner NIC" value={form.ownerNIC} onChange={e=>setForm({...form, ownerNIC:e.target.value})}/>
      <input className="border rounded px-3 py-2 w-full" placeholder="Station ID" value={form.stationId} onChange={e=>setForm({...form, stationId:e.target.value})}/>
      <input className="border rounded px-3 py-2 w-full" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2 w-full" type="time" value={form.start} onChange={e=>setForm({...form, start:e.target.value})}/>
        <input className="border rounded px-3 py-2 w-full" type="time" value={form.end} onChange={e=>setForm({...form, end:e.target.value})}/>
      </div>
      <div className="text-sm text-slate-500">Rules: create ≤ 7 days; update/cancel ≥ 12h before</div>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Save</button>
        <button type="button" className="border px-3 py-2 rounded" onClick={()=>nav('/bookings')}>Cancel</button>
      </div>
    </form>
  )
}
