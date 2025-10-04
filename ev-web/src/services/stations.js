import * as api from '../api/stations'

const mapFromApi = (s) => ({
  id: s.id,
  name: s.name,
  address: s.address,
  latitude: s.latitude,
  longitude: s.longitude,
  type: s.type,
  slots: s.slots,
  active: s.isActive ?? s.active ?? true,
})

export async function listStations(){
  const data = await api.listStations()
  if(!Array.isArray(data)){
    // Defensive: if server returned HTML (e.g. frontend route) or an object,
    // throw a helpful error instead of letting .map blow up with a TypeError.
    console.error('Unexpected stations response', data)
    throw new Error('Invalid response from stations API: expected array')
  }
  return data.map(mapFromApi)
}

export async function getStation(id){
  const s = await api.getStation(id)
  return mapFromApi(s)
}

export async function createStation(dto){
  const s = await api.createStation(dto)
  return mapFromApi(s)
}

export async function updateStation(id, dto){
  const s = await api.updateStation(id, dto)
  return mapFromApi(s)
}

export async function deactivateStation(id){
  // api.deactivateStation will set isActive=false on the server
  const s = await api.deactivateStation(id)
  return mapFromApi(s)
}

// Activate station by setting isActive=true using the update endpoint.
export async function activateStation(id){
  // reuse update endpoint to set isActive true
  const s = await api.updateStation(id, { isActive: true })
  return mapFromApi(s)
}
