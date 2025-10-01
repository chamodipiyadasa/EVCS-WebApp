import { db } from '../services/mockDb'

export default function Users(){
  const users = db.users
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">System Users</h1>
      <table className="w-full border">
        <thead><tr className="text-left text-slate-500 text-sm"><th>Username</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>
          {users.map(u=>(
            <tr key={u.id} className="border-t">
              <td>{u.username}</td><td>{u.role}</td><td>{u.email}</td><td>{u.active?'Active':'Disabled'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
