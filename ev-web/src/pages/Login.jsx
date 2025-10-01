import { useState } from 'react'
import { mockLogin } from '../services/mockAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login(){
  const [u,setU] = useState('')
  const [p,setP] = useState('')
  const nav = useNavigate()
  const submit = async (e)=>{
    e.preventDefault()
    try{
      await mockLogin(u,p)
      toast.success('Logged in')
      nav('/')
    }catch(e){
      toast.error('Invalid credentials (try admin/admin or op/op)')
    }
  }
  return (
    <div className="grid place-items-center min-h-screen bg-slate-50">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow w-[380px] space-y-3">
        <div className="text-2xl font-semibold text-center">EVCS Login</div>
        <input className="border rounded px-3 py-2 w-full" placeholder="Username" value={u} onChange={e=>setU(e.target.value)}/>
        <input className="border rounded px-3 py-2 w-full" type="password" placeholder="Password" value={p} onChange={e=>setP(e.target.value)}/>
        <button className="bg-blue-600 text-white rounded px-3 py-2 w-full">Sign in</button>
        <div className="text-xs text-slate-500">Use admin/admin (Backoffice) or op/op (Operator)</div>
      </form>
    </div>
  )
}
