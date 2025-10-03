// Comprehensive validation utilities for EV Charging Station Management System
// Includes Sri Lankan specific validations (NIC, Phone numbers)

/**
 * Sri Lankan National ID Card (NIC) Validation
 * Supports both old format (9 digits + V/X) and new format (12 digits)
 */
export const validateNIC = (nic) => {
  if (!nic) {
    return { isValid: false, message: "NIC is required" };
  }

  const nicTrimmed = nic.trim().toUpperCase();
  
  // Old NIC format: 9 digits followed by V or X
  const oldNICPattern = /^[0-9]{9}[VX]$/;
  // New NIC format: 12 digits
  const newNICPattern = /^[0-9]{12}$/;

  if (!oldNICPattern.test(nicTrimmed) && !newNICPattern.test(nicTrimmed)) {
    return { 
      isValid: false, 
      message: "Invalid NIC format. Use 9 digits + V/X (e.g., 123456789V) or 12 digits (e.g., 200012345678)" 
    };
  }

  // Additional validation for old format
  if (oldNICPattern.test(nicTrimmed)) {
    const days = parseInt(nicTrimmed.substring(2, 5));
    if (days < 1 || days > 366) {
      return { isValid: false, message: "Invalid day value in NIC" };
    }
  }

  // Additional validation for new format
  if (newNICPattern.test(nicTrimmed)) {
    const year = parseInt(nicTrimmed.substring(0, 4));
    const days = parseInt(nicTrimmed.substring(4, 7));
    
    if (year < 1900 || year > new Date().getFullYear()) {
      return { isValid: false, message: "Invalid birth year in NIC" };
    }
    
    if (days < 1 || days > 366) {
      return { isValid: false, message: "Invalid day value in NIC" };
    }
  }

  return { isValid: true, message: "" };
};

/**
 * Sri Lankan Phone Number Validation
 * Supports mobile (+94 7X XXXX XXXX) and landline (+94 XX XXX XXXX) formats
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { isValid: false, message: "Phone number is required" };
  }

  const phoneTrimmed = phone.trim().replace(/\s+/g, '');
  
  // Sri Lankan mobile number patterns
  const mobilePatterns = [
    /^\+947[01245678][0-9]{7}$/, // +94 7X XXXXXXX format
    /^07[01245678][0-9]{7}$/, // 07X XXXXXXX format
    /^7[01245678][0-9]{7}$/ // 7X XXXXXXX format
  ];

  // Sri Lankan landline patterns
  const landlinePatterns = [
    /^\+94[1-9][1-9][0-9]{7}$/, // +94 XX XXXXXXX
    /^0[1-9][1-9][0-9]{7}$/ // 0XX XXXXXXX
  ];

  const isValidMobile = mobilePatterns.some(pattern => pattern.test(phoneTrimmed));
  const isValidLandline = landlinePatterns.some(pattern => pattern.test(phoneTrimmed));

  if (!isValidMobile && !isValidLandline) {
    return { 
      isValid: false, 
      message: "Invalid phone number. Use +94XXXXXXXXX or 0XXXXXXXXX format" 
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Email Validation
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email.trim())) {
    return { isValid: false, message: "Invalid email format" };
  }

  if (email.length > 254) {
    return { isValid: false, message: "Email is too long" };
  }

  return { isValid: true, message: "" };
};

/**
 * License Plate Validation (Sri Lankan format)
 */
export const validateLicensePlate = (plate) => {
  if (!plate) {
    return { isValid: false, message: "License plate is required" };
  }

  const plateTrimmed = plate.trim().toUpperCase().replace(/\s+/g, '');
  
  // Sri Lankan license plate patterns
  const patterns = [
    /^[A-Z]{2,3}-[0-9]{4}$/, // ABC-1234 or AB-1234
    /^[A-Z]{2,3}[0-9]{4}$/, // ABC1234 or AB1234
    /^[0-9]{2}-[0-9]{4}$/, // 22-1234 (old format)
    /^[0-9]{6}$/ // 221234 (old format without dash)
  ];

  const isValid = patterns.some(pattern => pattern.test(plateTrimmed));

  if (!isValid) {
    return { 
      isValid: false, 
      message: "Invalid license plate format. Use ABC-1234 or AB-1234 format" 
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Vehicle Model Validation
 */
export const validateVehicleModel = (model) => {
  if (!model) {
    return { isValid: false, message: "Vehicle model is required" };
  }

  if (model.trim().length < 2) {
    return { isValid: false, message: "Vehicle model must be at least 2 characters" };
  }

  if (model.trim().length > 50) {
    return { isValid: false, message: "Vehicle model must be less than 50 characters" };
  }

  return { isValid: true, message: "" };
};

/**
 * Name Validation (for customer names, station names, etc.)
 */
export const validateName = (name, fieldName = "Name") => {
  if (!name) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters` };
  }

  if (name.trim().length > 100) {
    return { isValid: false, message: `${fieldName} must be less than 100 characters` };
  }

  // Only allow letters, spaces, dots, and hyphens
  const namePattern = /^[a-zA-Z\s.-]+$/;
  if (!namePattern.test(name.trim())) {
    return { 
      isValid: false, 
      message: `${fieldName} can only contain letters, spaces, dots, and hyphens` 
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Duration Validation (for booking duration)
 */
export const validateDuration = (duration) => {
  if (!duration) {
    return { isValid: false, message: "Duration is required" };
  }

  const durationNum = parseFloat(duration);
  
  if (isNaN(durationNum)) {
    return { isValid: false, message: "Duration must be a valid number" };
  }

  if (durationNum < 0.5) {
    return { isValid: false, message: "Minimum duration is 0.5 hours" };
  }

  if (durationNum > 8) {
    return { isValid: false, message: "Maximum duration is 8 hours" };
  }

  if (durationNum % 0.5 !== 0) {
    return { isValid: false, message: "Duration must be in 30-minute increments (0.5, 1.0, 1.5, etc.)" };
  }

  return { isValid: true, message: "" };
};

/**
 * Slot Number Validation
 */
export const validateSlotNumber = (slotNumber, maxSlots = 8) => {
  if (!slotNumber) {
    return { isValid: false, message: "Slot number is required" };
  }

  const slotNum = parseInt(slotNumber);
  
  if (isNaN(slotNum)) {
    return { isValid: false, message: "Slot number must be a valid number" };
  }

  if (slotNum < 1) {
    return { isValid: false, message: "Slot number must be at least 1" };
  }

  if (slotNum > maxSlots) {
    return { isValid: false, message: `Slot number cannot exceed ${maxSlots}` };
  }

  return { isValid: true, message: "" };
};

/**
 * Date Validation (for booking dates)
 */
export const validateBookingDate = (date) => {
  if (!date) {
    return { isValid: false, message: "Booking date is required" };
  }

  const bookingDate = new Date(date);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7); // 7 days advance booking limit

  today.setHours(0, 0, 0, 0);
  bookingDate.setHours(0, 0, 0, 0);
  maxDate.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    return { isValid: false, message: "Booking date cannot be in the past" };
  }

  if (bookingDate > maxDate) {
    return { isValid: false, message: "Bookings can only be made up to 7 days in advance" };
  }

  return { isValid: true, message: "" };
};

/**
 * Price Validation
 */
export const validatePrice = (price, fieldName = "Price") => {
  if (!price && price !== 0) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const priceNum = parseFloat(price);
  
  if (isNaN(priceNum)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }

  if (priceNum < 0) {
    return { isValid: false, message: `${fieldName} cannot be negative` };
  }

  if (priceNum > 10000) {
    return { isValid: false, message: `${fieldName} cannot exceed Rs. 10,000` };
  }

  return { isValid: true, message: "" };
};

/**
 * Station Location Validation
 */
export const validateLocation = (location) => {
  if (!location) {
    return { isValid: false, message: "Location is required" };
  }

  if (location.trim().length < 5) {
    return { isValid: false, message: "Location must be at least 5 characters" };
  }

  if (location.trim().length > 200) {
    return { isValid: false, message: "Location must be less than 200 characters" };
  }

  return { isValid: true, message: "" };
};

/**
 * Multi-field validation helper
 */
export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;

  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName];
    if (field.validator) {
      const validation = field.validator(field.value);
      if (!validation.isValid) {
        errors[fieldName] = validation.message;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Format mobile numbers
  if (cleaned.startsWith('94') && cleaned.length === 11) {
    return `+94 ${cleaned.substring(2, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8)}`;
  }
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
};

/**
 * Format license plate for display
 */
export const formatLicensePlate = (plate) => {
  if (!plate) return '';
  
  const cleaned = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Format ABC1234 to ABC-1234
  if (cleaned.match(/^[A-Z]{2,3}[0-9]{4}$/)) {
    const letters = cleaned.match(/^[A-Z]+/)[0];
    const numbers = cleaned.match(/[0-9]+$/)[0];
    return `${letters}-${numbers}`;
  }
  
  return plate.toUpperCase();
};