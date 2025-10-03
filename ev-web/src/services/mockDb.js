export const db = {
  users: [
    { id:'u1', username:'admin', role:'Backoffice', email:'admin@evcs.com', active:true },
    { id:'u2', username:'op', role:'Operator', email:'op@evcs.com', active:true },
  ],
  owners: [
    { nic:'923456789V', fullName:'Kasun Perera', email:'kasun@example.com', phone:'0771234567', active:true },
    { nic:'912345678V', fullName:'Nimali Jay', email:'nimali@example.com', phone:'0772233445', active:false },
  ],
  stations: [
    { id:'st1', name:'Fort A', type:'DC', slots:4, active:true },
    { id:'st2', name:'Kandy B', type:'AC', slots:6, active:true },
  ],
  bookings: [
    { id:'b1', ownerNIC:'923456789V', stationId:'st1', start:'2025-10-01T08:00:00Z', end:'2025-10-01T09:00:00Z', status:'Pending' },
    { id:'b2', ownerNIC:'912345678V', stationId:'st2', start:'2025-10-02T10:00:00Z', end:'2025-10-02T11:00:00Z', status:'Approved' },
  ]
}
