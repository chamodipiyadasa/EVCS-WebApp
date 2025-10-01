import { useEffect, useState } from 'react'
import { listOwners, deactivateOwner, reactivateOwner } from '../services/owners'
import { Link } from 'react-router-dom'

export default function Owners(){
  const [items,setItems]=useState([])
  const load = async ()=> setItems(await listOwners())
  useEffect(()=>{ load() },[])
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">EV Owners</h1>
        <Link to="/owners/new" className="bg-blue-600 text-white px-3 py-2 rounded">Add Owner</Link>
      </div>
      <table className="w-full border">
        <thead><tr className="text-left text-slate-500 text-sm"><th>NIC</th><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(o=>(
            <tr key={o.nic} className="border-t">
              <td>{o.nic}</td><td>{o.fullName}</td><td>{o.email}</td><td>{o.active?'Active':'Deactivated'}</td>
              <td className="space-x-2">
                <Link className="underline" to={`/owners/${o.nic}`}>Edit</Link>
                {o.active
                  ? <button className="text-red-600" onClick={async()=>{await deactivateOwner(o.nic); load()}}>Deactivate</button>
                  : <button className="text-green-700" onClick={async()=>{await reactivateOwner(o.nic); load()}}>Reactivate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
