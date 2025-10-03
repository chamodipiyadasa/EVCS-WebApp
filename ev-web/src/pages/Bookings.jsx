import { useState } from "react";
import ValidatedInput from "../components/ValidatedInput";
import { 
  validateNIC, 
  validateEmail, 
  validatePhoneNumber, 
  validateName, 
  validateVehicleModel, 
  validateLicensePlate, 
  validateDuration, 
  validateSlotNumber, 
  validateBookingDate,
  formatPhoneNumber,
  formatLicensePlate
} from "../utils/validation";

export default function Bookings() {
  // Local booking state
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
      stationId: "STN002",
      stationName: "Kandy Shopping Complex",
      slotNumber: 1,
      bookingDate: "2024-10-03",
      timeSlot: "09:00-11:00",
      duration: 2,
      status: "In Progress",
      totalCost: 95.00,
      createdAt: "2024-10-01T15:45:00",
      vehicleModel: "Nissan Leaf",
      licensePlate: "XYZ-5678",
      arrivalTime: "2024-10-03T09:05:00",
      startTime: "2024-10-03T09:10:00",
      endTime: null,
      actualCost: null
    },
    {
      id: "BK003",
      customerId: "456789123V",
      customerName: "Mike Johnson",
      customerEmail: "mike.johnson@email.com",
      customerPhone: "+94773456789",
      stationId: "STN001",
      stationName: "Colombo City Center",
      slotNumber: 5,
      bookingDate: "2024-10-08",
      timeSlot: "18:00-20:00",
      duration: 2,
      status: "Pending",
      totalCost: 140.00,
      createdAt: "2024-10-02T09:15:00",
      vehicleModel: "BMW i3",
      licensePlate: "DEF-9012",
      arrivalTime: null,
      startTime: null,
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

  const changeStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
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
  const [stationFilter, setStationFilter] = useState("All");
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    stationId: "",
    slotNumber: "",
    bookingDate: "",
    timeSlot: "",
    duration: "",
    vehicleModel: "",
    licensePlate: ""
  });

  // Available stations (from context)
  const stations = [
    { id: "STN001", name: "Colombo City Center", slots: 6, pricePerKwh: 45.00, sessionFee: 50.00 },
    { id: "STN002", name: "Kandy Shopping Complex", slots: 4, pricePerKwh: 35.00, sessionFee: 25.00 },
    { id: "STN003", name: "Galle Highway Rest Stop", slots: 8, pricePerKwh: 40.00, sessionFee: 40.00 }
  ];

  const timeSlots = [
    "06:00-08:00", "08:00-10:00", "10:00-12:00", "12:00-14:00",
    "14:00-16:00", "16:00-18:00", "18:00-20:00", "20:00-22:00"
  ];

  // Updated form change handler with validation
  const handleInputChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
    
    // Clear previous error for this field
    if (formErrors[fieldName]) {
      setFormErrors({ ...formErrors, [fieldName]: '' });
    }
  };

  // Validate entire form
  const validateForm = () => {
    const errors = {};
    
    // Validate each field
    const nicValidation = validateNIC(formData.customerId);
    if (!nicValidation.isValid) errors.customerId = nicValidation.message;
    
    const nameValidation = validateName(formData.customerName, "Customer name");
    if (!nameValidation.isValid) errors.customerName = nameValidation.message;
    
    const emailValidation = validateEmail(formData.customerEmail);
    if (!emailValidation.isValid) errors.customerEmail = emailValidation.message;
    
    const phoneValidation = validatePhoneNumber(formData.customerPhone);
    if (!phoneValidation.isValid) errors.customerPhone = phoneValidation.message;
    
    const vehicleValidation = validateVehicleModel(formData.vehicleModel);
    if (!vehicleValidation.isValid) errors.vehicleModel = vehicleValidation.message;
    
    const plateValidation = validateLicensePlate(formData.licensePlate);
    if (!plateValidation.isValid) errors.licensePlate = plateValidation.message;
    
    const durationValidation = validateDuration(formData.duration);
    if (!durationValidation.isValid) errors.duration = durationValidation.message;
    
    const slotValidation = validateSlotNumber(formData.slotNumber, 8);
    if (!slotValidation.isValid) errors.slotNumber = slotValidation.message;
    
    const dateValidation = validateBookingDate(formData.bookingDate);
    if (!dateValidation.isValid) errors.bookingDate = dateValidation.message;
    
    // Required field validations
    if (!formData.stationId) errors.stationId = "Station is required";
    if (!formData.timeSlot) errors.timeSlot = "Time slot is required";
    
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  const calculateCost = (stationId, duration) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return 0;
    return (station.pricePerKwh * duration * 30) + station.sessionFee; // Assuming 30kWh per hour
  };

  const canModifyBooking = (booking) => {
    const now = new Date();
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.timeSlot.split('-')[0]}:00`);
    const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= 12;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the entire form
    if (!validateForm()) {
      alert("Please fix the errors in the form before submitting.");
      return;
    }

    // Check for conflicts using context function
    const hasConflict = validateBookingConflict(
      formData.stationId,
      parseInt(formData.slotNumber),
      formData.bookingDate,
      formData.timeSlot,
      editingBooking?.id
    );

    if (hasConflict) {
      alert("This slot is already booked for the selected time. Please choose a different slot or time.");
      return;
    }

    const totalCost = calculateCost(formData.stationId, parseFloat(formData.duration));
    const selectedStation = stations.find(s => s.id === formData.stationId);

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
        stationId: formData.stationId,
        stationName: selectedStation.name,
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
        stationId: formData.stationId,
        stationName: selectedStation.name,
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
    setFormErrors({}); // Reset validation errors
    setIsFormValid(false); // Reset form validity
    
    if (booking) {
      setFormData({
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        stationId: booking.stationId,
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
        stationId: "", slotNumber: "", bookingDate: "", timeSlot: "",
        duration: "", vehicleModel: "", licensePlate: ""
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBooking(null);
    setFormErrors({}); // Reset validation errors
    setIsFormValid(false); // Reset form validity
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.stationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.bookingDate === dateFilter;
    const matchesStation = stationFilter === "All" || booking.stationId === stationFilter;
    
    return matchesSearch && matchesStatus && matchesDate && matchesStation;
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
    total: bookings.length,
    pending: bookings.filter(b => b.status === "Pending").length,
    confirmed: bookings.filter(b => b.status === "Confirmed").length,
    inProgress: bookings.filter(b => b.status === "In Progress").length,
    completed: bookings.filter(b => b.status === "Completed").length,
    cancelled: bookings.filter(b => b.status === "Cancelled").length
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1e293b' }}>
          Booking Management
        </h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '16px' }}>
          Manage EV charging bookings with 7-day advance booking and 12-hour modification policies
        </p>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Total</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{stats.total}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Pending</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>{stats.pending}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Confirmed</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>{stats.confirmed}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Active</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{stats.inProgress}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>Cancelled</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>{stats.cancelled}</p>
        </div>
      </div>

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
          <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
            <option value="All">All Stations</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>{station.name}</option>
            ))}
          </select>
          <button
            onClick={() => openModal()}
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', marginLeft: 'auto' }}
          >
            + New Booking
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
            Bookings ({filteredBookings.length})
          </h2>
        </div>

        {filteredBookings.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No bookings found.
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
                          {booking.id} - {booking.customerName}
                        </h3>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: statusColors.text, backgroundColor: statusColors.bg }}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '14px', color: '#64748b' }}>
                        <div>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Customer:</strong> {booking.customerName} ({booking.customerId})</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Contact:</strong> {booking.customerEmail}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Vehicle:</strong> {booking.vehicleModel} ({booking.licensePlate})</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Station:</strong> {booking.stationName}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Date & Time:</strong> {booking.bookingDate} at {booking.timeSlot}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Slot:</strong> #{booking.slotNumber} | <strong>Duration:</strong> {booking.duration}h</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Total Cost:</strong> Rs. {booking.totalCost.toFixed(2)}</p>
                          <p style={{ margin: '0 0 4px 0' }}><strong>Created:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: canModify ? '#16a34a' : '#dc2626' }}>
                            {canModify ? "✓ Can modify/cancel" : "⚠ Cannot modify (< 12h)"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                      {booking.status === "Pending" && (
                        <button onClick={() => changeStatus(booking.id, "Confirmed")} style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Confirm
                        </button>
                      )}
                      {booking.status === "Confirmed" && (
                        <button onClick={() => changeStatus(booking.id, "In Progress")} style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Start
                        </button>
                      )}
                      {booking.status === "In Progress" && (
                        <button onClick={() => changeStatus(booking.id, "Completed")} style={{ padding: '6px 12px', backgroundColor: '#9333ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Complete
                        </button>
                      )}
                      {canModify && booking.status !== "Cancelled" && booking.status !== "Completed" && (
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0', color: '#1e293b' }}>
              {editingBooking ? 'Edit Booking' : 'Create New Booking'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
              • Bookings can be made up to 7 days in advance<br/>
              • Modifications/cancellations require 12-hour notice
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Customer NIC"
                  name="customerId"
                  type="text"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  validator={validateNIC}
                  required={true}
                  placeholder="123456789V or 200012345678"
                  showFormatHint={true}
                />
                
                <ValidatedInput
                  label="Customer Name"
                  name="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  validator={(value) => validateName(value, "Customer name")}
                  required={true}
                  placeholder="Enter full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Email"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  validator={validateEmail}
                  required={true}
                  placeholder="customer@example.com"
                />
                
                <ValidatedInput
                  label="Phone Number"
                  name="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  validator={validatePhoneNumber}
                  required={true}
                  placeholder="+94771234567"
                  showFormatHint={true}
                  formatFunction={formatPhoneNumber}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Vehicle Model"
                  name="vehicleModel"
                  type="text"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  validator={validateVehicleModel}
                  required={true}
                  placeholder="Tesla Model 3"
                />
                
                <ValidatedInput
                  label="License Plate"
                  name="licensePlate"
                  type="text"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  validator={validateLicensePlate}
                  required={true}
                  placeholder="ABC-1234"
                  showFormatHint={true}
                  formatFunction={formatLicensePlate}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ValidatedInput
                  label="Station"
                  name="stationId"
                  type="select"
                  value={formData.stationId}
                  onChange={handleInputChange}
                  validator={(value) => value ? { isValid: true, message: '' } : { isValid: false, message: 'Station is required' }}
                  required={true}
                  options={stations.map(station => ({ value: station.id, label: station.name }))}
                  placeholder="Select station"
                />
                
                <ValidatedInput
                  label="Slot Number"
                  name="slotNumber"
                  type="number"
                  value={formData.slotNumber}
                  onChange={handleInputChange}
                  validator={(value) => validateSlotNumber(value, 8)}
                  required={true}
                  min="1"
                  max="8"
                  placeholder="1"
                />
                
                <ValidatedInput
                  label="Duration (hours)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  validator={validateDuration}
                  required={true}
                  min="0.5"
                  max="8"
                  step="0.5"
                  placeholder="2.0"
                  showFormatHint={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  label="Booking Date"
                  name="bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  validator={validateBookingDate}
                  required={true}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                
                <ValidatedInput
                  label="Time Slot"
                  name="timeSlot"
                  type="select"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  validator={(value) => value ? { isValid: true, message: '' } : { isValid: false, message: 'Time slot is required' }}
                  required={true}
                  options={timeSlots.map(slot => ({ value: slot, label: slot }))}
                  placeholder="Select time slot"
                />
              </div>

              {formData.stationId && formData.duration && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    <strong>Estimated Cost: Rs. {calculateCost(formData.stationId, parseFloat(formData.duration) || 0).toFixed(2)}</strong>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!isFormValid}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFormValid 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {editingBooking ? 'Update' : 'Create'} Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
