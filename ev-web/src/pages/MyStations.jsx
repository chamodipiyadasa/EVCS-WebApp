import { useState } from "react";

export default function MyStations() {
  const stationId = localStorage.getItem("stationId") || "N/A";
  
  const [stationData, setStationData] = useState({
    id: stationId,
    name: `EV Charging Station ${stationId}`,
    location: "Downtown Mall, Level B1, Section A",
    type: "AC/DC Fast Charging",
    totalSlots: 8,
    activeSlots: 6,
    maintenanceSlots: 1,
    availableSlots: 1,
    operatingHours: "24/7",
    status: "Online",
    lastMaintenance: "2024-09-15",
    nextMaintenance: "2024-10-15"
  });

  const [slots, setSlots] = useState([
    { id: "A1", type: "AC", power: "22kW", status: "Occupied", customer: "John Doe", startTime: "09:00", estimatedEnd: "10:30" },
    { id: "A2", type: "AC", power: "22kW", status: "Available", customer: null, startTime: null, estimatedEnd: null },
    { id: "A3", type: "DC", power: "50kW", status: "Reserved", customer: "Mike Johnson", startTime: "11:30", estimatedEnd: "13:00" },
    { id: "A4", type: "AC", power: "22kW", status: "Available", customer: null, startTime: null, estimatedEnd: null },
    { id: "B1", type: "DC", power: "50kW", status: "Reserved", customer: "Sarah Wilson", startTime: "14:00", estimatedEnd: "15:30" },
    { id: "B2", type: "AC", power: "22kW", status: "Maintenance", customer: null, startTime: null, estimatedEnd: null },
    { id: "B3", type: "DC", power: "50kW", status: "Occupied", customer: "Emma Davis", startTime: "13:00", estimatedEnd: "16:00" },
    { id: "B4", type: "DC", power: "50kW", status: "Occupied", customer: "Tom Brown", startTime: "15:00", estimatedEnd: "17:30" }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Occupied": return "#22c55e";
      case "Available": return "#3b82f6";
      case "Reserved": return "#f59e0b";
      case "Maintenance": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Occupied": return "●";
      case "Available": return "○";
      case "Reserved": return "◐";
      case "Maintenance": return "⚠";
      default: return "?";
    }
  };

  const handleSlotAction = (slotId, action) => {
    setSlots(prevSlots => 
      prevSlots.map(slot => {
        if (slot.id === slotId) {
          switch (action) {
            case "maintenance":
              return { ...slot, status: "Maintenance", customer: null, startTime: null, estimatedEnd: null };
            case "available":
              return { ...slot, status: "Available", customer: null, startTime: null, estimatedEnd: null };
            default:
              return slot;
          }
        }
        return slot;
      })
    );
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
          My Station Details
        </h1>
        <p style={{ 
          color: '#64748b', 
          margin: 0, 
          fontSize: '16px' 
        }}>
          Manage your charging station and monitor slot status
        </p>
      </div>

      {/* Station Overview */}
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              margin: '0 0 16px 0',
              color: '#1e293b'
            }}>
              {stationData.name}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', marginRight: '8px', color: '#64748b' }}>●</span>
                <span style={{ color: '#64748b' }}>{stationData.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', marginRight: '8px', color: '#64748b' }}>▤</span>
                <span style={{ color: '#64748b' }}>{stationData.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', marginRight: '8px', color: '#64748b' }}>○</span>
                <span style={{ color: '#64748b' }}>Operating Hours: {stationData.operatingHours}</span>
              </div>
            </div>
          </div>
          
          <div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: stationData.status === 'Online' ? '#dcfce7' : '#fee2e2',
              borderRadius: '8px',
              border: `1px solid ${stationData.status === 'Online' ? '#bbf7d0' : '#fecaca'}`,
              marginBottom: '16px'
            }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: stationData.status === 'Online' ? '#16a34a' : '#dc2626',
                marginBottom: '4px'
              }}>
                {stationData.status === 'Online' ? '●' : '●'} {stationData.status}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Station Status
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{stationData.totalSlots}</div>
                <div style={{ color: '#64748b' }}>Total Slots</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>{stationData.activeSlots}</div>
                <div style={{ color: '#64748b' }}>Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charging Slots */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          margin: '0 0 20px 0',
          color: '#1e293b'
        }}>
          Charging Slots Status
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {slots.map((slot) => (
            <div
              key={slot.id}
              style={{
                padding: '20px',
                border: `2px solid ${getStatusColor(slot.status)}30`,
                borderRadius: '12px',
                backgroundColor: `${getStatusColor(slot.status)}10`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px', marginRight: '12px' }}>
                    {getStatusIcon(slot.status)}
                  </span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Slot {slot.id}</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {slot.type} • {slot.power}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: getStatusColor(slot.status),
                  backgroundColor: `${getStatusColor(slot.status)}30`
                }}>
                  {slot.status}
                </div>
              </div>

              {slot.customer && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Customer:</div>
                  <div style={{ fontWeight: '500' }}>{slot.customer}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {slot.startTime} - {slot.estimatedEnd}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {slot.status === "Available" && (
                  <button
                    onClick={() => handleSlotAction(slot.id, "maintenance")}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Set Maintenance
                  </button>
                )}
                {slot.status === "Maintenance" && (
                  <button
                    onClick={() => handleSlotAction(slot.id, "available")}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Info */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        marginTop: '24px'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          margin: '0 0 16px 0',
          color: '#1e293b'
        }}>
          Maintenance Schedule
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Last Maintenance:</div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>{stationData.lastMaintenance}</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Next Scheduled:</div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#f59e0b' }}>{stationData.nextMaintenance}</div>
          </div>
        </div>
      </div>
    </div>
  );
}