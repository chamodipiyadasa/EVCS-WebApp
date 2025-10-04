import { useMemo } from 'react'

function parseJwtPayload(token){
  try{
    if(!token) return null
    // If token looks like JSON (mock), parse it
    if(token.trim().startsWith('{')) return JSON.parse(token)
    // otherwise assume JWT: header.payload.signature
    const parts = token.split('.')
    if(parts.length<2) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  }catch(e){
    console.error('Failed to parse token payload', e)
    return null
  }
}

export function useAuth(){
  // Prefer a real token if present, otherwise fall back to the mock token
  const raw = localStorage.getItem('jwt') || localStorage.getItem('jwt_mock')
  const payload = useMemo(()=> parseJwtPayload(raw), [raw])
  // Roles can be in different claim names depending on server configuration
  const roleClaimKeys = [
    'role',
    'roles',
    'Role',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
  ]
  let role = null
  for(const k of roleClaimKeys){
    const v = payload?.[k]
    if(v){
      // some tokens put role as an array
      role = Array.isArray(v) ? v[0] : v
      break
    }
  }

  // construct a simple user object from common claims
  const user = payload ? {
    username: payload.name || payload.sub || payload.username || payload.email || null,
    raw: payload
  } : null

  return { isAuthed: !!raw, role, user }
}
