import api from "./client";

export const listOwners = () => api.get("/owners").then(r => r.data);
export const getOwner = (nic) => api.get(`/owners/${nic}`).then(r => r.data);
export const createOwner = (dto) => api.post("/owners", dto).then(r => r.data);
export const updateOwner = (nic, dto) => api.put(`/owners/${nic}`, dto).then(r => r.data);
export const deactivateOwner = (nic) => api.put(`/owners/${nic}/deactivate`).then(r => r.data);
export const reactivateOwner = (nic) => api.put(`/owners/${nic}/reactivate`).then(r => r.data);
