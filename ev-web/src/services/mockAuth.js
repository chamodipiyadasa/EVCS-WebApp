import { db } from './mockDb'

// super-simple fake login: username === password
export async function mockLogin(username, password){
  const user = db.users.find(u=>u.username===username)
  if(!user || password !== username) throw new Error('Invalid credentials')
  const token = { username, role: user.role }
  localStorage.setItem('jwt_mock', JSON.stringify(token))
  return token
}
