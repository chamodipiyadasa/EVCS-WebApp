import { useEffect, useState } from 'react'
import { listStations, deactivateStation, activateStation } from '../services/stations'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Stations(){
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(false)

  const load = async ()=>{
    setLoading(true)
    try{
      const data = await listStations()
      setItems(data)
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Stations</h1>
        <Link to="new" className="bg-blue-600 text-white px-4 py-2 rounded">Add Station</Link>
      </div>

      <div className="bg-white shadow-sm border rounded overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-50 text-slate-600 text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Slots</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-4" colSpan={5}>Loading…</td></tr>}
            {!loading && items.length===0 && <tr><td className="p-4 text-slate-500" colSpan={5}>No stations found.</td></tr>}
            {items.map(s=>(
              <tr key={s.id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.type}</td>
                <td className="px-4 py-3">{s.slots}</td>
                <td className="px-4 py-3">
                  {s.active ? <span className="text-green-700 font-medium">Active</span> : <span className="text-slate-500">Deactivated</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link className="text-sky-600 underline" to={`${s.id}`}>Edit</Link>
                    <button className={`text-sm px-2 py-1 rounded ${s.active ? 'text-red-600 border border-red-100' : 'text-green-700 border border-green-100'}`} onClick={()=>toggleActive(s)}>
                      {s.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
