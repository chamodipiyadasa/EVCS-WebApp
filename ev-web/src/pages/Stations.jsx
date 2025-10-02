import { useState } from "react";

export default function Stations() {
  const [stations, setStations] = useState([
    {
      id: "STN001",
      name: "Colombo City Center",
      address: "123 Galle Road, Colombo 03",
      district: "Colombo",
      type: "DC",
      powerOutput: "150kW",
      totalSlots: 6,
      availableSlots: 4,
      status: "Active",
      hours: "06:00-22:00",
      pricing: { perKwh: 45.00, sessionFee: 50.00 },
      operatorId: "OP001"
    },
    {
      id: "STN002", 
      name: "Kandy Shopping Complex",
      address: "456 Peradeniya Road, Kandy",
      district: "Kandy",
      type: "AC",
      powerOutput: "22kW",
      totalSlots: 4,
      availableSlots: 3,
      status: "Active",
      hours: "07:00-21:00",
      pricing: { perKwh: 35.00, sessionFee: 25.00 },
      operatorId: "OP002"
    },
    {
      id: "STN003",
      name: "Galle Highway Rest Stop",
      address: "Southern Expressway, Galle",
      district: "Galle",
      type: "DC",
      powerOutput: "100kW",
      totalSlots: 8,
      availableSlots: 0,
      status: "Maintenance",
      hours: "24/7",
      pricing: { perKwh: 40.00, sessionFee: 40.00 },
      operatorId: "OP001"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [formData, setFormData] = useState({
    name: "", address: "", district: "", type: "AC", powerOutput: "",
    totalSlots: "", hours: "06:00-22:00", perKwh: "", sessionFee: "", operatorId: ""
  });

  const districts = ["Colombo", "Kandy", "Galle", "Matara", "Jaffna", "Anuradhapura"];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingStation) {
      setStations(prev => prev.map(station =>
        station.id === editingStation.id ? {
          ...station,
          name: formData.name,
          address: formData.address,
          district: formData.district,
          type: formData.type,
          powerOutput: formData.powerOutput,
          totalSlots: parseInt(formData.totalSlots),
          hours: formData.hours,
          pricing: { perKwh: parseFloat(formData.perKwh), sessionFee: parseFloat(formData.sessionFee) },
          operatorId: formData.operatorId
        } : station
      ));
    } else {
      const newStation = {
        id: `STN${String(stations.length + 1).padStart(3, '0')}`,
        name: formData.name,
        address: formData.address,
        district: formData.district,
        type: formData.type,
        powerOutput: formData.powerOutput,
        totalSlots: parseInt(formData.totalSlots),
        availableSlots: parseInt(formData.totalSlots),
        status: "Active",
        hours: formData.hours,
        pricing: { perKwh: parseFloat(formData.perKwh), sessionFee: parseFloat(formData.sessionFee) },
        operatorId: formData.operatorId
      };
      setStations(prev => [...prev, newStation]);
    }
    closeModal();
  };

  const openModal = (station = null) => {
    setEditingStation(station);
    if (station) {
      setFormData({
        name: station.name,
        address: station.address,
        district: station.district,
        type: station.type,
        powerOutput: station.powerOutput,
        totalSlots: station.totalSlots.toString(),
        hours: station.hours,
        perKwh: station.pricing.perKwh.toString(),
        sessionFee: station.pricing.sessionFee.toString(),
        operatorId: station.operatorId
      });
    } else {
      setFormData({
        name: "", address: "", district: "", type: "AC", powerOutput: "",
        totalSlots: "", hours: "06:00-22:00", perKwh: "", sessionFee: "", operatorId: ""
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStation(null);
  };

  const handleDelete = (stationId) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      setStations(prev => prev.filter(station => station.id !== stationId));
    }
  };

  const toggleStatus = (stationId) => {
    setStations(prev => prev.map(station =>
      station.id === stationId 
        ? { ...station, status: station.status === "Active" ? "Inactive" : "Active" }
        : station
    ));
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = 
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || station.status === statusFilter;
    const matchesType = typeFilter === "All" || station.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return { bg: "#dcfce7", text: "#16a34a" };
      case "Inactive": return { bg: "#fee2e2", text: "#dc2626" };
      case "Maintenance": return { bg: "#fef3c7", text: "#d97706" };
      default: return { bg: "#f3f4f6", text: "#6b7280" };
    }
  };

  const activeStations = stations.filter(s => s.status === "Active").length;
  const totalSlots = stations.reduce((sum, station) => sum + station.availableSlots, 0);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1e293b' }}>
          Charging Station Management
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '16px' }}>
          Manage charging stations and monitor real-time status
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Total Stations</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{stations.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Active</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>{activeStations}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Available Slots</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{totalSlots}</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minWidth: '200px' }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="All">All Types</option>
            <option value="AC">AC Charging</option>
            <option value="DC">DC Fast Charging</option>
          </select>
          <button
            onClick={() => openModal()}
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginLeft: 'auto' }}
          >
            + Add Station
          </button>
        </div>
      </div>

      {/* Stations List */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
            Charging Stations ({filteredStations.length})
          </h2>
        </div>

        {filteredStations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No stations found. {searchTerm || statusFilter !== "All" || typeFilter !== "All" ? "Try adjusting your filters." : "Click 'Add Station' to get started."}
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {filteredStations.map((station) => {
              const statusColors = getStatusColor(station.status);
              const utilizationRate = Math.round(((station.totalSlots - station.availableSlots) / station.totalSlots) * 100);
              
              return (
                <div key={station.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                          {station.name}
                        </h3>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: statusColors.text, backgroundColor: statusColors.bg }}>
                          {station.status}
                        </span>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: station.type === "DC" ? "#2563eb" : "#059669", backgroundColor: station.type === "DC" ? "#dbeafe" : "#ecfdf5" }}>
                          {station.type} - {station.powerOutput}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px', color: '#64748b' }}>
                        <div>
                          <p style={{ margin: '0 0 4px 0' }}><strong>ID:</strong> {station.id}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Location:</strong> {station.address}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>District:</strong> {station.district}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Slots:</strong> {station.availableSlots}/{station.totalSlots} available ({utilizationRate}% used)</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Hours:</strong> {station.hours}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Pricing:</strong> Rs.{station.pricing.perKwh}/kWh + Rs.{station.pricing.sessionFee}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                      <button onClick={() => openModal(station)} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        Edit
                      </button>
                      <button onClick={() => toggleStatus(station.id)} style={{ padding: '6px 12px', backgroundColor: station.status === 'Active' ? '#f59e0b' : '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        {station.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(station.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0', color: '#1e293b' }}>
              {editingStation ? 'Edit Station' : 'Add New Station'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Station Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>District *</label>
                  <select name="district" value={formData.district} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="">Select District</option>
                    {districts.map(district => (<option key={district} value={district}>{district}</option>))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Type *</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="AC">AC Charging</option>
                    <option value="DC">DC Fast Charging</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Power Output *</label>
                  <input type="text" name="powerOutput" value={formData.powerOutput} onChange={handleInputChange} required placeholder="e.g., 22kW" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Total Slots *</label>
                  <input type="number" name="totalSlots" value={formData.totalSlots} onChange={handleInputChange} required min="1" max="20" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Hours *</label>
                  <input type="text" name="hours" value={formData.hours} onChange={handleInputChange} required placeholder="06:00-22:00" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Price/kWh (Rs.) *</label>
                  <input type="number" name="perKwh" value={formData.perKwh} onChange={handleInputChange} required min="0" step="0.01" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Session Fee (Rs.) *</label>
                  <input type="number" name="sessionFee" value={formData.sessionFee} onChange={handleInputChange} required min="0" step="0.01" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Operator ID *</label>
                <input type="text" name="operatorId" value={formData.operatorId} onChange={handleInputChange} required placeholder="e.g., OP001" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                  {editingStation ? 'Update' : 'Add'} Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
