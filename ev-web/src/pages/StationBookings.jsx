import { useState } from "react";

export default function StationBookings() {
  // Station Operator specific context (would be passed from props or context in real app)
  const operatorStationId = "STN001"; // Current operator's assigned station
  const operatorStationName = "Colombo City Center";

  // Local booking state for station bookings
  const [bookings, setBookings] = useState([
    {
      id: "BK001",
      customerId: "123456789V",
      customerName: "John Doe",
      customerEmail: "john.doe@email.com",
      customerPhone: "+94771234567",
      stationId: "STN001",
      stationName: "Colombo City Center",
      slotNumber: 3,
      bookingDate: "2024-10-05",
      timeSlot: "14:00-16:00",
      duration: 2,
      status: "Confirmed",
      totalCost: 140.00,
      createdAt: "2024-10-02T10:30:00",
      vehicleModel: "Tesla Model 3",
      licensePlate: "ABC-1234",
      arrivalTime: null,
      startTime: null,
      endTime: null,
      actualCost: null
    },
    {
      id: "BK002",
      customerId: "987654321V",
      customerName: "Jane Smith",
      customerEmail: "jane.smith@email.com",
      customerPhone: "+94772345678",
      stationId: "STN001",
      stationName: "Colombo City Center",
      slotNumber: 1,
      bookingDate: "2024-10-03",
      timeSlot: "09:00-11:00",
      duration: 2,
      status: "In Progress",
      totalCost: 140.00,
      createdAt: "2024-10-01T15:45:00",
      vehicleModel: "Nissan Leaf",
      licensePlate: "XYZ-5678",
      arrivalTime: "2024-10-03T09:05:00",
      startTime: "2024-10-03T09:10:00",
      endTime: null,
      actualCost: null
    }
  ]);

  // Local booking management functions
  const addBooking = (newBooking) => {
    setBookings(prev => [...prev, newBooking]);
  };

  const updateBooking = (bookingId, updates) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { ...booking, ...updates } : booking
    ));
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { ...booking, status: "Cancelled" } : booking
    ));
  };

  const confirmBooking = (bookingId) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { ...booking, status: "Confirmed" } : booking
    ));
  };

  const markArrival = (bookingId) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { 
        ...booking, 
        arrivalTime: new Date().toISOString(),
        status: "Confirmed"
      } : booking
    ));
  };

  const startCharging = (bookingId) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { 
        ...booking, 
        startTime: new Date().toISOString(),
        status: "In Progress"
      } : booking
    ));
  };

  const completeCharging = (bookingId, actualDuration, actualKwh, actualCost) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { 
        ...booking, 
        endTime: new Date().toISOString(),
        status: "Completed",
        actualCost: actualCost,
        actualDuration: actualDuration,
        actualKwh: actualKwh
      } : booking
    ));
  };

  const getBookingsByStation = (stationId) => {
    return bookings.filter(booking => booking.stationId === stationId);
  };

  const validateBookingConflict = (stationId, slotNumber, bookingDate, timeSlot, excludeBookingId = null) => {
    return bookings.some(booking => 
      booking.stationId === stationId &&
      booking.slotNumber === slotNumber &&
      booking.bookingDate === bookingDate &&
      booking.timeSlot === timeSlot &&
      booking.status !== "Cancelled" &&
      booking.id !== excludeBookingId
    );
  };

  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showStartCharging, setShowStartCharging] = useState(false);
  const [showCompleteCharging, setShowCompleteCharging] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    slotNumber: "",
    bookingDate: "",
    timeSlot: "",
    duration: "",
    vehicleModel: "",
    licensePlate: ""
  });

  const timeSlots = [
    "06:00-08:00", "08:00-10:00", "10:00-12:00", "12:00-14:00",
    "14:00-16:00", "16:00-18:00", "18:00-20:00", "20:00-22:00"
  ];

  const stationSlots = [1, 2, 3, 4, 5, 6]; // Station has 6 slots
  const pricePerKwh = 45.00;
  const sessionFee = 50.00;

  // Filter bookings for this station only
  const stationBookings = getBookingsByStation(operatorStationId);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateCost = (duration) => {
    return (pricePerKwh * duration * 30) + sessionFee; // Assuming 30kWh per hour
  };

  const validateBookingDate = (date) => {
    const today = new Date();
    const bookingDate = new Date(date);
    const diffTime = bookingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const canModifyBooking = (booking) => {
    const now = new Date();
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.timeSlot.split('-')[0]}:00`);
    const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= 12;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate booking date (7-day advance limit)
    if (!validateBookingDate(formData.bookingDate)) {
      alert("Bookings can only be made up to 7 days in advance!");
      return;
    }

    // Check for conflicts using context function
    const hasConflict = validateBookingConflict(
      operatorStationId,
      parseInt(formData.slotNumber),
      formData.bookingDate,
      formData.timeSlot,
      editingBooking?.id
    );

    if (hasConflict) {
      alert("This slot is already booked for the selected time. Please choose a different slot or time.");
      return;
    }

    const totalCost = calculateCost(parseFloat(formData.duration));

    if (editingBooking) {
      // Check if booking can be modified (12-hour rule)
      if (!canModifyBooking(editingBooking)) {
        alert("Bookings can only be modified at least 12 hours before the scheduled time!");
        return;
      }

      updateBooking(editingBooking.id, {
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        slotNumber: parseInt(formData.slotNumber),
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        duration: parseFloat(formData.duration),
        totalCost: totalCost,
        vehicleModel: formData.vehicleModel,
        licensePlate: formData.licensePlate
      });
    } else {
      const newBooking = {
        id: `BK${String(bookings.length + 1).padStart(3, '0')}`,
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        stationId: operatorStationId,
        stationName: operatorStationName,
        slotNumber: parseInt(formData.slotNumber),
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        duration: parseFloat(formData.duration),
        status: "Pending",
        totalCost: totalCost,
        createdAt: new Date().toISOString(),
        vehicleModel: formData.vehicleModel,
        licensePlate: formData.licensePlate,
        arrivalTime: null,
        startTime: null,
        endTime: null,
        actualCost: null
      };
      addBooking(newBooking);
    }
    
    closeModal();
  };

  const openModal = (booking = null) => {
    setEditingBooking(booking);
    if (booking) {
      setFormData({
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        slotNumber: booking.slotNumber.toString(),
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        duration: booking.duration.toString(),
        vehicleModel: booking.vehicleModel,
        licensePlate: booking.licensePlate
      });
    } else {
      setFormData({
        customerId: "", customerName: "", customerEmail: "", customerPhone: "",
        slotNumber: "", bookingDate: "", timeSlot: "",
        duration: "", vehicleModel: "", licensePlate: ""
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBooking(null);
  };

  const handleCancel = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!canModifyBooking(booking)) {
      alert("Bookings can only be cancelled at least 12 hours before the scheduled time!");
      return;
    }

    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBooking(bookingId);
    }
  };

  const filteredBookings = stationBookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.bookingDate === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed": return { bg: "#dcfce7", text: "#16a34a" };
      case "Pending": return { bg: "#fef3c7", text: "#d97706" };
      case "In Progress": return { bg: "#dbeafe", text: "#2563eb" };
      case "Completed": return { bg: "#f3e8ff", text: "#9333ea" };
      case "Cancelled": return { bg: "#fee2e2", text: "#dc2626" };
      default: return { bg: "#f3f4f6", text: "#6b7280" };
    }
  };

  const stats = {
    total: stationBookings.length,
    pending: stationBookings.filter(b => b.status === "Pending").length,
    confirmed: stationBookings.filter(b => b.status === "Confirmed").length,
    inProgress: stationBookings.filter(b => b.status === "In Progress").length,
    completed: stationBookings.filter(b => b.status === "Completed").length,
    cancelled: stationBookings.filter(b => b.status === "Cancelled").length
  };

  // Today's bookings for quick overview
  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = stationBookings.filter(b => b.bookingDate === today);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1e293b' }}>
          Station Bookings - {operatorStationName}
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '16px' }}>
          Manage bookings for your assigned charging station with real-time operations
        </p>
      </div>

      {/* Station Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Total</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{stats.total}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Today</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{todaysBookings.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Pending</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>{stats.pending}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Active</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{stats.inProgress}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Completed</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#9333ea', margin: 0 }}>{stats.completed}</p>
        </div>
      </div>

      {/* Today's Schedule Quick View */}
      {todaysBookings.length > 0 && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#1e293b' }}>
            Today's Schedule ({todaysBookings.length} bookings)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
            {todaysBookings.map(booking => {
              const statusColors = getStatusColor(booking.status);
              return (
                <div key={booking.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Slot {booking.slotNumber}</h4>
                    <span style={{ padding: '2px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: '600', color: statusColors.text, backgroundColor: statusColors.bg }}>
                      {booking.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>
                    <strong>Time:</strong> {booking.timeSlot}
                  </p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>
                    <strong>Customer:</strong> {booking.customerName}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    <strong>Vehicle:</strong> {booking.vehicleModel}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minWidth: '200px' }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
          <button
            onClick={() => openModal()}
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginLeft: 'auto' }}
          >
            + New Walk-in Booking
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
            Station Bookings ({filteredBookings.length})
          </h2>
        </div>

        {filteredBookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No bookings found for this station.
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {filteredBookings.map((booking) => {
              const statusColors = getStatusColor(booking.status);
              const canModify = canModifyBooking(booking);
              
              return (
                <div key={booking.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                          {booking.id} - Slot {booking.slotNumber}
                        </h3>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: statusColors.text, backgroundColor: statusColors.bg }}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '14px', color: '#64748b' }}>
                        <div>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Customer:</strong> {booking.customerName}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>NIC:</strong> {booking.customerId}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Phone:</strong> {booking.customerPhone}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Vehicle:</strong> {booking.vehicleModel}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>License:</strong> {booking.licensePlate}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Duration:</strong> {booking.duration}h</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Date:</strong> {booking.bookingDate}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Time:</strong> {booking.timeSlot}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Cost:</strong> Rs. {booking.totalCost.toFixed(2)}</p>
                        </div>
                        {(booking.arrivalTime || booking.startTime || booking.endTime) && (
                          <div>
                            {booking.arrivalTime && (
                              <p style={{ margin: '0 0 4px 0' }}><strong>Arrived:</strong> {new Date(booking.arrivalTime).toLocaleTimeString()}</p>
                            )}
                            {booking.startTime && (
                              <p style={{ margin: '0 0 4px 0' }}><strong>Started:</strong> {new Date(booking.startTime).toLocaleTimeString()}</p>
                            )}
                            {booking.endTime && (
                              <p style={{ margin: '0 0 4px 0' }}><strong>Completed:</strong> {new Date(booking.endTime).toLocaleTimeString()}</p>
                            )}
                            {booking.actualCost && (
                              <p style={{ margin: '0 0 4px 0' }}><strong>Final Cost:</strong> Rs. {booking.actualCost.toFixed(2)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                      {booking.status === "Pending" && (
                        <button onClick={() => confirmBooking(booking.id)} style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Confirm
                        </button>
                      )}
                      {booking.status === "Confirmed" && !booking.arrivalTime && (
                        <button onClick={() => markArrival(booking.id)} style={{ padding: '6px 12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Mark Arrival
                        </button>
                      )}
                      {booking.status === "Confirmed" && !booking.startTime && (
                        <button onClick={() => startCharging(booking.id)} style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Start Charging
                        </button>
                      )}
                      {booking.status === "In Progress" && (
                        <button onClick={() => {
                          setEditingBooking(booking);
                          setShowCompleteCharging(true);
                        }} style={{ padding: '6px 12px', backgroundColor: '#9333ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Complete
                        </button>
                      )}
                      {canModify && booking.status !== "Cancelled" && booking.status !== "Completed" && booking.status !== "In Progress" && (
                        <>
                          <button onClick={() => openModal(booking)} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            Edit
                          </button>
                          <button onClick={() => handleCancel(booking.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0', color: '#1e293b' }}>
              {editingBooking ? 'Edit Booking' : 'New Walk-in Booking'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
              Station: {operatorStationName}<br/>
              • Bookings can be made up to 7 days in advance<br/>
              • Modifications/cancellations require 12-hour notice
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Customer NIC *</label>
                  <input type="text" name="customerId" value={formData.customerId} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Customer Name *</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Email *</label>
                  <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Phone *</label>
                  <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Vehicle Model *</label>
                  <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>License Plate *</label>
                  <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Slot Number *</label>
                  <select name="slotNumber" value={formData.slotNumber} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="">Select Slot</option>
                    {stationSlots.map(slot => (
                      <option key={slot} value={slot}>Slot {slot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Duration (hrs) *</label>
                  <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} required min="0.5" max="8" step="0.5" style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Time Slot *</label>
                  <select name="timeSlot" value={formData.timeSlot} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="">Select Time</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Booking Date *</label>
                <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]} max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              {formData.duration && (
                <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', marginBottom: '16px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>
                    <strong>Estimated Cost: Rs. {calculateCost(parseFloat(formData.duration) || 0).toFixed(2)}</strong>
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                  {editingBooking ? 'Update' : 'Create'} Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Charging Modal */}
      {showCompleteCharging && editingBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 16px 0', color: '#1e293b' }}>
              Complete Charging Session
            </h2>
            <p style={{ color: '#64748b', margin: '0 0 16px 0' }}>
              Booking: {editingBooking.id} - {editingBooking.customerName}
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const actualDuration = parseFloat(formData.get('actualDuration'));
              const actualKwh = parseFloat(formData.get('actualKwh'));
              const actualCost = (pricePerKwh * actualKwh) + sessionFee;
              completeCharging(editingBooking.id, actualDuration, actualKwh, actualCost);
              setShowCompleteCharging(false);
              setEditingBooking(null);
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Actual Duration (hours) *</label>
                <input type="number" name="actualDuration" required min="0.1" max="12" step="0.1" defaultValue={editingBooking.duration} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>Energy Consumed (kWh) *</label>
                <input type="number" name="actualKwh" required min="1" max="100" step="0.1" defaultValue={editingBooking.duration * 30} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => {
                  setShowCompleteCharging(false);
                  setEditingBooking(null);
                }} style={{ padding: '8px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#9333ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                  Complete Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
