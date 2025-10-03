import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function RequireRole({roles, children}){
  const { isAuthed, role } = useAuth()
  if(!isAuthed) return <Navigate to="/login" replace/>
  if(!roles.includes(role)) return <div className="p-6">Not authorized for this page (role: {role})</div>
  return children
}
