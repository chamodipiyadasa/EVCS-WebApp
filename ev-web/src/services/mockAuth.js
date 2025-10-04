import { db } from './mockDb'

// super-simple fake login: username === password
export async function mockLogin(username, password){
  const user = db.users.find(u=>u.username===username)
  if(!user || password !== username) throw new Error('Invalid credentials')
  const token = { username, role: user.role }
  // Store both a mock token and a token under the real key so the client
  // and hooks that look for either name will work during development.
  localStorage.setItem('jwt_mock', JSON.stringify(token))
  try{
    // store a string token so axios interceptor that reads `jwt` still finds it
    localStorage.setItem('jwt', JSON.stringify(token))
  }catch(e){
    // ignore storage errors
  }
  return token
}
