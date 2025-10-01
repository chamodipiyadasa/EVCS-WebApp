import { db } from './mockDb'
export async function listStations(){ return [...db.stations] }
export async function getStation(id){ return db.stations.find(s=>s.id===id) }
export async function createStation(dto){
  const id = 'st'+(db.stations.length+1)
  const s = { id, active:true, ...dto }
  db.stations.push(s); return s
}
export async function updateStation(id, dto){
  const i = db.stations.findIndex(s=>s.id===id)
  if(i>-1) db.stations[i] = { ...db.stations[i], ...dto }
  return db.stations[i]
}
export async function deactivateStation(id){
  const s = db.stations.find(x=>x.id===id); if(s) s.active=false
}
