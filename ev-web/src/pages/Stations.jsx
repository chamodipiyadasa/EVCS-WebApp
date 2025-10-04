import { useEffect, useState } from 'react'
import { listStations, deactivateStation, activateStation } from '../services/stations'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Stations(){
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(false)
  const [query,setQuery]=useState('')
  const [statusFilter,setStatusFilter]=useState('all') // all|active|deactivated
  const [selected,setSelected] = useState(null)

  const load = async ()=>{
    setLoading(true)
    try{
      const data = await listStations()
      // assign a short, human-friendly ID for display (STATION01, STATION02...)
      const withShortId = data.map((s,i)=>({ ...s, shortId: `STATION${String(i+1).padStart(2,'0')}`}))
      setItems(withShortId)
    }catch(e){
      console.error('Failed to load stations', e)
      toast.error(e.message || 'Failed to load stations')
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ load() },[])

  const toggleActive = async (s)=>{
    try{
      if(s.active){
        await deactivateStation(s.id)
        toast.success('Station deactivated')
      }else{
        await activateStation(s.id)
        toast.success('Station activated')
      }
      await load()
    }catch(e){
      console.error('Failed to toggle active', e)
      // If the server returned ProblemDetails (validation errors) display a summarized message
      const pd = e?.response?.data
      if(pd && pd.title && pd.errors){
        // join field errors into a single string
        const msgs = Object.entries(pd.errors).flatMap(([k,arr])=>arr).join(' | ')
        toast.error(`${pd.title}: ${msgs}`)
      } else if(pd && pd.message){
        toast.error(pd.message)
      } else {
        toast.error(e?.response?.data || e.message || 'Failed to update station')
      }
    }
  }

  // client-side filtering based on query and status
  const filtered = items.filter(s=>{
    const q = query.trim().toLowerCase()
    if(q){
      const combined = `${s.name} ${s.type} ${s.address} ${s.id} ${s.shortId || ''}`.toLowerCase()
      if(!combined.includes(q)) return false
    }
    if(statusFilter==='active' && !s.active) return false
    if(statusFilter==='deactivated' && s.active) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Stations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage charging points — add, edit, activate or deactivate stations</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Station
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, type, address or id" className="w-full border rounded px-3 py-2" />
          {query && <button className="text-sm text-slate-500 underline" onClick={()=>setQuery('')}>Clear</button>}
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <div className="text-sm text-slate-500">Showing {filtered.length} / {items.length}</div>
        </div>
      </div>

      <div className="bg-white shadow-sm border rounded overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Slots</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-4" colSpan={7}>Loading…</td></tr>}
            {!loading && filtered.length===0 && <tr><td className="p-4 text-slate-500" colSpan={7}>No stations match your search.</td></tr>}
            {filtered.map(s=>(
              <tr key={s.id} className="border-t hover:bg-slate-50 cursor-pointer" onClick={()=>setSelected(s)}>
                <td className="px-4 py-3 text-sm text-slate-500">{s.shortId || s.id}</td>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{s.address}</td>
                <td className="px-4 py-3">{s.type}</td>
                <td className="px-4 py-3">{s.slots}</td>
                <td className="px-4 py-3">
                  {s.active ? <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Active</span> : <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">Deactivated</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link onClick={e=>e.stopPropagation()} className="text-sky-600 underline" to={`${s.id}`}>Edit</Link>
                    <button onClick={e=>{ e.stopPropagation(); toggleActive(s) }} className={`text-sm px-2 py-1 rounded ${s.active ? 'text-red-600 border border-red-100' : 'text-green-700 border border-green-100'}`}>
                      {s.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setSelected(null)} />
          <div className="bg-white rounded shadow-lg z-50 w-full max-w-xl mx-4">
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <div className="text-sm text-slate-500">{selected.shortId || selected.id}</div>
              </div>
              <div>
                <button className="text-slate-500" onClick={()=>setSelected(null)}>Close</button>
              </div>
            </div>
            <div className="p-4 space-y-2 text-sm text-slate-700">
              <div><strong>Address:</strong> {selected.address}</div>
              <div><strong>Type:</strong> {selected.type}</div>
              <div><strong>Slots:</strong> {selected.slots}</div>
              <div><strong>Latitude:</strong> {selected.latitude}</div>
              <div><strong>Longitude:</strong> {selected.longitude}</div>
              <div><strong>Active:</strong> {selected.active ? 'Yes' : 'No'}</div>
              <div className="pt-2">
                <Link to={`${selected.id}`} className="text-sky-600 underline" onClick={()=>setSelected(null)}>Edit station</Link>
                <button className="ml-4 text-sm text-slate-600" onClick={()=>{ toggleActive(selected); setSelected(null) }}>{selected.active ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
