import { useState } from "react";

export default function Owners() {
  const [owners, setOwners] = useState([
    {
      nic: "123456789V",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "+94771234567",
      address: "123 Main Street, Colombo 03",
      vehicleModel: "Tesla Model 3",
      licensePlate: "ABC-1234",
      status: "Active",
      registeredDate: "2024-09-15"
    },
    {
      nic: "987654321V", 
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@email.com",
      phone: "+94772345678",
      address: "456 Galle Road, Colombo 04",
      vehicleModel: "Nissan Leaf",
      licensePlate: "XYZ-5678",
      status: "Active",
      registeredDate: "2024-09-20"
    },
    {
      nic: "456789123V",
      firstName: "Mike",
      lastName: "Johnson", 
      email: "mike.johnson@email.com",
      phone: "+94773456789",
      address: "789 Kandy Road, Kandy",
      vehicleModel: "BMW i3",
      licensePlate: "DEF-9012",
      status: "Inactive",
      registeredDate: "2024-08-10"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formData, setFormData] = useState({
    nic: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    vehicleModel: "",
    licensePlate: "",
    status: "Active"
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingOwner) {
      // Update existing owner
      setOwners(prevOwners =>
        prevOwners.map(owner =>
          owner.nic === editingOwner.nic ? { ...formData, registeredDate: owner.registeredDate } : owner
        )
      );
    } else {
      // Check if NIC already exists
      const nicExists = owners.some(owner => owner.nic === formData.nic);
      if (nicExists) {
        alert("An owner with this NIC already exists!");
        return;
      }
      
      // Add new owner
      const newOwner = {
        ...formData,
        registeredDate: new Date().toISOString().split('T')[0]
      };
      setOwners(prevOwners => [...prevOwners, newOwner]);
    }
    
    closeModal();
  };

  const openModal = (owner = null) => {
    setEditingOwner(owner);
    setFormData(owner || {
      nic: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      vehicleModel: "",
      licensePlate: "",
      status: "Active"
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOwner(null);
    setFormData({
      nic: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      vehicleModel: "",
      licensePlate: "",
      status: "Active"
    });
  };

  const handleDelete = (nic) => {
    if (window.confirm("Are you sure you want to delete this EV owner? This action cannot be undone.")) {
      setOwners(prevOwners => prevOwners.filter(owner => owner.nic !== nic));
    }
  };

  const toggleStatus = (nic) => {
    setOwners(prevOwners =>
      prevOwners.map(owner =>
        owner.nic === nic 
          ? { ...owner, status: owner.status === "Active" ? "Inactive" : "Active" }
          : owner
      )
    );
  };

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = 
      owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.nic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || owner.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          color: '#1e293b'
        }}>
          EV Owner Management
        </h1>
        <p style={{ 
          color: '#64748b', 
          margin: 0, 
          fontSize: '16px' 
        }}>
          Create, update, and manage EV owner profiles using NIC as the primary key
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by name, NIC, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                flex: 1,
                minWidth: '200px',
                maxWidth: '300px'
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => openModal()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            + Add New Owner
          </button>
        </div>
      </div>

      {/* Owners List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            margin: 0,
            color: '#1e293b'
          }}>
            EV Owners ({filteredOwners.length} of {owners.length})
          </h2>
        </div>

        {filteredOwners.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#64748b',
            fontSize: '16px'
          }}>
            {searchTerm || statusFilter !== "All" ? "No owners match your search criteria." : "No EV owners found. Click 'Add New Owner' to get started."}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px', padding: '20px' }}>
            {filteredOwners.map((owner) => (
              <div
                key={owner.nic}
                style={{
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                        {owner.firstName} {owner.lastName}
                      </h3>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: owner.status === 'Active' ? '#16a34a' : '#dc2626',
                        backgroundColor: owner.status === 'Active' ? '#dcfce7' : '#fee2e2'
                      }}>
                        {owner.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                      <div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#64748b' }}>
                          <strong>NIC:</strong> {owner.nic}
                        </p>
                        <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#64748b' }}>
                          <strong>Email:</strong> {owner.email}
                        </p>
                        <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#64748b' }}>
                          <strong>Phone:</strong> {owner.phone}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#64748b' }}>
                          <strong>Vehicle:</strong> {owner.vehicleModel}
                        </p>
                        <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#64748b' }}>
                          <strong>License Plate:</strong> {owner.licensePlate}
                        </p>
                        <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#64748b' }}>
                          <strong>Registered:</strong> {owner.registeredDate}
                        </p>
                      </div>
                    </div>
                    
                    <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                      <strong>Address:</strong> {owner.address}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button
                      onClick={() => openModal(owner)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(owner.nic)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: owner.status === 'Active' ? '#f59e0b' : '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {owner.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(owner.nic)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Owner */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 24px 0', color: '#1e293b' }}>
              {editingOwner ? 'Edit EV Owner' : 'Add New EV Owner'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    NIC *
                  </label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleInputChange}
                    required
                    disabled={editingOwner}
                    placeholder="123456789V"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: editingOwner ? '#f3f4f6' : 'white'
                    }}
                  />
                  {editingOwner && (
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                      NIC cannot be changed
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+94771234567"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    required
                    placeholder="Tesla Model 3"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    License Plate *
                  </label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    required
                    placeholder="ABC-1234"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {editingOwner ? 'Update Owner' : 'Add Owner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
