import { useState } from 'react'
import { login } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Login() {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const res = await login(u, p)

      // overwrite any old values
      localStorage.setItem('jwt', res.token)
      localStorage.setItem('role', res.role)        // <-- used by useAuth
      localStorage.setItem('username', res.username)

      toast.success(`Welcome ${res.username}`)

      // redirect per role
      if (res.role === 'Operator') nav('/app/operator')
      else nav('/app')
    } catch (err) {
      console.error(err)
      toast.error('Login failed')
    }
  }

  return (
    <div className="grid place-items-center min-h-screen bg-slate-50">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow w-[380px] space-y-3">
        <div className="text-2xl font-semibold text-center">EVCS Login</div>
        <input className="border rounded px-3 py-2 w-full" placeholder="Username"
               value={u} onChange={(e) => setU(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" type="password" placeholder="Password"
               value={p} onChange={(e) => setP(e.target.value)} />
        <button className="bg-blue-600 text-white rounded px-3 py-2 w-full hover:bg-blue-700">
          Sign in
        </button>
      </form>
    </div>
  )
}
