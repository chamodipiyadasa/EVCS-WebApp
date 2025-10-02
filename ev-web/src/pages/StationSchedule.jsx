import { useState } from "react";

export default function StationSchedule() {
  const stationId = localStorage.getItem("stationId") || "N/A";
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();
  
  // Time slots for the day (24-hour operation)
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const slots = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"];

  // Mock schedule data
  const [scheduleData, setScheduleData] = useState({
    "2024-10-02": {
      "A1": {
        "09:00": { customer: "John Doe", status: "booked", id: "BK001" },
        "10:00": { customer: "John Doe", status: "booked", id: "BK001" }
      },
      "A3": {
        "11:00": { customer: "Mike Johnson", status: "booked", id: "BK003" },
        "12:00": { customer: "Mike Johnson", status: "booked", id: "BK003" }
      },
      "B1": {
        "14:00": { customer: "Sarah Wilson", status: "booked", id: "BK004" },
        "15:00": { customer: "Sarah Wilson", status: "booked", id: "BK004" }
      },
      "B2": {
        "08:00": { customer: null, status: "maintenance", id: null },
        "09:00": { customer: null, status: "maintenance", id: null },
        "10:00": { customer: null, status: "maintenance", id: null }
      },
      "B3": {
        "13:00": { customer: "Emma Davis", status: "booked", id: "BK005" },
        "14:00": { customer: "Emma Davis", status: "booked", id: "BK005" },
        "15:00": { customer: "Emma Davis", status: "booked", id: "BK005" }
      },
      "B4": {
        "15:00": { customer: "Tom Brown", status: "booked", id: "BK006" },
        "16:00": { customer: "Tom Brown", status: "booked", id: "BK006" },
        "17:00": { customer: "Tom Brown", status: "booked", id: "BK006" }
      }
    },
    "2024-10-03": {
      "A2": {
        "10:00": { customer: "Alice Cooper", status: "booked", id: "BK007" },
        "11:00": { customer: "Alice Cooper", status: "booked", id: "BK007" }
      },
      "B1": {
        "16:00": { customer: "Bob Smith", status: "booked", id: "BK008" }
      }
    }
  });

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const getSlotStatus = (date, slot, time) => {
    const dateKey = formatDate(date);
    const dayData = scheduleData[dateKey];
    
    if (!dayData || !dayData[slot] || !dayData[slot][time]) {
      return { status: "available", customer: null, id: null };
    }
    
    return dayData[slot][time];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "#e5e7eb";
      case "booked": return "#fef3c7";
      case "maintenance": return "#fee2e2";
      default: return "#e5e7eb";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "available": return "#6b7280";
      case "booked": return "#d97706";
      case "maintenance": return "#dc2626";
      default: return "#6b7280";
    }
  };

  const handleSlotClick = (date, slot, time, slotData) => {
    setSelectedSlot({
      date: formatDate(date),
      displayDate: formatDisplayDate(date),
      slot,
      time,
      ...slotData
    });
  };

  const handleStatusChange = (date, slot, time, newStatus) => {
    setScheduleData(prev => {
      const updated = { ...prev };
      if (!updated[date]) updated[date] = {};
      if (!updated[date][slot]) updated[date][slot] = {};
      
      if (newStatus === "available") {
        delete updated[date][slot][time];
      } else {
        updated[date][slot][time] = {
          customer: null,
          status: newStatus,
          id: null
        };
      }
      
      return updated;
    });
    setSelectedSlot(null);
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
          Station Schedule
        </h1>
        <p style={{ 
          color: '#64748b', 
          margin: 0, 
          fontSize: '16px' 
        }}>
          Manage slot availability and schedules for Station {stationId}
        </p>
      </div>

      {/* Date Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          {dates.map((date, index) => (
            <button
              key={index}
              onClick={() => setCurrentDate(date)}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: formatDate(date) === formatDate(currentDate) ? '#2563eb' : 'white',
                color: formatDate(date) === formatDate(currentDate) ? 'white' : '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <div>{formatDisplayDate(date)}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Legend:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: getStatusColor("available"), 
              borderRadius: '4px' 
            }}></div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: getStatusColor("booked"), 
              borderRadius: '4px' 
            }}></div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Booked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: getStatusColor("maintenance"), 
              borderRadius: '4px' 
            }}></div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
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
            Schedule for {formatDisplayDate(currentDate)} - {currentDate.toLocaleDateString()}
          </h2>
        </div>

        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#1e293b',
                  borderBottom: '1px solid #e2e8f0',
                  minWidth: '80px'
                }}>
                  Time
                </th>
                {slots.map(slot => (
                  <th key={slot} style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#1e293b',
                    borderBottom: '1px solid #e2e8f0',
                    minWidth: '100px'
                  }}>
                    Slot {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td style={{ 
                    padding: '8px 12px', 
                    fontWeight: '500',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: '#fafafa'
                  }}>
                    {time}
                  </td>
                  {slots.map(slot => {
                    const slotData = getSlotStatus(currentDate, slot, time);
                    return (
                      <td
                        key={slot}
                        onClick={() => handleSlotClick(currentDate, slot, time, slotData)}
                        style={{
                          padding: '4px',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          backgroundColor: getStatusColor(slotData.status)
                        }}
                      >
                        <div style={{
                          padding: '8px',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '11px',
                          color: getStatusTextColor(slotData.status),
                          fontWeight: '500',
                          minHeight: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {slotData.status === "booked" && slotData.customer ? (
                            <div>
                              <div>{slotData.customer.split(' ')[0]}</div>
                              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                                {slotData.id}
                              </div>
                            </div>
                          ) : slotData.status === "maintenance" ? (
                            "⚠"
                          ) : (
                            "Available"
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slot Detail Modal */}
      {selectedSlot && (
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
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
                Slot Management
              </h2>
              <button
                onClick={() => setSelectedSlot(null)}
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

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date</div>
                  <div style={{ fontWeight: '500' }}>{selectedSlot.displayDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Time</div>
                  <div style={{ fontWeight: '500' }}>{selectedSlot.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Slot</div>
                  <div style={{ fontWeight: '500' }}>{selectedSlot.slot}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Current Status</div>
                  <div style={{ 
                    fontWeight: '500',
                    color: getStatusTextColor(selectedSlot.status),
                    textTransform: 'capitalize'
                  }}>
                    {selectedSlot.status}
                  </div>
                </div>
              </div>

              {selectedSlot.customer && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Customer</div>
                  <div style={{ fontWeight: '500' }}>{selectedSlot.customer}</div>
                  {selectedSlot.id && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      Booking ID: {selectedSlot.id}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {selectedSlot.status !== "available" && (
                <button
                  onClick={() => handleStatusChange(selectedSlot.date, selectedSlot.slot, selectedSlot.time, "available")}
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
                  Mark Available
                </button>
              )}
              
              {selectedSlot.status !== "maintenance" && (
                <button
                  onClick={() => handleStatusChange(selectedSlot.date, selectedSlot.slot, selectedSlot.time, "maintenance")}
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
                  Set Maintenance
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}