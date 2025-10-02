import { useState, useEffect } from "react";

export default function StationOperatorDashboard() {
  const userName = localStorage.getItem("userName") || "Station Operator";
  const stationId = localStorage.getItem("stationId") || "N/A";
  
  // Mock data for demonstration
  const [dashboardData, setDashboardData] = useState({
    stationInfo: {
      name: `EV Station ${stationId}`,
      location: "Downtown Mall, Level B1",
      totalSlots: 8,
      activeSlots: 6,
      availableSlots: 2,
      status: "Online"
    },
    todayStats: {
      totalBookings: 12,
      activeBookings: 3,
      completedBookings: 7,
      pendingBookings: 2,
      revenue: 450.75
    },
    recentBookings: [
      { id: "BK001", customerName: "John Doe", slot: "A1", startTime: "09:00", endTime: "10:30", status: "Active" },
      { id: "BK002", customerName: "Jane Smith", slot: "B2", startTime: "10:00", endTime: "11:00", status: "Completed" },
      { id: "BK003", customerName: "Mike Johnson", slot: "A3", startTime: "11:30", endTime: "13:00", status: "Pending" },
      { id: "BK004", customerName: "Sarah Wilson", slot: "B1", startTime: "14:00", endTime: "15:30", status: "Pending" }
    ],
    slotStatus: [
      { slot: "A1", status: "Occupied", customer: "John Doe", endTime: "10:30" },
      { slot: "A2", status: "Available", customer: null, endTime: null },
      { slot: "A3", status: "Reserved", customer: "Mike Johnson", endTime: "13:00" },
      { slot: "A4", status: "Available", customer: null, endTime: null },
      { slot: "B1", status: "Reserved", customer: "Sarah Wilson", endTime: "15:30" },
      { slot: "B2", status: "Maintenance", customer: null, endTime: null },
      { slot: "B3", status: "Occupied", customer: "Emma Davis", endTime: "16:00" },
      { slot: "B4", status: "Occupied", customer: "Tom Brown", endTime: "17:30" }
    ]
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "Occupied":
        return "#22c55e";
      case "Available":
        return "#3b82f6";
      case "Pending":
      case "Reserved":
        return "#f59e0b";
      case "Completed":
        return "#6b7280";
      case "Maintenance":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
      case "Occupied":
        return "●";
      case "Available":
        return "○";
      case "Pending":
      case "Reserved":
        return "◐";
      case "Completed":
        return "✓";
      case "Maintenance":
        return "⚠";
      default:
        return "?";
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          color: '#1e293b'
        }}>
          Welcome back, {userName.split(' ')[0]}!
        </h1>
        <p style={{ 
          color: '#64748b', 
          margin: 0, 
          fontSize: '16px' 
        }}>
          Here's what's happening at your station today
        </p>
      </div>

      {/* Station Overview Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                Total Bookings Today
              </h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>
                {dashboardData.todayStats.totalBookings}
              </p>
            </div>
            <div style={{ fontSize: '32px', color: '#2563eb' }}>■</div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                Active Sessions
              </h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>
                {dashboardData.todayStats.activeBookings}
              </p>
            </div>
            <div style={{ fontSize: '32px', color: '#22c55e' }}>●</div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                Available Slots
              </h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                {dashboardData.stationInfo.availableSlots}
              </p>
            </div>
            <div style={{ fontSize: '32px', color: '#3b82f6' }}>□</div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                Revenue Today
              </h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>
                ${dashboardData.todayStats.revenue}
              </p>
            </div>
            <div style={{ fontSize: '32px', color: '#16a34a' }}>$</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Charging Slots Status */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Charging Slots Status
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {dashboardData.slotStatus.map((slot) => (
              <div
                key={slot.slot}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: `2px solid ${getStatusColor(slot.status)}20`,
                  backgroundColor: `${getStatusColor(slot.status)}10`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>
                    {getStatusIcon(slot.status)}
                  </span>
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>
                    Slot {slot.slot}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <div style={{ 
                    color: getStatusColor(slot.status), 
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {slot.status}
                  </div>
                  {slot.customer && (
                    <div>Customer: {slot.customer}</div>
                  )}
                  {slot.endTime && (
                    <div>Until: {slot.endTime}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Recent Bookings
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dashboardData.recentBookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {booking.customerName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Slot {booking.slot} • {booking.startTime} - {booking.endTime}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: getStatusColor(booking.status),
                    backgroundColor: `${getStatusColor(booking.status)}20`
                  }}>
                    {booking.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}