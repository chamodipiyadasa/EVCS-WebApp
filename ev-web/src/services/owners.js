import { db } from './mockDb'
export async function listOwners(){ return [...db.owners] }
export async function getOwner(nic){ return db.owners.find(o=>o.nic===nic) }
export async function createOwner(dto){ db.owners.push({...dto, active:true}); return dto }
export async function updateOwner(nic, dto){
  const i = db.owners.findIndex(o=>o.nic===nic)
  if(i>-1) db.owners[i] = { ...db.owners[i], ...dto }
  return db.owners[i]
}
export async function deactivateOwner(nic){ const o = db.owners.find(x=>x.nic===nic); if(o) o.active=false }
export async function reactivateOwner(nic){ const o = db.owners.find(x=>x.nic===nic); if(o) o.active=true }
