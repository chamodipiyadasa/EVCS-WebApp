import { useEffect, useState } from 'react'
import { listOwners } from '../services/owners'
import { listStations } from '../services/stations'
import { listBookings } from '../services/bookings'

export default function Dashboard(){
  const [summary, setSummary] = useState({ users:2, owners:0, stations:0, activeBookings:0 })
  const [now] = useState(()=>new Date().toISOString())

  useEffect(()=>{
    Promise.all([listOwners(), listStations(), listBookings()]).then(([o,s,b])=>{
      const active = b.filter(x=>['Approved','Pending'].includes(x.status)).length
      setSummary({ users:2, owners:o.length, stations:s.length, activeBookings:active })
    })
  },[])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview & Analytics</p>
        </div>
        <div className="text-slate-500 text-sm">{new Date(now).toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi title="System Users" value={summary.users} note="+3 this month" />
        <Kpi title="EV Owners" value={summary.owners} note="+12 this month" />
        <Kpi title="Charging Stations" value={summary.stations} note="100% uptime" />
        <Kpi title="Active Bookings" value={summary.activeBookings} note="+8 today" />
      </div>

      <div className="bg-white border rounded-xl p-4">
        <div className="font-semibold mb-3">Recent Activity</div>
        <ul className="divide-y">
          <li className="py-3 flex items-start justify-between">
            <div>
              <div className="font-medium">New EV owner registered</div>
              <div className="text-slate-600 text-sm">John Doe — NIC: 123456789V</div>
            </div>
            <div className="text-slate-400 text-xs">2 minutes ago</div>
          </li>
          <li className="py-3 flex items-start justify-between">
            <div>
              <div className="font-medium">Booking confirmed</div>
              <div className="text-slate-600 text-sm">Station A, Slot 2 — Oct 1, 2025 14:00</div>
            </div>
            <div className="text-slate-400 text-xs">15 minutes ago</div>
          </li>
        </ul>
      </div>
    </div>
  )
}

function Kpi({ title, value, note }){
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {note && <div className="text-emerald-600 text-xs mt-1">{note}</div>}
    </div>
  )
}
