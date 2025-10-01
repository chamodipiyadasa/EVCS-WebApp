import { useMemo } from 'react'

// Simple mock auth using localStorage (no backend yet)
export function useAuth(){
  const token = localStorage.getItem('jwt_mock') // stored as JSON string
  const payload = useMemo(()=> token ? JSON.parse(token) : null, [token])
  const role = payload?.role || null
  return { isAuthed: !!token, role, user: payload }
}
