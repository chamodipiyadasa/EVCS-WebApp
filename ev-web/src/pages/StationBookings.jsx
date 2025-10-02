import { useState } from "react";

export default function StationBookings() {
  const stationId = localStorage.getItem("stationId") || "N/A";
  
  const [bookings, setBookings] = useState([
    {
      id: "BK001",
      customerName: "John Doe",
      customerEmail: "john.doe@email.com",
      customerPhone: "+1-555-0123",
      slot: "A1",
      date: "2024-10-02",
      startTime: "09:00",
      endTime: "10:30",
      duration: "1.5 hours",
      status: "Active",
      vehicleModel: "Tesla Model 3",
      licensePlate: "ABC-123",
      chargeType: "AC",
      estimatedCost: "$15.50",
      createdAt: "2024-10-01 14:30"
    },
    {
      id: "BK002",
      customerName: "Jane Smith",
      customerEmail: "jane.smith@email.com",
      customerPhone: "+1-555-0124",
      slot: "B2",
      date: "2024-10-02",
      startTime: "10:00",
      endTime: "11:00",
      duration: "1 hour",
      status: "Completed",
      vehicleModel: "Nissan Leaf",
      licensePlate: "XYZ-789",
      chargeType: "AC",
      estimatedCost: "$8.00",
      createdAt: "2024-10-01 16:45"
    },
    {
      id: "BK003",
      customerName: "Mike Johnson",
      customerEmail: "mike.johnson@email.com",
      customerPhone: "+1-555-0125",
      slot: "A3",
      date: "2024-10-02",
      startTime: "11:30",
      endTime: "13:00",
      duration: "1.5 hours",
      status: "Pending",
      vehicleModel: "BMW i3",
      licensePlate: "DEF-456",
      chargeType: "DC",
      estimatedCost: "$22.50",
      createdAt: "2024-10-02 08:15"
    },
    {
      id: "BK004",
      customerName: "Sarah Wilson",
      customerEmail: "sarah.wilson@email.com",
      customerPhone: "+1-555-0126",
      slot: "B1",
      date: "2024-10-02",
      startTime: "14:00",
      endTime: "15:30",
      duration: "1.5 hours",
      status: "Pending",
      vehicleModel: "Audi e-tron",
      licensePlate: "GHI-789",
      chargeType: "DC",
      estimatedCost: "$25.00",
      createdAt: "2024-10-02 09:30"
    },
    {
      id: "BK005",
      customerName: "Emma Davis",
      customerEmail: "emma.davis@email.com",
      customerPhone: "+1-555-0127",
      slot: "B3",
      date: "2024-10-02",
      startTime: "13:00",
      endTime: "16:00",
      duration: "3 hours",
      status: "Active",
      vehicleModel: "Volkswagen ID.4",
      licensePlate: "JKL-012",
      chargeType: "DC",
      estimatedCost: "$45.00",
      createdAt: "2024-10-01 20:15"
    }
  ]);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "#22c55e";
      case "Pending": return "#f59e0b";
      case "Completed": return "#6b7280";
      case "Cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active": return "●";
      case "Pending": return "◐";
      case "Completed": return "✓";
      case "Cancelled": return "✗";
      default: return "?";
    }
  };

  const filteredBookings = filterStatus === "All" 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );
    setSelectedBooking(null);
  };

  const StatusBadge = ({ status }) => (
    <span style={{
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      color: getStatusColor(status),
      backgroundColor: `${getStatusColor(status)}20`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {getStatusIcon(status)} {status}
    </span>
  );

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          color: '#1e293b'
        }}>
          Station Bookings
        </h1>
        <p style={{ 
          color: '#64748b', 
          margin: 0, 
          fontSize: '16px' 
        }}>
          Manage all bookings for Station {stationId}
        </p>
      </div>

      {/* Booking Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        {["All", "Active", "Pending", "Completed"].map(status => {
          const count = status === "All" ? bookings.length : bookings.filter(b => b.status === status).length;
          return (
            <div
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: filterStatus === status ? '2px solid #2563eb' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{count}</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>{status} Bookings</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookings List */}
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
            {filterStatus} Bookings ({filteredBookings.length})
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                padding: '20px',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => setSelectedBooking(booking)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                    {booking.customerName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {booking.vehicleModel} • {booking.licensePlate}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Booking ID: {booking.id}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    Slot {booking.slot}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {booking.chargeType} Charging
                  </div>
                </div>
                
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {booking.date}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {booking.startTime} - {booking.endTime}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#16a34a', marginBottom: '4px' }}>
                    {booking.estimatedCost}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {booking.duration}
                  </div>
                </div>
                
                <StatusBadge status={booking.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
                Booking Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
                  Customer Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Name</div>
                    <div style={{ fontWeight: '500' }}>{selectedBooking.customerName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Email</div>
                    <div>{selectedBooking.customerEmail}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Phone</div>
                    <div>{selectedBooking.customerPhone}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
                  Vehicle Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Model</div>
                    <div style={{ fontWeight: '500' }}>{selectedBooking.vehicleModel}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>License Plate</div>
                    <div>{selectedBooking.licensePlate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Charge Type</div>
                    <div>{selectedBooking.chargeType}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
                Booking Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Slot</div>
                  <div style={{ fontWeight: '500' }}>{selectedBooking.slot}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Date & Time</div>
                  <div style={{ fontWeight: '500' }}>{selectedBooking.date}</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {selectedBooking.startTime} - {selectedBooking.endTime}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Status</div>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>
            </div>

            {selectedBooking.status === "Pending" && (
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleStatusChange(selectedBooking.id, "Active")}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Start Session
                </button>
                <button
                  onClick={() => handleStatusChange(selectedBooking.id, "Cancelled")}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel Booking
                </button>
              </div>
            )}

            {selectedBooking.status === "Active" && (
              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => handleStatusChange(selectedBooking.id, "Completed")}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  End Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}