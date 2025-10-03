import { useEffect, useState } from 'react'
import { listStations, deactivateStation } from '../services/stations'
import { Link } from 'react-router-dom'

export default function Stations(){
  const [items,setItems]=useState([])
  const load = async ()=> setItems(await listStations())
  useEffect(()=>{ load() },[])
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Stations</h1>
        <Link to="/stations/new" className="bg-blue-600 text-white px-3 py-2 rounded">Add Station</Link>
      </div>
      <table className="w-full border">
        <thead><tr className="text-left text-slate-500 text-sm"><th>Name</th><th>Type</th><th>Slots</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(s=>(
            <tr key={s.id} className="border-t">
              <td>{s.name}</td><td>{s.type}</td><td>{s.slots}</td><td>{s.active?'Active':'Deactivated'}</td>
              <td className="space-x-2">
                <Link className="underline" to={`/stations/${s.id}`}>Edit</Link>
                {s.active && <button className="text-red-600" onClick={async()=>{await deactivateStation(s.id); load()}}>Deactivate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
