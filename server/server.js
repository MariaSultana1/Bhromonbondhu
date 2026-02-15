// server.js - Complete Backend with MongoDB Atlas Integration + Profile Picture Upload
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));


// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();


const BANGLADESH_OPERATORS = [
  'Grameenphone', 'Robi', 'Banglalink', 'Teletalk', 'Airtel'
];

const VALID_OPERATOR_PREFIXES = {
  'Grameenphone': ['017', '013'],
  'Robi': ['018'],
  'Banglalink': ['019', '014'],
  'Teletalk': ['015'],
  'Airtel': ['016']
};

const validatePhoneNumber = (phone) => {
  // Must be exactly 11 digits starting with 01
  const phoneRegex = /^01[3-9]\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Phone number must be 11 digits starting with 01' };
  }
  return { valid: true };
};

const validateNID = (nid) => {
  // NID can be 10, 13, or 17 digits
  const nidRegex = /^(\d{10}|\d{13}|\d{17})$/;
  if (!nidRegex.test(nid)) {
    return { valid: false, message: 'NID must be 10, 13, or 17 digits' };
  }
  return { valid: true };
};

const validatePassport = (passport) => {
  // Passport format: 2 letters followed by 7 digits
  const passportRegex = /^[A-Z]{2}\d{7}$/;
  if (!passportRegex.test(passport)) {
    return { valid: false, message: 'Passport must be 2 uppercase letters followed by 7 digits (e.g., AB1234567)' };
  }
  return { valid: true };
};

const validateCardNumber = (cardNumber) => {
  // Remove spaces and check if it's 16 digits
  const cleaned = cardNumber.replace(/\s+/g, '');
  const cardRegex = /^\d{16}$/;
  if (!cardRegex.test(cleaned)) {
    return { valid: false, message: 'Card number must be exactly 16 digits' };
  }
  return { valid: true, cleaned };
};

const validateCVV = (cvv) => {
  const cvvRegex = /^\d{3}$/;
  if (!cvvRegex.test(cvv)) {
    return { valid: false, message: 'CVV must be exactly 3 digits' };
  }
  return { valid: true };
};

const validateExpiryDate = (expiry) => {
  // Format: MM/YY
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiry)) {
    return { valid: false, message: 'Expiry date must be in MM/YY format' };
  }
  
  // Check if card is not expired
  const [month, year] = expiry.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();
  
  if (expiryDate < now) {
    return { valid: false, message: 'Card has expired' };
  }
  
  return { valid: true };
};

const validateBkashNumber = (bkashNumber) => {
  return validatePhoneNumber(bkashNumber);
};

const validateOperator = (operator) => {
  if (!BANGLADESH_OPERATORS.includes(operator)) {
    return { 
      valid: false, 
      message: `Invalid operator. Must be one of: ${BANGLADESH_OPERATORS.join(', ')}` 
    };
  }
  return { valid: true };
};

const validateAge = (age) => {
  const ageNum = parseInt(age);
  if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
    return { valid: false, message: 'Age must be between 0 and 120' };
  }
  return { valid: true };
};


// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^01[3-9]\d{8}$/.test(v);
      },
      message: 'Phone number must be 11 digits starting with 01'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['tourist', 'guide', 'host', 'admin'],
    default: 'tourist'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

// Transport Ticket Booking Schema (NEW - for storing ticket bookings)
const transportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  pnr: {
    type: String,
    required: true,
    unique: true
  },
  transportType: {
    type: String,
    enum: ['bus', 'train', 'flight'],
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  journeyDate: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  vehicleNumber: String,
  trainNumber: String,
  flightNumber: String,
  passengers: [{
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    nid: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^(\d{10}|\d{13}|\d{17})$/.test(v);
        },
        message: 'NID must be 10, 13, or 17 digits'
      }
    },
    passport: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[A-Z]{2}\d{7}$/.test(v);
        },
        message: 'Passport must be 2 uppercase letters followed by 7 digits'
      }
    },
    seat: {
      type: String,
      required: true
    },
    ticketNumber: {
      type: String,
      required: true
    },
    class: String
  }],
  contactEmail: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  contactPhone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^01[3-9]\d{8}$/.test(v);
      },
      message: 'Phone must be 11 digits starting with 01'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerTicket: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bkash', 'cash'],
    required: true
  },
  paymentDetails: {
    cardNumber: String, // Stored as last 4 digits only for security
    cardholderName: String,
    bkashNumber: String,
    transactionId: String
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const TransportTicket = mongoose.model('TransportTicket', transportTicketSchema);


// Trip Schema
const tripSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: String,
    required: [true, 'End date is required']
  },
  host: {
    type: String,
    default: 'pending'
  },
  hostAvatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  },
  image: {
    type: String,
    // ✅ FIX: Make it required but with a default fallback
    default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
  },
  weather: {
    type: String,
    default: '25°C, Pleasant'
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  services: [{
    type: String,
    default: []
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: String,
    unique: true
  },
  transportTicketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransportTicket'
  },
  transportType: {
    type: String,
    enum: ['bus', 'train', 'flight', null],
    default: null
  },
  transportProvider: {
    type: String,
    default: null
  },
  transportFrom: {
    type: String,
    default: null
  },
  transportTo: {
    type: String,
    default: null
  },
  transportDate: {
    type: String,
    default: null
  },
  checkIn: {
    type: String,
    default: '2:00 PM'
  },
  checkOut: {
    type: String,
    default: '11:00 AM'
  },
  guests: {
    type: Number,
    default: 2
  },
  nights: {
    type: Number,
    default: 3
  },
  totalAmount: {
    type: Number,
    default: 12500
  },
  location: {
    type: String
  },
  hostRating: {
    type: Number,
    // ✅ FIX: Change min from 1 to 0
    min: 0,
    max: 5,
    default: 4.5
  },
  description: {
    type: String,
    default: 'Enjoy your stay'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate bookingId before saving
tripSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `BK${year}${randomNum}`;
  }
  
  // Set location to destination if not provided
  if (!this.location) {
    this.location = this.destination;
  }
  
  next();
});

const Trip = mongoose.model('Trip', tripSchema);




// Transportation Schema
const transportationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['flight', 'train', 'bus'],
    required: true
  },
  from: {
    type: String,
    required: [true, 'From location is required']
  },
  to: {
    type: String,
    required: [true, 'To location is required']
  },
  operator: {
    type: String,
    required: [true, 'Operator/airline/train name is required']
  },
  departure: {
    type: String,
    required: [true, 'Departure time is required']
  },
  arrival: {
    type: String,
    required: [true, 'Arrival time is required']
  },
  departureDate: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Seats cannot be negative']
  },
  totalSeats: {
    type: Number,
    default: 50
  },
  class: {
    type: String,
    enum: ['Economy', 'Business', 'First', 'Sleeper', 'AC', 'Non-AC'],
    default: 'Economy'
  },
  description: {
    type: String
  },
  facilities: [{
    type: String,
    default: []
  }],
  stops: [{
    station: String,
    arrival: String,
    departure: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Transportation = mongoose.model('Transportation', transportationSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'payment', 'system'],
    default: 'text'
  },
  read: {
    type: Boolean,
    default: false
  },
  attachments: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'document', 'audio', 'video']
    }
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

// Host Schema
const hostSchema = new mongoose.Schema({
  // Host Profile Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: [true, 'Host name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  bio: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500
  },
  
  // Languages & Communication
  languages: [{
    type: String,
    default: []
  }],
  responseTime: {
    type: String,
    enum: ['Within 30 minutes', 'Within 1 hour', 'Within 2 hours', 'Within 24 hours'],
    default: 'Within 1 hour'
  },
  
  // Host Image - will be populated from User profile picture
  image: {
    type: String,
    default: null
  },
  
  // Host Status & Ratings
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  
  // Experience Level
  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner'
  },
  
  // Host Badge & Recognition
  hostBadge: {
    type: String,
    enum: ['Host', 'Superhost', 'Pro Host'],
    default: 'Host'
  },
  
  // Host Statistics
  hostRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalGuests: {
    type: Number,
    default: 0
  },
  responseRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Availability
  available: {
    type: Boolean,
    default: true
  },
  
  // Verification Status
  verified: {
    type: Boolean,
    default: false
  },
  kycCompleted: {
    type: Boolean,
    default: false
  },
  
  // Verification Dates
  idVerifiedAt: {
    type: Date,
    default: null
  },
  bgCheckAt: {
    type: Date,
    default: null
  },
  trainingAt: {
    type: Date,
    default: null
  },
  bankVerifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for quick lookups
hostSchema.index({ location: 1 });
hostSchema.index({ verified: 1 });

const Host = mongoose.model('Host', hostSchema);



const hostServiceSchema = new mongoose.Schema({
  // Link to Host
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: [true, 'Host ID is required'],
    index: true
  },
  
  // Link to User (for easier queries)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Service Details
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Service Type
  serviceType: {
    type: [String],
    enum: ['Local Guide', 'Transportation', 'Meals', 'Photography', 'Activities', 'Accommodation'],
    required: [true, 'At least one service type is required']
  },
  
  // Location specific to this service
  location: {
    type: String,
    required: [true, 'Service location is required'],
    trim: true
  },
  
  // Capacity
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guests is required'],
    min: 1,
    default: 4
  },
  
  minStay: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Property Image (required if offering accommodation)
  propertyImage: {
    type: String,
    default: ''
  },
  
  // Service-specific settings
  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner'
  },
  
  responseTime: {
    type: String,
    enum: ['Within 30 minutes', 'Within 1 hour', 'Within 2 hours', 'Within 24 hours'],
    default: 'Within 1 hour'
  },
  
  cancellationPolicy: {
    type: String,
    enum: ['Flexible', 'Moderate', 'Strict'],
    default: 'Flexible'
  },
  
  // Availability
  available: {
    type: Boolean,
    default: true
  },

  bookedDates: [{
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Availability settings
  availableFromDate: {
    type: Date,
    required: [true, 'Available from date is required']
  },
  availableToDate: {
    type: Date,
    required: [true, 'Available to date is required']
  },
  
  availableFromDate: {
    type: Date,
    required: [true, 'Available from date is required']
  },
  
  availableToDate: {
    type: Date,
    required: [true, 'Available to date is required']
  },
  
  // Status
  active: {
    type: Boolean,
    default: true
  },
  
  // Stats
  totalBookings: {
    type: Number,
    default: 0
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  reviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Validation middleware
hostServiceSchema.pre('save', function(next) {
  // If offering accommodation, property image is required
  if (this.serviceType && this.serviceType.includes('Accommodation') && !this.propertyImage) {
    return next(new Error('Property image is required when offering accommodation'));
  }
  
  // Validate date range
  if (this.availableFromDate && this.availableToDate) {
    if (this.availableFromDate > this.availableToDate) {
      return next(new Error('Available from date must be before available to date'));
    }
  }
  
  next();
});

// Indexes for efficient queries
hostServiceSchema.index({ hostId: 1, active: 1 });
hostServiceSchema.index({ userId: 1, active: 1 });
hostServiceSchema.index({ location: 1, available: 1 });
hostServiceSchema.index({ availableFromDate: 1, availableToDate: 1 });

const HostService = mongoose.model('HostService', hostServiceSchema);


//Traveler Schema - stores extra traveler info in the 'travelers' collection
const travelerSchema = new mongoose.Schema({
  // Link to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },

  // Mirror basic info from User for quick queries
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },

  // Traveler-specific fields (filled over time)
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  nationality: {
    type: String,
    default: 'Bangladeshi',
    trim: true
  },
  nid: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(\d{10}|\d{13}|\d{17})$/.test(v);
      },
      message: 'NID must be 10, 13, or 17 digits'
    }
  },
  passport: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[A-Z]{2}\d{7}$/.test(v);
      },
      message: 'Passport must be 2 uppercase letters followed by 7 digits'
    }
  },

  // Travel preferences
  preferredLanguages: {
    type: [String],
    default: ['Bengali']
  },
  travelStyle: {
    type: String,
    enum: ['Budget', 'Mid-range', 'Luxury', ''],
    default: ''
  },
  interests: {
    type: [String],
    default: []
  },

  // Stats (updated as they travel)
  totalTrips: {
    type: Number,
    default: 0
  },
  placesVisited: {
    type: Number,
    default: 0
  },
  travelTier: {
    type: String,
    enum: ['Explorer', 'Bronze Traveler', 'Silver Traveler', 'Gold Traveler'],
    default: 'Explorer'
  },
  travelPoints: {
    type: Number,
    default: 0
  },

  // Emergency contact
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },

  // Status
  profileComplete: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

travelerSchema.index({ userId: 1 });
travelerSchema.index({ email: 1 });

const Traveler = mongoose.model('Traveler', travelerSchema);



// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['host', 'transportation'],
    required: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host'
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  guests: {
    type: Number,
    default: 1
  },
  selectedServices: [{
    type: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bkash'],
    required: true
  },
  paymentDetails: {
    cardNumber: String,
    cardholderName: String,
    bkashNumber: String,
    transactionId: String
  },
  bookingId: {
    type: String,
    unique: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate booking ID before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = this.bookingType === 'host' ? 'HST' : 'TRN';
    this.bookingId = `${prefix}${year}${randomNum}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);


// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
const JWT_EXPIRE = '7d';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, fullName, email, phone, location, password, role } = req.body;

    // ============ VALIDATION ============

    if (!username || !fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: username, fullName, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({
          success: false,
          message: phoneValidation.message
        });
      }
    }

    const normalizedRole = role === 'traveller' ? 'tourist' : (role || 'tourist');
    const isHost = normalizedRole === 'host';
    const isTourist = normalizedRole === 'tourist';

    // Phone is required for hosts
    if (isHost && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for host registration'
      });
    }

    // ============ CHECK EXISTING USER ============

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered. Please login or use a different email.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose a different username.'
      });
    }

    // ============ CREATE USER (always) ============

    const user = new User({
      username: username.toLowerCase(),
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      location: location || '',
      password,
      role: normalizedRole,
      profilePicture: '',
      location: '',
      languages: [],
      bio: '',
      ...(isHost && {
        hostBadge: 'Host',
        verified: false,
        kycCompleted: false,
        hostRating: 0,
        totalGuests: 0,
        responseRate: 0
      })
    });

    await user.save();
    console.log(`✅ User created: ${user.email} (Role: ${user.role})`);

    // ============ CREATE TRAVELER PROFILE (if tourist) ============

    let travelerProfile = null;
    if (isTourist) {
      try {
        travelerProfile = new Traveler({
          userId: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || '',
          preferredLanguages: ['Bengali'],
          travelStyle: '',
          interests: [],
          totalTrips: 0,
          placesVisited: 0,
          travelTier: 'Explorer',
          travelPoints: 0,
          profileComplete: false,
          active: true
        });

        await travelerProfile.save();
        console.log(`✅ Traveler profile created for: ${user.email} (Traveler ID: ${travelerProfile._id})`);
      } catch (travelerError) {
        console.error('❌ Error creating traveler profile:', travelerError);

        // Rollback user if traveler profile fails
        await User.findByIdAndDelete(user._id);

        return res.status(500).json({
          success: false,
          message: 'Error creating traveler profile. Please try again.',
          error: process.env.NODE_ENV === 'development' ? travelerError.message : undefined
        });
      }
    }

    // ============ CREATE HOST PROFILE (if host) ============

    let hostProfile = null;
    if (isHost) {
      try {
        hostProfile = new Host({
          name: fullName,
          userId: user._id,
          location: location || '',
          rating: 0,
          reviews: 0,
          verified: false,
          languages: [],
          image: null,
          available: false,
          description: '',
          experience: 'Beginner',
          responseTime: 'Within 1 hour'
        });

        await hostProfile.save();
        console.log(`✅ Host profile created for: ${user.email} (Host ID: ${hostProfile._id})`);
        console.log(`⚠️  Host profile is incomplete — user must complete it after login`);
      } catch (hostError) {
        console.error('❌ Error creating host profile:', hostError);

        // Rollback user
        await User.findByIdAndDelete(user._id);

        return res.status(500).json({
          success: false,
          message: 'Error creating host profile. Please try again.',
          error: process.env.NODE_ENV === 'development' ? hostError.message : undefined
        });
      }
    }

    // ============ GENERATE TOKEN ============

    const token = generateToken(user._id);

    // ============ BUILD RESPONSE ============

    const responseUser = {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      location: user.location,
      languages: user.languages,
      bio: user.bio,
      createdAt: user.createdAt,
      // Host-specific
      ...(isHost && {
        hostBadge: user.hostBadge || 'Host',
        hostRating: user.hostRating || 0,
        totalGuests: user.totalGuests || 0,
        responseRate: user.responseRate || 0,
        verified: user.verified || false,
        kycCompleted: user.kycCompleted || false
      })
    };

    const successMessage = isHost
      ? 'Registration successful! Please complete your host profile to start hosting.'
      : 'Registration successful! Welcome to Bhromonbondhu!';

    console.log(`✅ Registration complete — User: ${user.email}, Collections updated: users + ${isHost ? 'hosts' : 'travelers'}`);

    return res.status(201).json({
      success: true,
      message: successMessage,
      token,
      user: responseUser,
      // Traveler details (for tourists)
      ...(travelerProfile && {
        traveler: {
          id: travelerProfile._id,
          travelTier: travelerProfile.travelTier,
          travelPoints: travelerProfile.travelPoints,
          profileComplete: travelerProfile.profileComplete
        }
      }),
      // Host details (for hosts)
      ...(hostProfile && {
        host: {
          id: hostProfile._id,
          name: hostProfile.name,
          profileComplete: false,
          needsCompletion: true
        }
      })
    });

  } catch (error) {
    console.error('❌ Registration error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `This ${field} is already registered. Please use a different ${field}.`
      });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide both username/email and password' 
      });
    }

    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() }, 
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password. Please check your credentials and try again.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Your account has been deactivated. Please contact support for assistance.' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password. Please check your credentials and try again.' 
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    console.log(`✅ User logged in: ${user.email} (Role: ${user.role})`);

    res.json({
      success: true,
      message: 'Login successful! Welcome back!',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during login. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get Current User
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user data' 
    });
  }
});

// Logout Route (Protected)
app.post('/api/auth/logout', authenticate, (req, res) => {
  console.log(`✅ User logged out: ${req.user.email}`);
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

// Update Profile
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (fullName) user.fullName = fullName;
    if (phone !== undefined) {
      if (phone) {
        const phoneValidation = validatePhoneNumber(phone);
        if (!phoneValidation.valid) {
          return res.status(400).json({
            success: false,
            message: phoneValidation.message
          });
        }
      }
      user.phone = phone;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile' 
    });
  }
});

// Upload Profile Picture
app.put('/api/auth/profile-picture', authenticate, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture provided'
      });
    }

    if (!profilePicture.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Please upload a valid image file.'
      });
    }

    const sizeInBytes = (profilePicture.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB > 5) {
      return res.status(400).json({
        success: false,
        message: 'Image size too large. Maximum size is 5MB.'
      });
    }

    const user = await User.findById(req.user._id);
    user.profilePicture = profilePicture;
    await user.save();

    console.log(`✅ Profile picture updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get Traveler Stats (Total Trips and Unique Places Visited)
app.get('/api/traveler/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total confirmed trips (from transporttickets collection)
    const totalTrips = await TransportTicket.countDocuments({
      userId: userId,
      status: 'confirmed'
    });

    // Get unique destinations visited (from transporttickets collection)
    const uniquePlaces = await TransportTicket.distinct('to', {
      userId: userId,
      status: 'confirmed'
    });

    // Get unique hosts booked (from trips where host is not "pending")
    const bookedHostsResult = await Trip.find({
      userId: userId,
      status: 'completed'
    }).select('host');

    const uniqueHosts = new Set();
    bookedHostsResult.forEach(trip => {
      if (trip.host && trip.host !== 'pending' && trip.host !== 'Pending') {
        uniqueHosts.add(trip.host);
      }
    });

    // For now, reviews given will be 0 (can be extended when review collection exists)
    // In future: const totalReviews = await Review.countDocuments({ userId: userId });
    const totalReviews = 0;

    // Calculate travel tier based on confirmed trips
    let travelTier = 'Explorer';
    if (totalTrips >= 30) {
      travelTier = 'Gold Traveler';
    } else if (totalTrips >= 15) {
      travelTier = 'Silver Traveler';
    } else if (totalTrips >= 5) {
      travelTier = 'Bronze Traveler';
    }

    // Calculate travel points 
    // Formula: 100 points per confirmed trip + 50 points per unique destination
    const travelPoints = (totalTrips * 100) + (uniquePlaces.length * 50);

    res.json({
      success: true,
      stats: {
        totalTrips: totalTrips,
        placesVisited: uniquePlaces.length,
        reviewsGiven: totalReviews,
        hostsBooked: uniqueHosts.size,
        travelTier: travelTier,
        travelPoints: travelPoints,
        destinations: uniquePlaces.filter(p => p) // Remove null/undefined
      }
    });

  } catch (error) {
    console.error('❌ Error fetching traveler stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching traveler stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Book Transport Tickets (Store booking in database)
app.post('/api/transport-tickets/book', authenticate, async (req, res) => {
  try {
    const {
      bookingId,
      pnr,
      transportType,
      provider,
      from,
      to,
      journeyDate,
      departureTime,
      arrivalTime,
      duration,
      vehicleNumber,
      trainNumber,
      flightNumber,
      passengers,
      contactEmail,
      contactPhone,
      totalAmount,
      pricePerTicket,
      paymentMethod,
      paymentDetails
    } = req.body;

    // Validation
    if (!bookingId || !pnr || !transportType || !provider || !from || !to || !journeyDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    if (!passengers || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one passenger is required'
      });
    }

    // Validate contact email
    if (!contactEmail || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Valid contact email is required'
      });
    }

    // Validate contact phone
    const phoneValidation = validatePhoneNumber(contactPhone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        success: false,
        message: `Contact ${phoneValidation.message}`
      });
    }

    // Validate each passenger
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      
      if (!passenger.firstName || !passenger.lastName) {
        return res.status(400).json({
          success: false,
          message: `Passenger ${i + 1}: First name and last name are required`
        });
      }

      // Validate age
      const ageValidation = validateAge(passenger.age);
      if (!ageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `Passenger ${i + 1}: ${ageValidation.message}`
        });
      }

      // Validate NID if provided
      if (passenger.nid) {
        const nidValidation = validateNID(passenger.nid);
        if (!nidValidation.valid) {
          return res.status(400).json({
            success: false,
            message: `Passenger ${i + 1}: ${nidValidation.message}`
          });
        }
      }

      // Validate Passport if provided
      if (passenger.passport) {
        const passportValidation = validatePassport(passenger.passport);
        if (!passportValidation.valid) {
          return res.status(400).json({
            success: false,
            message: `Passenger ${i + 1}: ${passportValidation.message}`
          });
        }
      }

      // For flights, require either NID or Passport
      if (transportType === 'flight' && !passenger.nid && !passenger.passport) {
        return res.status(400).json({
          success: false,
          message: `Passenger ${i + 1}: NID or Passport is required for flight bookings`
        });
      }
    }

    // Validate payment details based on method
    if (paymentMethod === 'card') {
      if (!paymentDetails?.cardNumber || !paymentDetails?.cardholderName) {
        return res.status(400).json({
          success: false,
          message: 'Card number and cardholder name are required for card payment'
        });
      }

      // Note: In production, never store full card numbers
      // Only store last 4 digits for reference
      const cardValidation = validateCardNumber(paymentDetails.cardNumber);
      if (!cardValidation.valid) {
        return res.status(400).json({
          success: false,
          message: cardValidation.message
        });
      }
    } else if (paymentMethod === 'bkash') {
      if (!paymentDetails?.bkashNumber) {
        return res.status(400).json({
          success: false,
          message: 'bKash number is required for bKash payment'
        });
      }

      const bkashValidation = validateBkashNumber(paymentDetails.bkashNumber);
      if (!bkashValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `bKash ${bkashValidation.message}`
        });
      }
    }

    // Prepare payment details for storage (secure)
    const securePaymentDetails = {};
    if (paymentMethod === 'card') {
      // Only store last 4 digits of card for security
      const cleaned = paymentDetails.cardNumber.replace(/\s+/g, '');
      securePaymentDetails.cardNumber = '**** **** **** ' + cleaned.slice(-4);
      securePaymentDetails.cardholderName = paymentDetails.cardholderName;
    } else if (paymentMethod === 'bkash') {
      securePaymentDetails.bkashNumber = paymentDetails.bkashNumber;
    }

    // Generate transaction ID
    securePaymentDetails.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create ticket booking in database
    const ticketBooking = new TransportTicket({
      userId: req.user._id,
      bookingId,
      pnr,
      transportType,
      provider,
      from,
      to,
      journeyDate,
      departureTime,
      arrivalTime,
      duration,
      vehicleNumber,
      trainNumber,
      flightNumber,
      passengers,
      contactEmail,
      contactPhone,
      totalAmount,
      pricePerTicket,
      paymentMethod,
      paymentDetails: securePaymentDetails,
      status: 'confirmed'
    });

    await ticketBooking.save();

    console.log(`✅ Transport ticket booked: ${bookingId} for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Ticket booking saved successfully',
      booking: {
        bookingId: ticketBooking.bookingId,
        pnr: ticketBooking.pnr,
        status: ticketBooking.status,
        transactionId: securePaymentDetails.transactionId
      }
    });
  } catch (error) {
    console.error('❌ Transport ticket booking error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This booking ID or PNR already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error saving ticket booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all transport tickets for user
app.get('/api/transport-tickets', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const tickets = await TransportTicket.find(query)
      .sort({ bookingDate: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    console.error('❌ Get transport tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets'
    });
  }
});

// Get single transport ticket by booking ID
app.get('/api/transport-tickets/:bookingId', authenticate, async (req, res) => {
  try {
    const ticket = await TransportTicket.findOne({
      bookingId: req.params.bookingId,
      userId: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('❌ Get transport ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket'
    });
  }
});

// Cancel transport ticket
app.put('/api/transport-tickets/:bookingId/cancel', authenticate, async (req, res) => {
  try {
    const ticket = await TransportTicket.findOne({
      bookingId: req.params.bookingId,
      userId: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already cancelled'
      });
    }

    ticket.status = 'cancelled';
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket cancelled successfully',
      ticket
    });
  } catch (error) {
    console.error('❌ Cancel transport ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling ticket'
    });
  }
});


// Delete Profile Picture (Protected Route) - NEW ENDPOINT
app.delete('/api/auth/profile-picture', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.profilePicture = ''; // Set back to empty
    await user.save();

    console.log(`✅ Profile picture deleted for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile picture deleted successfully',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Profile picture delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile picture'
    });
  }
});

// Change Password (Protected Route)
app.put('/api/auth/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});



// Create a trip from a transport ticket (Protected)
app.post('/api/trips/from-ticket/:ticketBookingId', authenticate, async (req, res) => {
  try {
    const { image } = req.body;
    
    // Get the transport ticket
    const ticket = await TransportTicket.findOne({
      bookingId: req.params.ticketBookingId,
      userId: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Transport ticket not found'
      });
    }

    // Check if trip already exists for this ticket
    const existingTrip = await Trip.findOne({
      transportTicketId: ticket._id
    });

    if (existingTrip) {
      return res.status(400).json({
        success: false,
        message: 'A trip already exists for this ticket'
      });
    }

    // Create a new trip from the ticket
    const trip = new Trip({
      destination: ticket.to,
      location: ticket.to,
      date: ticket.journeyDate,
      endDate: ticket.journeyDate,
      host: 'pending',
      image: image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80',
      weather: '25°C, Pleasant',
      status: 'upcoming',
      services: [],
      checkIn: '2:00 PM',
      checkOut: '11:00 AM',
      guests: ticket.passengers.length,
      nights: 1,
      totalAmount: ticket.totalAmount,
      description: `Trip to ${ticket.to} via ${ticket.transportType}`,
      userId: req.user._id,
      transportTicketId: ticket._id,
      transportType: ticket.transportType,
      transportProvider: ticket.provider,
      transportFrom: ticket.from,
      transportTo: ticket.to,
      transportDate: ticket.journeyDate
    });

    await trip.save();

    res.status(201).json({
      success: true,
      message: 'Trip created from transport ticket successfully',
      trip: trip
    });
  } catch (error) {
    console.error('❌ Create trip from ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trip from ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all trips for a user (Protected)
app.get('/api/trips', authenticate, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 });

    // Auto-complete trips where date has passed
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const updatedTrips = await Promise.all(trips.map(async (trip) => {
      // Only auto-complete if status is 'upcoming' and not already completed
      if (trip.status === 'upcoming' && trip.date) {
        try {
          // Parse trip date
          const tripDate = new Date(trip.date);
          const tripDateOnly = new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate());
          
          // If trip date is in the past, mark as completed
          if (tripDateOnly < today) {
            console.log(`🔄 Auto-completing trip ${trip._id} - date was ${trip.date}`);
            
            trip.status = 'completed';
            trip.completedAt = now;
            
            // Save the updated trip
            await trip.save();
            
            // Also update associated transport ticket
            if (trip.transportTicketId) {
              await TransportTicket.findByIdAndUpdate(
                trip.transportTicketId,
                { 
                  status: 'completed',
                  completedAt: now
                }
              );
            }
          }
        } catch (dateError) {
          console.error(`Error checking trip date for ${trip._id}:`, dateError);
        }
      }
      return trip;
    }));

    console.log(`📍 GET /api/trips - Found ${updatedTrips.length} trips for user ${req.user._id}`);
    console.log('Trip statuses:', updatedTrips.map(t => ({ destination: t.destination, status: t.status, date: t.date })));

    res.json({
      success: true,
      count: updatedTrips.length,
      trips: updatedTrips
    });
  } catch (error) {
    console.error(' Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trips',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Fix trips without status (Development endpoint)
app.put('/api/trips/fix/status', authenticate, async (req, res) => {
  try {
    // Find all trips for this user without a status
    const tripsWithoutStatus = await Trip.find({ 
      userId: req.user._id,
      $or: [
        { status: null },
        { status: undefined },
        { status: { $exists: false } }
      ]
    });

    console.log(`🔧 Found ${tripsWithoutStatus.length} trips without status`);

    // Update them all to 'upcoming'
    const updateResult = await Trip.updateMany(
      { userId: req.user._id, status: null },
      { $set: { status: 'upcoming' } }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} trips to status: upcoming`);

    res.json({
      success: true,
      message: `Fixed ${updateResult.modifiedCount} trips`,
      fixed: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('❌ Fix trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing trips',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a single trip by ID (Protected)
app.get('/api/trips/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      trip: trip
    });
  } catch (error) {
    console.error(' Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new trip (Protected)
app.post('/api/trips', authenticate, async (req, res) => {
  try {
    const {
      destination,
      date,
      endDate,
      host,
      hostAvatar,
      image,
      weather,
      status,
      services,
      checkIn,
      checkOut,
      guests,
      nights,
      totalAmount,
      hostRating,
      description
    } = req.body;

    // Validation
    if (!destination || !date || !endDate || !host) {
      return res.status(400).json({
        success: false,
        message: 'Destination, dates, and host are required'
      });
    }

    const trip = new Trip({
      destination,
      date,
      endDate,
      host,
      hostAvatar: hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.replace(/\s/g, '')}`,
      image: image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80',
      weather: weather || '25°C, Pleasant',
      status: status || 'upcoming',
      services: services || ['Local Guide'],
      checkIn: checkIn || '2:00 PM',
      checkOut: checkOut || '11:00 AM',
      guests: guests || 2,
      nights: nights || 3,
      totalAmount: totalAmount || 12500,
      hostRating: hostRating || 4.5,
      description: description || `Enjoy your stay at ${destination}`,
      userId: req.user._id
    });

    await trip.save();

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip: trip
    });
  } catch (error) {
    console.error(' Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a trip (Protected)
app.put('/api/trips/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Update only allowed fields
    const allowedUpdates = [
      'destination', 'date', 'endDate', 'host', 'hostAvatar', 'image',
      'weather', 'status', 'services', 'checkIn', 'checkOut', 'guests',
      'nights', 'totalAmount', 'hostRating', 'description'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        trip[field] = req.body[field];
      }
    });

    await trip.save();

    res.json({
      success: true,
      message: 'Trip updated successfully',
      trip: trip
    });
  } catch (error) {
    console.error('❌ Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Complete a trip (Protected) - Mark trip as completed and update associated transport ticket
app.post('/api/trips/:id/complete', authenticate, async (req, res) => {
  try {
    const { rating = null, review = null, photos = [] } = req.body;

    // Find the trip
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if trip is already completed
    if (trip.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Trip is already marked as completed'
      });
    }

    // Check if trip is cancelled
    if (trip.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled trip'
      });
    }

    // Mark trip as completed
    trip.status = 'completed';
    trip.completedAt = new Date();
    
    // Add review and photos if provided
    if (rating !== null || review) {
      trip.tripReview = {
        rating: rating,
        review: review,
        photos: photos || [],
        createdAt: new Date()
      };
    }

    await trip.save();

    // Also update the associated transport ticket if it exists
    if (trip.transportTicketId) {
      const ticket = await TransportTicket.findByIdAndUpdate(
        trip.transportTicketId,
        { 
          status: 'completed',
          completedAt: new Date()
        },
        { new: true }
      );

      // Add review to ticket if provided
      if (ticket && (rating !== null || review)) {
        ticket.ticketReview = {
          rating: rating,
          review: review,
          photos: photos || [],
          createdAt: new Date()
        };
        await ticket.save();
      }
    }

    res.json({
      success: true,
      message: 'Trip completed successfully',
      trip: trip,
      stats: {
        totalTripsCompleted: await Trip.countDocuments({
          userId: req.user._id,
          status: 'completed'
        }),
        points: rating ? (rating * 100) : 0 // Award points based on completion
      }
    });
  } catch (error) {
    console.error('❌ Complete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get trip completion status (Protected)
app.get('/api/trips/:id/completion-status', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      tripId: trip._id,
      status: trip.status,
      destination: trip.destination,
      source: trip.transportFrom || 'Dhaka',
      date: trip.date,
      completedAt: trip.completedAt || null,
      canComplete: trip.status === 'upcoming',
      tripReview: trip.tripReview || null
    });
  } catch (error) {
    console.error('❌ Get completion status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get route and checkpoints for a trip (Protected)
app.get('/api/trips/:id/route', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('transportTicketId');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // If trip has a transport ticket, get the route details
    if (trip.transportTicketId && trip.transportTicketId.transportationId) {
      const transportation = await Transportation.findById(trip.transportTicketId.transportationId);
      
      if (transportation) {
        // Extract checkpoints from stops
        const checkpoints = [];
        
        // Add starting point
        checkpoints.push({
          name: `${transportation.from} - Start`,
          city: transportation.from,
          time: transportation.departure,
          coordinates: null, // Will be filled by frontend
          completed: false,
          current: false
        });

        // Add intermediate stops
        if (transportation.stops && transportation.stops.length > 0) {
          transportation.stops.forEach((stop, index) => {
            checkpoints.push({
              name: stop.station,
              city: stop.station,
              time: stop.arrival,
              coordinates: null,
              completed: false,
              current: false
            });
          });
        }

        // Add destination
        checkpoints.push({
          name: `${transportation.to} - End`,
          city: transportation.to,
          time: transportation.arrival,
          coordinates: null,
          completed: false,
          current: false
        });

        return res.json({
          success: true,
          route: {
            from: transportation.from,
            to: transportation.to,
            type: transportation.type,
            operator: transportation.operator,
            departure: transportation.departure,
            arrival: transportation.arrival,
            departureDate: transportation.departureDate,
            duration: transportation.duration
          },
          checkpoints: checkpoints,
          stops: transportation.stops || []
        });
      }
    }

    // Fallback if no transportation found
    res.json({
      success: true,
      route: {
        from: trip.transportFrom,
        to: trip.transportTo,
        type: trip.transportType,
        operator: trip.transportProvider,
        departure: trip.transportDate
      },
      checkpoints: [],
      stops: []
    });
  } catch (error) {
    console.error('❌ Get trip route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trip route',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a trip (Protected)
app.delete('/api/trips/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error(' Delete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trip',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== HOST ROUTES ====================

// Get all hosts
app.get('/api/hosts', async (req, res) => {
  try {
    const { location, minRating, verified, limit = 10 } = req.query;
    
    let query = { available: true };
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    
    if (verified === 'true') {
      query.verified = true;
    }
    
    const hosts = await Host.find(query)
      .populate('userId', 'profilePicture fullName username')
      .limit(parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    // Format hosts to include user profile picture
    const formattedHosts = hosts.map(host => ({
      ...host.toObject(),
      image: host.userId?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.name.replace(/\s/g, '')}`
    }));

    res.json({
      success: true,
      count: formattedHosts.length,
      hosts: formattedHosts
    });
  } catch (error) {
    console.error('❌ Get hosts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hosts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== UPDATED POST /api/bookings ENDPOINT ====================
// Replace the existing POST /api/bookings endpoint (around line 2445) with this:

// Create host booking
app.post('/api/bookings', authenticate, async (req, res) => {
  try {
    const {
      bookingType,
      hostId,
      serviceId,
      checkIn,
      checkOut,
      guests,
      selectedServices,
      notes,
      paymentMethod,
      paymentDetails
    } = req.body;

    console.log('📝 Booking request:', { bookingType, hostId, serviceId, checkIn, checkOut });

    // Validate basic input
    if (!bookingType || bookingType !== 'host') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type'
      });
    }

    // Get service first
    let service = null;
    if (serviceId) {
      service = await HostService.findById(serviceId).populate('hostId');
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found. Cannot complete booking.'
      });
    }

    const actualHostId = service.hostId._id;
    console.log('✅ Service found, Host ID:', actualHostId);

    // ✅ NEW: Check if service is available for requested dates
    const availabilityCheck = checkServiceAvailability(service, checkIn, checkOut);
    
    if (!availabilityCheck.available) {
      return res.status(400).json({
        success: false,
        message: availabilityCheck.reason,
        conflictingBookings: availabilityCheck.conflictingBookings.map(b => ({
          checkIn: b.checkIn,
          checkOut: b.checkOut
        }))
      });
    }

    // Get actual host document
    const host = await Host.findById(actualHostId);
    
    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    console.log('🏠 Host:', host.name, 'Available:', host.available);

    // Validate dates
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Validate guests
    if (guests > service.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${service.maxGuests} guests allowed. You selected ${guests} guests.`
      });
    }

    // Calculate amounts
    const totalAmount = service.price * days;
    const platformFee = Math.round(totalAmount * 0.15);
    const hostEarningsAmount = totalAmount - platformFee;
    const grandTotal = totalAmount + platformFee;

    console.log('💰 Amounts:', { totalAmount, platformFee, hostEarningsAmount, grandTotal });

    // Validate payment details
    if (paymentMethod === 'card') {
      if (!paymentDetails?.cardNumber || !paymentDetails?.cardholderName) {
        return res.status(400).json({
          success: false,
          message: 'Card number and holder name are required'
        });
      }

      const cardValidation = validateCardNumber(paymentDetails.cardNumber);
      if (!cardValidation.valid) {
        return res.status(400).json({
          success: false,
          message: cardValidation.message
        });
      }
    } else if (paymentMethod === 'bkash') {
      if (!paymentDetails?.bkashNumber) {
        return res.status(400).json({
          success: false,
          message: 'bKash number is required'
        });
      }

      const bkashValidation = validateBkashNumber(paymentDetails.bkashNumber);
      if (!bkashValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `bKash ${bkashValidation.message}`
        });
      }
    }

    // Prepare secure payment details
    const securePaymentDetails = {};
    if (paymentMethod === 'card') {
      const cleaned = paymentDetails.cardNumber.replace(/\s+/g, '');
      securePaymentDetails.cardNumber = '**** **** **** ' + cleaned.slice(-4);
      securePaymentDetails.cardholderName = paymentDetails.cardholderName;
    } else if (paymentMethod === 'bkash') {
      securePaymentDetails.bkashNumber = paymentDetails.bkashNumber;
    }
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    securePaymentDetails.transactionId = transactionId;

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      bookingType: 'host',
      hostId: actualHostId,
      checkIn,
      checkOut,
      guests,
      selectedServices: selectedServices || [],
      totalAmount,
      platformFee,
      grandTotal,
      notes,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod,
      paymentDetails: securePaymentDetails
    });

    await booking.save();
    console.log('✅ Booking saved:', booking._id);

    // ✅ NEW: Add booking to service's bookedDates array
    if (!service.bookedDates) {
      service.bookedDates = [];
    }
    
    service.bookedDates.push({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      bookingId: booking._id,
      userId: req.user._id,
      status: 'confirmed'
    });

    // ✅ NEW: Check if service is now fully booked
    if (isServiceFullyBooked(service)) {
      service.available = false;
      console.log('⚠️ Service is now fully booked and marked as unavailable');
    }

    // Update service stats
    service.totalBookings = (service.totalBookings || 0) + 1;
    await service.save();
    console.log('✅ Service updated with booking dates');

    // Create earning record for host
    const earning = new HostEarning({
      hostId: actualHostId,
      userId: host.userId,
      bookingId: booking._id,
      amount: totalAmount,
      platformFee,
      hostEarnings: hostEarningsAmount,
      bookingDetails: {
        guestName: req.user.fullName,
        guestEmail: req.user.email,
        checkIn,
        checkOut,
        guests,
        location: host.location,
        days
      },
      status: 'completed',
      paymentMethod,
      transactionId
    });

    await earning.save();
    console.log('💰 Earning recorded:', earning._id, '৳' + hostEarningsAmount);

    // Update host stats
    host.totalBookings = (host.totalBookings || 0) + 1;
    await host.save();

    // Create trip record
    const trip = new Trip({
      destination: host.location,
      date: checkIn,
      endDate: checkOut,
      host: host.name,
      hostAvatar: host.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.name.replace(/\s/g, '')}`,
      image: service.propertyImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      services: selectedServices || [],
      guests,
      totalAmount: grandTotal,
      hostRating: host.rating && host.rating > 0 ? host.rating : 4.5,
      description: `Experience ${host.location} with ${host.name}`,
      userId: req.user._id,
      status: 'upcoming'
    });

    await trip.save();
    console.log('✅ Trip saved:', trip._id);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        transactionId,
        totalAmount: grandTotal,
        hostEarnings: hostEarningsAmount,
        platformFee
      }
    });
  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get host by ID
app.get('/api/hosts/:id', async (req, res) => {
  try {
    const host = await Host.findById(req.params.id)
      .populate('userId', 'profilePicture fullName username email');

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host not found'
      });
    }

    // Format host to include user profile picture
    const hostData = host.toObject();
    hostData.image = host.userId?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.name.replace(/\s/g, '')}`;

    res.json({
      success: true,
      host: hostData
    });
  } catch (error) {
    console.error('❌ Get host error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching host',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create host (Protected - for hosts to register)
app.post('/api/hosts', authenticate, async (req, res) => {
  try {
    const {
      name,
      location,
      price,
      propertyImage,
      services,
      languages,
      description,
      experience,
      responseTime,
      cancellationPolicy,
      minStay,
      maxGuests
    } = req.body;

    if (!name || !location || !price || !propertyImage) {
      return res.status(400).json({
        success: false,
        message: 'Name, location, price, and property image are required'
      });
    }

    // Get user to use their profile picture
    const user = await User.findById(req.user._id);
    
    const host = new Host({
      name,
      location,
      price,
      propertyImage,
      services: services || [],
      languages: languages || ['Bengali', 'English'],
      description: description || `Experience ${location} with ${name}`,
      experience: experience || 'Beginner',
      responseTime: responseTime || 'Within 1 hour',
      cancellationPolicy: cancellationPolicy || 'Flexible',
      minStay: minStay || 1,
      maxGuests: maxGuests || 4,
      userId: req.user._id,
      image: user?.profilePicture || null // Use user's profile picture
    });

    await host.save();

    res.status(201).json({
      success: true,
      message: 'Host profile created successfully',
      host
    });
  } catch (error) {
    console.error('❌ Create host error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating host profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== TRANSPORTATION ROUTES ====================

// Get transportation by type (Public)
app.get('/api/transportation', async (req, res) => {
  try {
    const { type, from, to, date, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (from) {
      query.from = { $regex: from, $options: 'i' };
    }
    
    if (to) {
      query.to = { $regex: to, $options: 'i' };
    }
    
    if (date) {
      query.departureDate = date;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    query.availableSeats = { $gt: 0 };
    
    const transportation = await Transportation.find(query)
      .sort({ price: 1, departure: 1 });

    res.json({
      success: true,
      count: transportation.length,
      transportation
    });
  } catch (error) {
    console.error('❌ Get transportation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transportation options',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get specific transportation by ID
app.get('/api/transportation/:id', async (req, res) => {
  try {
    const transportation = await Transportation.findById(req.params.id);

    if (!transportation) {
      return res.status(404).json({
        success: false,
        message: 'Transportation not found'
      });
    }

    res.json({
      success: true,
      transportation
    });
  } catch (error) {
    console.error(' Get transportation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transportation details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create transportation (Admin/Operator - Protected)
app.post('/api/transportation', authenticate, async (req, res) => {
  try {
    // Check if user has permission (admin or operator role)
    if (req.user.role !== 'admin' && req.user.role !== 'operator') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and operators can add transportation'
      });
    }

    const {
      type,
      from,
      to,
      operator,
      departure,
      arrival,
      departureDate,
      duration,
      price,
      availableSeats,
      totalSeats,
      class: seatClass,
      description,
      facilities,
      stops
    } = req.body;

    // Validation
    if (!type || !from || !to || !operator || !departure || !arrival || !departureDate || !duration || !price || !availableSeats) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const transportation = new Transportation({
      type,
      from,
      to,
      operator,
      departure,
      arrival,
      departureDate,
      duration,
      price,
      availableSeats,
      totalSeats: totalSeats || 50,
      class: seatClass || 'Economy',
      description: description || `${type} from ${from} to ${to}`,
      facilities: facilities || [],
      stops: stops || [],
      createdBy: req.user._id
    });

    await transportation.save();

    res.status(201).json({
      success: true,
      message: 'Transportation added successfully',
      transportation
    });
  } catch (error) {
    console.error(' Create transportation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding transportation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update available seats after booking
app.put('/api/transportation/:id/seats', async (req, res) => {
  try {
    const { seats } = req.body;

    if (!seats || seats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid number of seats required'
      });
    }

    const transportation = await Transportation.findById(req.params.id);

    if (!transportation) {
      return res.status(404).json({
        success: false,
        message: 'Transportation not found'
      });
    }

    if (transportation.availableSeats < seats) {
      return res.status(400).json({
        success: false,
        message: 'Not enough seats available'
      });
    }

    transportation.availableSeats -= seats;
    await transportation.save();

    res.json({
      success: true,
      message: 'Seats updated successfully',
      availableSeats: transportation.availableSeats
    });
  } catch (error) {
    console.error(' Update seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating seats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== AI/ML ROUTES ====================

// AI Analysis Schema
const aiAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysisType: {
    type: String,
    enum: ['mood', 'itinerary', 'risk', 'destination'],
    required: true
  },
  inputData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  outputData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  accuracyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  aiModel: {
    type: String,
    default: 'gpt-4'
  },
  processingTime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'completed'
  },
  errorMessage: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);

// Destination Schema for AI recommendations
const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  region: {
    type: String,
    required: true
  },
  type: {
    type: [String],
    enum: ['beach', 'mountain', 'cultural', 'historical', 'adventure', 'religious', 'wildlife', 'urban'],
    default: []
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  description: {
    type: String,
    required: true
  },
  bestTimeToVisit: {
    from: String,
    to: String
  },
  weatherPatterns: [{
    month: String,
    avgTemp: Number,
    condition: String,
    rainfall: Number
  }],
  averageCost: {
    budget: Number,
    midRange: Number,
    luxury: Number
  },
  popularityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  accessibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [String],
  images: [String],
  localContacts: [{
    name: String,
    type: String,
    phone: String,
    verified: Boolean
  }],
  emergencyServices: {
    police: String,
    hospital: String,
    ambulance: String
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Destination = mongoose.model('Destination', destinationSchema);

// Itinerary Schema
const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  },
  destinationName: {
    type: String,
    required: true
  },
  duration: {
    days: Number,
    nights: Number
  },
  budget: {
    total: Number,
    currency: {
      type: String,
      default: 'BDT'
    },
    breakdown: {
      accommodation: Number,
      transportation: Number,
      food: Number,
      activities: Number,
      misc: Number
    }
  },
  travelers: {
    adults: Number,
    children: Number,
    infants: Number
  },
  preferences: [String],
  days: [{
    dayNumber: Number,
    date: Date,
    title: String,
    activities: [{
      time: String,
      activity: String,
      location: String,
      description: String,
      cost: Number,
      bookingRequired: Boolean,
      booked: Boolean,
      notes: String
    }],
    meals: [{
      type: String,
      description: String,
      cost: Number
    }],
    accommodations: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Host'
    },
    transportation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transportation'
    },
    totalCost: Number,
    notes: String
  }],
  inclusions: [String],
  exclusions: [String],
  recommendations: [String],
  packingList: [String],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  documents: [{
    type: String,
    url: String,
    required: Boolean
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  sharing: {
    public: Boolean,
    sharedWith: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permission: {
        type: String,
        enum: ['view', 'edit']
      }
    }]
  },
  version: {
    type: Number,
    default: 1
  },
  parentItinerary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary'
  }
}, {
  timestamps: true
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

// Risk Analysis Schema
const riskAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  travelDates: {
    from: Date,
    to: Date
  },
  riskFactors: [{
    category: String,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    score: Number,
    description: String,
    dataSources: [String],
    timestamp: Date,
    recommendations: [String]
  }],
  overallRisk: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    score: Number,
    colorCode: String
  },
  alerts: [{
    type: String,
    enum: ['weather', 'political', 'health', 'safety', 'transport'],
    severity: {
      type: String,
      enum: ['info', 'warning', 'danger']
    },
    message: String,
    validUntil: Date,
    actionRequired: Boolean
  }],
  dataSources: {
    weather: Map,
    political: Map,
    health: Map,
    safety: Map,
    transportation: Map
  },
  predictions: [{
    date: Date,
    predictedRisk: Number,
    confidence: Number,
    factors: [String]
  }],
  recommendations: [{
    category: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    action: String,
    deadline: Date,
    completed: Boolean
  }],
  monitoring: {
    active: Boolean,
    frequency: String,
    lastChecked: Date,
    nextCheck: Date
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const RiskAnalysis = mongoose.model('RiskAnalysis', riskAnalysisSchema);

// ============ ADD THIS SCHEMA AT TOP WITH OTHER SCHEMAS ============

const hostEarningSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  hostEarnings: {
    type: Number,
    required: true
  },
  bookingDetails: {
    guestName: String,
    guestEmail: String,
    checkIn: Date,
    checkOut: Date,
    guests: Number,
    location: String,
    days: Number
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'paid', 'refunded'],
    default: 'completed'
  },
  paymentMethod: String,
  transactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

hostEarningSchema.index({ hostId: 1, createdAt: -1 });
const HostEarning = mongoose.model('HostEarning', hostEarningSchema);

// ============ REPLACE THE ENTIRE POST /api/bookings ENDPOINT ============

// Create host booking
app.post('/api/bookings', authenticate, async (req, res) => {
  try {
    const {
      bookingType,
      hostId,
      serviceId,
      checkIn,
      checkOut,
      guests,
      selectedServices,
      notes,
      paymentMethod,
      paymentDetails
    } = req.body;

    console.log('📝 Booking request:', { bookingType, hostId, serviceId, checkIn, checkOut });

    // Validate basic input
    if (!bookingType || bookingType !== 'host') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type'
      });
    }

    // Get service first to find actual host
    let service = null;
    if (serviceId) {
      service = await HostService.findById(serviceId).populate('hostId');
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found. Cannot complete booking.'
      });
    }

    const actualHostId = service.hostId._id;
    console.log('✅ Service found, Host ID:', actualHostId);

    // Get actual host document
    const host = await Host.findById(actualHostId);
    
    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    console.log('🏠 Host:', host.name, 'Available:', host.available);

    if (!host.available) {
      return res.status(400).json({
        success: false,
        message: 'Host is not currently available for bookings'
      });
    }

    // Validate dates
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Validate guests
    if (guests > host.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${host.maxGuests} guests allowed. You selected ${guests} guests.`
      });
    }

    // Calculate amounts
    const totalAmount = service.price * days;
    const platformFee = Math.round(totalAmount * 0.15);
    const hostEarningsAmount = totalAmount - platformFee;
    const grandTotal = totalAmount + platformFee;

    console.log('💰 Amounts:', { totalAmount, platformFee, hostEarningsAmount, grandTotal });

    // Validate payment details
    if (paymentMethod === 'card') {
      if (!paymentDetails?.cardNumber || !paymentDetails?.cardholderName) {
        return res.status(400).json({
          success: false,
          message: 'Card number and holder name are required'
        });
      }

      const cardValidation = validateCardNumber(paymentDetails.cardNumber);
      if (!cardValidation.valid) {
        return res.status(400).json({
          success: false,
          message: cardValidation.message
        });
      }
    } else if (paymentMethod === 'bkash') {
      if (!paymentDetails?.bkashNumber) {
        return res.status(400).json({
          success: false,
          message: 'bKash number is required'
        });
      }

      const bkashValidation = validateBkashNumber(paymentDetails.bkashNumber);
      if (!bkashValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `bKash ${bkashValidation.message}`
        });
      }
    }

    // Prepare secure payment details
    const securePaymentDetails = {};
    if (paymentMethod === 'card') {
      const cleaned = paymentDetails.cardNumber.replace(/\s+/g, '');
      securePaymentDetails.cardNumber = '**** **** **** ' + cleaned.slice(-4);
      securePaymentDetails.cardholderName = paymentDetails.cardholderName;
    } else if (paymentMethod === 'bkash') {
      securePaymentDetails.bkashNumber = paymentDetails.bkashNumber;
    }
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    securePaymentDetails.transactionId = transactionId;

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      bookingType: 'host',
      hostId: actualHostId,
      checkIn,
      checkOut,
      guests,
      selectedServices: selectedServices || [],
      totalAmount,
      platformFee,
      grandTotal,
      notes,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod,
      paymentDetails: securePaymentDetails
    });

    await booking.save();
    console.log('✅ Booking saved:', booking._id);

    // Create earning record for host
    const earning = new HostEarning({
      hostId: actualHostId,
      userId: host.userId,
      bookingId: booking._id,
      amount: totalAmount,
      platformFee,
      hostEarnings: hostEarningsAmount,
      bookingDetails: {
        guestName: req.user.fullName,
        guestEmail: req.user.email,
        checkIn,
        checkOut,
        guests,
        location: host.location,
        days
      },
      status: 'completed',
      paymentMethod,
      transactionId
    });

    await earning.save();
    console.log('💰 Earning recorded:', earning._id, '৳' + hostEarningsAmount);

    // Update host stats
    host.totalBookings = (host.totalBookings || 0) + 1;
    await host.save();

    /// Create trip record
const trip = new Trip({
  destination: host.location,
  date: checkIn,
  endDate: checkOut,
  host: host.name,
  hostAvatar: host.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.name.replace(/\s/g, '')}`,
  // ✅ FIX: Use service.propertyImage with fallback to location image
  image: service.propertyImage || getLocationImage(host.location) || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  services: selectedServices || [],
  guests,
  totalAmount: grandTotal,
  // ✅ FIX: Ensure hostRating is at least 1
  hostRating: host.rating && host.rating > 0 ? host.rating : 4.5,
  description: `Experience ${host.location} with ${host.name}`,
  userId: req.user._id,
  status: 'upcoming'
});

    await trip.save();
    console.log('✅ Trip saved:', trip._id);

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        transactionId,
        totalAmount: grandTotal,
        hostEarnings: hostEarningsAmount,
        platformFee
      }
    });
  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============ NEW ENDPOINT: Get Host Earnings ============

app.get('/api/hosts/earnings', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Only hosts can view earnings'
      });
    }

    const hostProfile = await Host.findOne({ userId: req.user._id });

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Get all earnings
    const earnings = await HostEarning.find({ hostId: hostProfile._id })
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, e) => sum + e.hostEarnings, 0);
    const totalBookings = earnings.length;
    const completedBookings = earnings.filter(e => e.status === 'completed').length;
    const paidEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.hostEarnings, 0);
    const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.hostEarnings, 0);

    res.json({
      success: true,
      earnings: {
        totalEarnings,
        totalBookings,
        completedBookings,
        paidEarnings,
        pendingEarnings,
        recentTransactions: earnings.map(e => ({
          _id: e._id,
          amount: e.hostEarnings,
          totalAmount: e.amount,
          platformFee: e.platformFee,
          guestName: e.bookingDetails.guestName,
          location: e.bookingDetails.location,
          days: e.bookingDetails.days,
          status: e.status,
          transactionId: e.transactionId,
          date: e.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('❌ Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings'
    });
  }
});

// ============ NEW ENDPOINT: Get Earnings Summary ============

app.get('/api/hosts/earnings/summary', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Only hosts can view earnings'
      });
    }

    const hostProfile = await Host.findOne({ userId: req.user._id });

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Get earnings from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allTimeEarnings = await HostEarning.find({ hostId: hostProfile._id });
    const thisMonthEarnings = await HostEarning.find({
      hostId: hostProfile._id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const totalEarnings = allTimeEarnings.reduce((sum, e) => sum + e.hostEarnings, 0);
    const thisMonthTotal = thisMonthEarnings.reduce((sum, e) => sum + e.hostEarnings, 0);
    const thisMonthBookings = thisMonthEarnings.length;

    res.json({
      success: true,
      summary: {
        allTime: {
          totalEarnings: Math.round(totalEarnings),
          totalBookings: allTimeEarnings.length,
          averagePerBooking: allTimeEarnings.length > 0 ? Math.round(totalEarnings / allTimeEarnings.length) : 0
        },
        thisMonth: {
          earnings: Math.round(thisMonthTotal),
          bookings: thisMonthBookings,
          averagePerBooking: thisMonthBookings > 0 ? Math.round(thisMonthTotal / thisMonthBookings) : 0
        }
      }
    });
  } catch (error) {
    console.error('❌ Get earnings summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings summary'
    });
  }
});


// AI Configuration
const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  },
  cohere: {
    apiKey: process.env.COHERE_API_KEY,
    model: 'command',
    temperature: 0.7
  },
  weather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5'
  },
  news: {
    apiKey: process.env.NEWS_API_KEY,
    baseUrl: 'https://newsapi.org/v2'
  }
};

// Helper function to call OpenAI
async function callOpenAI(messages, options = {}) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: options.model || AI_CONFIG.openai.model,
      messages: messages,
      temperature: options.temperature || AI_CONFIG.openai.temperature,
      max_tokens: options.maxTokens || AI_CONFIG.openai.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Helper function to call Cohere
async function callCohere(prompt, options = {}) {
  try {
    const response = await axios.post('https://api.cohere.ai/v1/generate', {
      model: options.model || AI_CONFIG.cohere.model,
      prompt: prompt,
      temperature: options.temperature || AI_CONFIG.cohere.temperature,
      max_tokens: options.maxTokens || 1000,
      stop_sequences: options.stopSequences || []
    }, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.cohere.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Cohere API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Mood-based destination recommendation (Protected)
app.post('/api/ai/mood-analysis', authenticate, async (req, res) => {
  try {
    const { mood, preferences, budget, duration } = req.body;
    const startTime = Date.now();

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood is required for analysis'
      });
    }

    // Get user's travel history for personalization
    const userTrips = await Trip.find({ userId: req.user._id })
      .select('destination date')
      .limit(10);

    // Prepare AI prompt
    const systemPrompt = `You are a travel expert specializing in Bangladesh tourism. 
    Recommend specific destinations based on user mood and preferences.
    Consider: budget constraints, travel duration, seasonality, and local conditions.
    Format response as JSON with: destinations array containing name, matchScore, description, bestTime, estimatedCost, highlights, and recommendations.`;

    const userPrompt = `User mood: ${mood}
    Preferences: ${preferences || 'Not specified'}
    Budget: ${budget || 'Flexible'}
    Duration: ${duration || 'Flexible'}
    User's travel history: ${userTrips.map(t => `${t.destination} (${t.date})`).join(', ')}
    
    Recommend 4 destinations in Bangladesh that match this mood. For each destination, provide:
    1. Name
    2. Match score (0-100)
    3. Brief description
    4. Best time to visit
    5. Estimated cost range
    6. 3-4 highlights
    7. 2-3 specific recommendations for this destination`;

    // Call AI service
    const aiResponse = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    const content = aiResponse.choices[0]?.message?.content;
    let destinations = [];

    try {
      // Parse JSON response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n|\n```/g, '') : content;
      const parsed = JSON.parse(jsonStr);
      destinations = parsed.destinations || [];
    } catch (parseError) {
      // Fallback parsing
      destinations = parseTextToDestinations(content);
    }

    // Fetch images for destinations
    const destinationsWithImages = await Promise.all(
      destinations.map(async (dest, index) => {
        // Try to get destination from database first
        const dbDestination = await Destination.findOne({ 
          name: { $regex: new RegExp(dest.name, 'i') } 
        });

        return {
          ...dest,
          id: index + 1,
          image: dbDestination?.images?.[0] || getDefaultDestinationImage(dest.name),
          coordinates: dbDestination?.coordinates || null,
          safetyScore: dbDestination?.safetyScore || 70,
          accessibilityScore: dbDestination?.accessibilityScore || 75
        };
      })
    );

    // Save analysis to database
    const analysis = new AIAnalysis({
      userId: req.user._id,
      analysisType: 'mood',
      inputData: {
        mood,
        preferences,
        budget,
        duration,
        travelHistory: userTrips.length
      },
      outputData: {
        destinations: destinationsWithImages,
        count: destinationsWithImages.length
      },
      processingTime: Date.now() - startTime,
      aiModel: AI_CONFIG.openai.model,
      accuracyScore: calculateAccuracyScore(destinationsWithImages),
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await analysis.save();

    res.json({
      success: true,
      message: 'Mood analysis completed',
      analysisId: analysis._id,
      destinations: destinationsWithImages,
      personalization: {
        basedOnTrips: userTrips.length,
        accuracy: analysis.accuracyScore
      },
      processingTime: analysis.processingTime
    });

  } catch (error) {
    console.error('Mood analysis error:', error);
    
    // Save failed analysis
    const analysis = new AIAnalysis({
      userId: req.user._id,
      analysisType: 'mood',
      inputData: req.body,
      status: 'failed',
      errorMessage: error.message,
      processingTime: Date.now() - startTime
    });
    await analysis.save();

    res.status(500).json({
      success: false,
      message: 'Failed to analyze mood',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate itinerary (Protected)
app.post('/api/ai/itineraries', authenticate, async (req, res) => {
  try {
    const { 
      destination, 
      duration, 
      budget, 
      travelers, 
      preferences,
      startDate,
      specialRequirements 
    } = req.body;

    if (!destination || !duration || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Destination, duration, and budget are required'
      });
    }

    const startTime = Date.now();

    // Fetch real-time data
    const [weatherData, transportOptions, accommodationOptions, destinationInfo] = await Promise.all([
      fetchWeatherForecast(destination, startDate),
      fetchTransportationOptions(destination, startDate),
      fetchAccommodationOptions(destination, budget, travelers),
      Destination.findOne({ name: { $regex: new RegExp(destination, 'i') } })
    ]);

    // Prepare AI prompt for itinerary
    const systemPrompt = `You are a professional travel planner specializing in Bangladesh.
    Create detailed, practical, and optimized itineraries.
    Consider: weather conditions, local events, transportation options, and budget constraints.
    Include specific times, locations, costs, and booking information where applicable.
    Format response as JSON with: days array containing dayNumber, date, title, activities array, meals, accommodations, transportation, totalCost, and notes.`;

    const userPrompt = `Create a ${duration} itinerary for ${destination}, Bangladesh.
    Budget: ${budget} BDT
    Travelers: ${travelers} person(s)
    Preferences: ${preferences || 'General tourism'}
    Special Requirements: ${specialRequirements || 'None'}
    Start Date: ${startDate || 'Not specified'}
    
    Weather Forecast: ${JSON.stringify(weatherData)}
    Available Transport: ${JSON.stringify(transportOptions.slice(0, 3))}
    Available Accommodations: ${JSON.stringify(accommodationOptions.slice(0, 3))}
    Destination Info: ${JSON.stringify(destinationInfo || {})}
    
    Create a detailed day-by-day itinerary with:
    1. Daily schedule with specific times
    2. Activity descriptions
    3. Estimated costs
    4. Transportation details
    5. Meal suggestions
    6. Accommodation recommendations
    7. Packing suggestions
    8. Emergency contacts
    9. Budget breakdown`;

    // Call AI service
    const aiResponse = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    const content = aiResponse.choices[0]?.message?.content;
    let itineraryData;

    try {
      // Parse JSON response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n|\n```/g, '') : content;
      itineraryData = JSON.parse(jsonStr);
    } catch (parseError) {
      // Fallback parsing
      itineraryData = parseTextToItinerary(content, {
        destination,
        duration,
        budget,
        travelers
      });
    }

    // Create itinerary in database
    const itinerary = new Itinerary({
      userId: req.user._id,
      title: `${duration} Trip to ${destination}`,
      destination: destinationInfo?._id,
      destinationName: destination,
      duration: {
        days: parseInt(duration.split(' ')[0]) || 3,
        nights: parseInt(duration.split(' ')[0]) - 1 || 2
      },
      budget: {
        total: parseInt(budget),
        currency: 'BDT',
        breakdown: itineraryData.budgetBreakdown || {
          accommodation: parseInt(budget) * 0.4,
          transportation: parseInt(budget) * 0.3,
          food: parseInt(budget) * 0.2,
          activities: parseInt(budget) * 0.1,
          misc: 0
        }
      },
      travelers: {
        adults: travelers,
        children: 0,
        infants: 0
      },
      preferences: preferences ? preferences.split(',').map(p => p.trim()) : [],
      days: itineraryData.days || [],
      inclusions: itineraryData.inclusions || [],
      exclusions: itineraryData.exclusions || [],
      recommendations: itineraryData.recommendations || [],
      packingList: itineraryData.packingList || [],
      emergencyContacts: itineraryData.emergencyContacts || [],
      aiGenerated: true,
      status: 'draft'
    });

    await itinerary.save();

    // Save AI analysis
    const analysis = new AIAnalysis({
      userId: req.user._id,
      analysisType: 'itinerary',
      inputData: req.body,
      outputData: {
        itineraryId: itinerary._id,
        destination,
        duration,
        budget
      },
      processingTime: Date.now() - startTime,
      aiModel: AI_CONFIG.openai.model,
      accuracyScore: calculateItineraryAccuracy(itineraryData, {
        weatherData,
        transportOptions,
        accommodationOptions
      }),
      metadata: {
        realTimeData: {
          weather: !!weatherData,
          transport: transportOptions.length,
          accommodation: accommodationOptions.length
        }
      }
    });

    await analysis.save();

    // Populate itinerary
    const populatedItinerary = await Itinerary.findById(itinerary._id)
      .populate('destination')
      .populate('days.accommodations')
      .populate('days.transportation');

    res.status(201).json({
      success: true,
      message: 'Itinerary generated successfully',
      itineraryId: itinerary._id,
      itinerary: populatedItinerary,
      analysisId: analysis._id,
      processingTime: analysis.processingTime,
      dataSources: {
        weather: !!weatherData,
        transport: transportOptions.length,
        accommodation: accommodationOptions.length,
        destination: !!destinationInfo
      }
    });

  } catch (error) {
    console.error('Itinerary generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Risk analysis (Protected)
app.post('/api/ai/risk-analyses', authenticate, async (req, res) => {
  try {
    const { destination, travelDate, duration, travelers, activities } = req.body;

    if (!destination || !travelDate) {
      return res.status(400).json({
        success: false,
        message: 'Destination and travel date are required'
      });
    }

    const startTime = Date.now();

    // Fetch real-time risk data from multiple sources
    const [
      weatherRisk,
      safetyData,
      healthAlerts,
      politicalClimate,
      transportationStatus,
      destinationRiskProfile
    ] = await Promise.all([
      fetchWeatherRisk(destination, travelDate),
      fetchSafetyData(destination),
      fetchHealthAlerts(destination),
      fetchPoliticalClimate(destination),
      fetchTransportationStatus(destination),
      Destination.findOne({ name: { $regex: new RegExp(destination, 'i') } })
        .select('safetyScore emergencyServices')
    ]);

    // Prepare AI prompt for risk analysis
    const systemPrompt = `You are a travel risk assessment expert.
    Analyze multiple risk factors and provide comprehensive safety recommendations.
    Consider: weather patterns, political stability, health conditions, transportation safety, and local crime rates.
    Format response as JSON with: overallRisk (level, score, colorCode), riskFactors array, alerts array, and recommendations array.`;

    const userPrompt = `Analyze travel risk for ${destination}, Bangladesh.
    Travel Date: ${travelDate}
    Duration: ${duration || 'Not specified'}
    Travelers: ${travelers || 1}
    Planned Activities: ${activities || 'General tourism'}
    
    Weather Risk Data: ${JSON.stringify(weatherRisk)}
    Safety Data: ${JSON.stringify(safetyData)}
    Health Alerts: ${JSON.stringify(healthAlerts)}
    Political Climate: ${JSON.stringify(politicalClimate)}
    Transportation Status: ${JSON.stringify(transportationStatus)}
    Destination Risk Profile: ${JSON.stringify(destinationRiskProfile || {})}
    
    Provide comprehensive risk analysis including:
    1. Overall risk level and score
    2. Detailed risk factors with scores
    3. Current alerts and warnings
    4. Specific recommendations for risk mitigation
    5. Emergency contact information
    6. Monitoring suggestions`;

    // Call AI service
    const aiResponse = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    const content = aiResponse.choices[0]?.message?.content;
    let riskData;

    try {
      // Parse JSON response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n|\n```/g, '') : content;
      riskData = JSON.parse(jsonStr);
    } catch (parseError) {
      // Fallback parsing
      riskData = parseTextToRiskAnalysis(content, {
        destination,
        travelDate
      });
    }

    // Create risk analysis in database
    const riskAnalysis = new RiskAnalysis({
      userId: req.user._id,
      destination,
      travelDates: {
        from: new Date(travelDate),
        to: duration ? 
          new Date(new Date(travelDate).getTime() + (parseInt(duration.split(' ')[0]) || 3) * 24 * 60 * 60 * 1000) :
          new Date(new Date(travelDate).getTime() + 3 * 24 * 60 * 60 * 1000)
      },
      riskFactors: riskData.riskFactors || [],
      overallRisk: riskData.overallRisk || {
        level: 'medium',
        score: 50,
        colorCode: '#FFA500'
      },
      alerts: riskData.alerts || [],
      dataSources: {
        weather: weatherRisk,
        political: politicalClimate,
        health: healthAlerts,
        safety: safetyData,
        transportation: transportationStatus
      },
      recommendations: riskData.recommendations || [],
      monitoring: {
        active: true,
        frequency: 'daily',
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    await riskAnalysis.save();

    // Save AI analysis
    const analysis = new AIAnalysis({
      userId: req.user._id,
      analysisType: 'risk',
      inputData: req.body,
      outputData: {
        riskAnalysisId: riskAnalysis._id,
        destination,
        travelDate,
        overallRisk: riskAnalysis.overallRisk
      },
      processingTime: Date.now() - startTime,
      aiModel: AI_CONFIG.openai.model,
      accuracyScore: calculateRiskAccuracy(riskData, {
        weatherRisk,
        safetyData,
        destinationRiskProfile
      }),
      metadata: {
        dataSources: Object.keys(riskAnalysis.dataSources).filter(key => 
          riskAnalysis.dataSources[key] && Object.keys(riskAnalysis.dataSources[key]).length > 0
        )
      }
    });

    await analysis.save();

    res.json({
      success: true,
      message: 'Risk analysis completed',
      riskAnalysisId: riskAnalysis._id,
      analysisId: analysis._id,
      destination,
      travelDate,
      overallRisk: riskAnalysis.overallRisk,
      riskFactors: riskAnalysis.riskFactors,
      alerts: riskAnalysis.alerts,
      recommendations: riskAnalysis.recommendations,
      dataSources: analysis.metadata.dataSources,
      processingTime: analysis.processingTime,
      monitoring: riskAnalysis.monitoring
    });

  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze risk',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's AI analysis history (Protected)
app.get('/api/ai/history', authenticate, async (req, res) => {
  try {
    const { type, limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { userId: req.user._id };
    if (type) {
      query.analysisType = type;
    }

    const analyses = await AIAnalysis.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-inputData -outputData -metadata');

    const total = await AIAnalysis.countDocuments(query);

    res.json({
      success: true,
      analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI history'
    });
  }
});

// Get specific AI analysis (Protected)
app.get('/api/ai/analyses/:id', authenticate, async (req, res) => {
  try {
    const analysis = await AIAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Get AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analysis'
    });
  }
});

// Update itinerary from AI analysis (Protected)
app.put('/api/ai/itineraries/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const itinerary = await Itinerary.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Update itinerary
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'userId') {
        itinerary[key] = updates[key];
      }
    });

    itinerary.version += 1;
    await itinerary.save();

    res.json({
      success: true,
      message: 'Itinerary updated successfully',
      itinerary
    });
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update itinerary'
    });
  }
});

// Get real-time data for destination (Protected)
app.get('/api/ai/destinations/:name/data', authenticate, async (req, res) => {
  try {
    const { name } = req.params;

    const [weather, safety, transport, accommodations] = await Promise.all([
      fetchWeatherForecast(name),
      fetchSafetyData(name),
      fetchTransportationOptions(name),
      fetchAccommodationOptions(name)
    ]);

    res.json({
      success: true,
      destination: name,
      realTimeData: {
        weather,
        safety,
        transport: transport.length,
        accommodations: accommodations.length
      },
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Get destination data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destination data'
    });
  }
});

// Get AI statistics for user (Protected)
app.get('/api/ai/stats', authenticate, async (req, res) => {
  try {
    const [moodCount, itineraryCount, riskCount, recentAnalyses] = await Promise.all([
      AIAnalysis.countDocuments({ userId: req.user._id, analysisType: 'mood' }),
      AIAnalysis.countDocuments({ userId: req.user._id, analysisType: 'itinerary' }),
      AIAnalysis.countDocuments({ userId: req.user._id, analysisType: 'risk' }),
      AIAnalysis.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('analysisType createdAt accuracyScore')
    ]);

    const totalTime = await AIAnalysis.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$processingTime' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalAnalyses: moodCount + itineraryCount + riskCount,
        moodAnalyses: moodCount,
        itineraries: itineraryCount,
        riskAnalyses: riskCount,
        totalProcessingTime: totalTime[0]?.total || 0,
        averageAccuracy: await calculateAverageAccuracy(req.user._id)
      },
      recentAnalyses,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Get AI stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI statistics'
    });
  }
});

// Helper functions
async function fetchWeatherForecast(destination, date) {
  try {
    const response = await axios.get(`${AI_CONFIG.weather.baseUrl}/forecast`, {
      params: {
        q: `${destination},BD`,
        appid: AI_CONFIG.weather.apiKey,
        units: 'metric',
        cnt: date ? 1 : 5
      }
    });
    return response.data;
  } catch (error) {
    console.error('Fetch weather error:', error.message);
    return getFallbackWeather(destination);
  }
}

async function fetchWeatherRisk(destination, date) {
  try {
    const response = await axios.get(`${AI_CONFIG.weather.baseUrl}/forecast`, {
      params: {
        q: `${destination},BD`,
        appid: AI_CONFIG.weather.apiKey,
        units: 'metric'
      }
    });
    
    const forecast = response.data.list[0];
    const risk = analyzeWeatherRisk(forecast);
    
    return {
      riskLevel: risk.level,
      factors: risk.factors,
      temperature: forecast.main.temp,
      condition: forecast.weather[0].main,
      humidity: forecast.main.humidity,
      windSpeed: forecast.wind.speed
    };
  } catch (error) {
    console.error('Fetch weather risk error:', error.message);
    return {
      riskLevel: 'medium',
      factors: ['Limited weather data available'],
      temperature: 25,
      condition: 'Clear',
      humidity: 65,
      windSpeed: 10
    };
  }
}

function analyzeWeatherRisk(weatherData) {
  if (!weatherData) return { level: 'medium', factors: ['No weather data'] };
  
  const condition = weatherData.weather[0].main.toLowerCase();
  const temp = weatherData.main.temp;
  const wind = weatherData.wind.speed;
  
  const factors = [];
  let riskLevel = 'low';
  
  if (condition.includes('thunderstorm') || condition.includes('tornado')) {
    riskLevel = 'high';
    factors.push('Severe weather conditions');
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    riskLevel = 'medium';
    factors.push('Rain expected');
  }
  
  if (temp > 35) {
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    factors.push('High temperatures');
  } else if (temp < 10) {
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    factors.push('Low temperatures');
  }
  
  if (wind > 20) {
    riskLevel = riskLevel === 'low' ? 'medium' : riskLevel === 'medium' ? 'high' : riskLevel;
    factors.push('Strong winds');
  }
  
  return { level: riskLevel, factors };
}

async function fetchSafetyData(destination) {
  try {
    // Using Travel Advisory API
    const response = await axios.get('https://www.travel-advisory.info/api', {
      params: {
        countrycode: 'BD'
      }
    });
    
    const data = response.data.data?.BD;
    return {
      advisory: data?.advisory || 'Exercise normal precautions',
      score: data?.score || 2,
      lastUpdated: data?.updated || new Date().toISOString(),
      sources: data?.sources || []
    };
  } catch (error) {
    console.error('Fetch safety data error:', error.message);
    return {
      advisory: 'Exercise normal precautions',
      score: 2,
      lastUpdated: new Date().toISOString(),
      sources: []
    };
  }
}

async function fetchHealthAlerts(destination) {
  try {
    // Using Disease.sh API for health alerts
    const response = await axios.get('https://disease.sh/v3/covid-19/countries/BD');
    const data = response.data;
    
    return {
      covid19: {
        cases: data.cases,
        todayCases: data.todayCases,
        deaths: data.deaths,
        recovered: data.recovered,
        active: data.active
      },
      alerts: data.cases > 1000 ? ['COVID-19 cases reported'] : [],
      lastUpdated: data.updated
    };
  } catch (error) {
    console.error('Fetch health alerts error:', error.message);
    return {
      covid19: null,
      alerts: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

async function fetchPoliticalClimate(destination) {
  try {
    // Using News API for political news
    const response = await axios.get(`${AI_CONFIG.news.baseUrl}/everything`, {
      params: {
        q: `${destination} Bangladesh politics stability`,
        apiKey: AI_CONFIG.news.apiKey,
        pageSize: 5,
        sortBy: 'publishedAt'
      }
    });
    
    return {
      articles: response.data.articles || [],
      stability: 'Generally stable',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Fetch political climate error:', error.message);
    return {
      articles: [],
      stability: 'Generally stable',
      lastUpdated: new Date().toISOString()
    };
  }
}

async function fetchTransportationOptions(destination, date) {
  try {
    const query = { 
      to: { $regex: new RegExp(destination, 'i') },
      availableSeats: { $gt: 0 }
    };
    
    if (date) {
      query.departureDate = date;
    }
    
    const transportation = await Transportation.find(query)
      .limit(10)
      .sort({ price: 1 });
    
    return transportation;
  } catch (error) {
    console.error('Fetch transportation error:', error.message);
    return [];
  }
}

async function fetchTransportationStatus(destination) {
  try {
    const options = await fetchTransportationOptions(destination);
    
    return {
      available: options.length > 0,
      count: options.length,
      types: [...new Set(options.map(t => t.type))],
      averagePrice: options.reduce((sum, t) => sum + t.price, 0) / options.length || 0,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Fetch transportation status error:', error.message);
    return {
      available: false,
      count: 0,
      types: [],
      averagePrice: 0,
      lastUpdated: new Date()
    };
  }
}

async function fetchAccommodationOptions(destination, budget, travelers) {
  try {
    const query = { 
      location: { $regex: new RegExp(destination, 'i') },
      available: true
    };
    
    if (budget) {
      query.price = { $lte: parseInt(budget) };
    }
    
    const hosts = await Host.find(query)
      .limit(10)
      .sort({ rating: -1, price: 1 });
    
    return hosts;
  } catch (error) {
    console.error('Fetch accommodation error:', error.message);
    return [];
  }
}

function getDefaultDestinationImage(destinationName) {
  const imageMap = {
    'Cox\'s Bazar': 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?w=1080&q=80',
    'Sajek Valley': 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=1080&q=80',
    'Sylhet': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80',
    'Bandarban': 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=1080&q=80',
    'Rangamati': 'https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?w=1080&q=80',
    'Sundarbans': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1080&q=80',
    'Dhaka': 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?w=1080&q=80',
    'Chittagong': 'https://images.unsplash.com/photo-1594736797933-d1dec6b7262f?w=1080&q=80'
  };
  
  return imageMap[destinationName] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80';
}

function getFallbackWeather(destination) {
  return {
    main: {
      temp: 25,
      humidity: 65,
      pressure: 1013
    },
    weather: [{
      main: 'Clear',
      description: 'clear sky'
    }],
    wind: {
      speed: 10,
      deg: 180
    },
    clouds: {
      all: 20
    }
  };
}

function parseTextToDestinations(text) {
  const destinations = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentDest = null;
  lines.forEach(line => {
    const nameMatch = line.match(/^\d+\.\s+(.+?):/);
    if (nameMatch) {
      if (currentDest) destinations.push(currentDest);
      currentDest = {
        name: nameMatch[1].trim(),
        matchScore: 80 + Math.random() * 20,
        description: '',
        bestTime: 'October to March',
        estimatedCost: '৳' + Math.floor(5000 + Math.random() * 15000),
        highlights: [],
        recommendations: []
      };
    } else if (currentDest) {
      if (line.includes('Description:') || line.includes('description:')) {
        currentDest.description = line.split(':')[1]?.trim() || 'Beautiful destination';
      } else if (line.includes('Highlights:') || line.includes('highlights:')) {
        // Parse highlights
      } else if (line.includes('Recommendations:') || line.includes('recommendations:')) {
        // Parse recommendations
      }
    }
  });
  
  if (currentDest) destinations.push(currentDest);
  return destinations.slice(0, 4);
}

function parseTextToItinerary(text, context) {
  const days = [];
  const sections = text.split(/(?:^|\n)Day\s+\d+/i).filter(section => section.trim());
  
  sections.forEach((section, index) => {
    const lines = section.split('\n').filter(line => line.trim());
    const activities = [];
    
    lines.forEach(line => {
      const timeMatch = line.match(/(\d{1,2}[:.]\d{2}\s*(?:AM|PM|am|pm)?)/);
      if (timeMatch) {
        const activity = line.replace(timeMatch[0], '').trim();
        activities.push({
          time: timeMatch[0],
          activity: activity,
          location: context.destination,
          description: activity,
          cost: 0,
          bookingRequired: false
        });
      }
    });
    
    if (activities.length > 0) {
      days.push({
        dayNumber: index + 1,
        title: `Day ${index + 1}: Explore ${context.destination}`,
        activities: activities.slice(0, 6),
        meals: [],
        totalCost: 0,
        notes: ''
      });
    }
  });
  
  return {
    days: days.slice(0, parseInt(context.duration.split(' ')[0]) || 3),
    inclusions: ['Accommodation', 'Transportation', 'Guide'],
    exclusions: ['Flights', 'Travel Insurance', 'Personal Expenses'],
    recommendations: [
      'Book accommodations in advance',
      'Carry local currency',
      'Learn basic local phrases'
    ],
    packingList: ['Clothing', 'Medications', 'Travel documents', 'Camera']
  };
}

function parseTextToRiskAnalysis(text, context) {
  const riskFactors = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentCategory = '';
  lines.forEach(line => {
    const categoryMatch = line.match(/^(Weather|Health|Safety|Political|Transportation):/i);
    if (categoryMatch) {
      currentCategory = categoryMatch[1];
      riskFactors.push({
        category: currentCategory,
        riskLevel: 'medium',
        score: 50,
        description: line.replace(/^[^:]+:\s*/, '').trim() || 'No specific information available',
        recommendations: ['Exercise normal precautions']
      });
    }
  });
  
  return {
    overallRisk: {
      level: 'medium',
      score: 50,
      colorCode: '#FFA500'
    },
    riskFactors: riskFactors.slice(0, 5),
    alerts: [],
    recommendations: [
      'Check weather forecast regularly',
      'Keep emergency contacts handy',
      'Purchase travel insurance'
    ]
  };
}

function calculateAccuracyScore(destinations) {
  if (!destinations || destinations.length === 0) return 0;
  
  const avgMatchScore = destinations.reduce((sum, dest) => sum + (dest.matchScore || 70), 0) / destinations.length;
  return Math.min(100, Math.max(0, avgMatchScore));
}

function calculateItineraryAccuracy(itinerary, dataSources) {
  let score = 50; // Base score
  
  // Add points for real-time data integration
  if (dataSources.weatherData) score += 10;
  if (dataSources.transportOptions && dataSources.transportOptions.length > 0) score += 15;
  if (dataSources.accommodationOptions && dataSources.accommodationOptions.length > 0) score += 15;
  
  // Add points for itinerary completeness
  if (itinerary.days && itinerary.days.length > 0) score += 10;
  if (itinerary.recommendations && itinerary.recommendations.length > 0) score += 5;
  if (itinerary.packingList && itinerary.packingList.length > 0) score += 5;
  
  return Math.min(100, score);
}

function calculateRiskAccuracy(riskData, dataSources) {
  let score = 60; // Base score
  
  // Add points for comprehensive risk factors
  if (riskData.riskFactors && riskData.riskFactors.length >= 3) score += 10;
  if (riskData.alerts && riskData.alerts.length > 0) score += 10;
  if (riskData.recommendations && riskData.recommendations.length >= 3) score += 10;
  
  // Add points for real-time data
  if (dataSources.weatherRisk) score += 5;
  if (dataSources.safetyData) score += 5;
  if (dataSources.destinationRiskProfile) score += 5;
  
  // Deduct points for missing critical information
  if (!riskData.overallRisk || !riskData.overallRisk.level) score -= 20;
  
  return Math.min(100, Math.max(0, score));
}

async function calculateAverageAccuracy(userId) {
  const result = await AIAnalysis.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, average: { $avg: '$accuracyScore' } } }
  ]);
  
  return result[0]?.average || 0;
}

// Seed destinations data (Development only)
app.post('/api/ai/destinations/seed', authenticate, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Seed endpoint disabled in production'
    });
  }

  try {
    // Clear existing destinations
    await Destination.deleteMany({});

    const sampleDestinations = [
      {
        name: "Cox's Bazar",
        region: 'Chittagong',
        type: ['beach', 'adventure', 'cultural'],
        coordinates: { lat: 21.4272, lng: 92.0058 },
        description: 'World\'s longest natural sea beach with golden sands, stretching over 120 km. Famous for sunsets, seafood, and water sports.',
        bestTimeToVisit: { from: 'November', to: 'February' },
        weatherPatterns: [
          { month: 'November', avgTemp: 25, condition: 'Pleasant', rainfall: 20 },
          { month: 'December', avgTemp: 22, condition: 'Cool', rainfall: 10 },
          { month: 'January', avgTemp: 20, condition: 'Cool', rainfall: 5 }
        ],
        averageCost: {
          budget: 8000,
          midRange: 15000,
          luxury: 30000
        },
        popularityScore: 95,
        safetyScore: 85,
        accessibilityScore: 90,
        tags: ['beach', 'sunset', 'seafood', 'water-sports', 'family'],
        images: [
          'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?w=1080&q=80',
          'https://images.unsplash.com/photo-1594736797933-d1dec6b7262f?w=1080&q=80'
        ],
        localContacts: [
          { name: 'Tourist Police', type: 'Emergency', phone: '999', verified: true },
          { name: 'Beach Authority', type: 'Information', phone: '+880-XXX-XXXXXX', verified: true }
        ],
        emergencyServices: {
          police: '999',
          hospital: '+880-XXX-XXXXXX',
          ambulance: '1999'
        }
      },
      {
        name: 'Sajek Valley',
        region: 'Rangamati',
        type: ['mountain', 'adventure', 'nature'],
        coordinates: { lat: 23.3820, lng: 92.2868 },
        description: 'Known as the "Queen of Hills" in Bangladesh. Offers breathtaking views of clouds, hills, and indigenous tribal culture.',
        bestTimeToVisit: { from: 'October', to: 'March' },
        weatherPatterns: [
          { month: 'October', avgTemp: 22, condition: 'Pleasant', rainfall: 50 },
          { month: 'November', avgTemp: 20, condition: 'Cool', rainfall: 30 },
          { month: 'December', avgTemp: 18, condition: 'Cold', rainfall: 10 }
        ],
        averageCost: {
          budget: 6000,
          midRange: 12000,
          luxury: 25000
        },
        popularityScore: 88,
        safetyScore: 80,
        accessibilityScore: 70,
        tags: ['hills', 'clouds', 'tribal', 'trekking', 'photography'],
        images: [
          'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=1080&q=80'
        ],
        emergencyServices: {
          police: '999',
          hospital: '+880-XXX-XXXXXX',
          ambulance: '1999'
        }
      },
      {
        name: 'Sylhet',
        region: 'Sylhet',
        type: ['cultural', 'nature', 'religious'],
        coordinates: { lat: 24.8949, lng: 91.8687 },
        description: 'Famous for tea gardens, shrines, and natural beauty. Home to Ratargul Swamp Forest and Jaflong.',
        bestTimeToVisit: { from: 'October', to: 'March' },
        weatherPatterns: [
          { month: 'October', avgTemp: 26, condition: 'Pleasant', rainfall: 200 },
          { month: 'November', avgTemp: 24, condition: 'Pleasant', rainfall: 100 },
          { month: 'December', avgTemp: 20, condition: 'Cool', rainfall: 50 }
        ],
        averageCost: {
          budget: 7000,
          midRange: 13000,
          luxury: 25000
        },
        popularityScore: 85,
        safetyScore: 88,
        accessibilityScore: 85,
        tags: ['tea-garden', 'shrine', 'swamp-forest', 'waterfall', 'cultural'],
        images: [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80'
        ],
        emergencyServices: {
          police: '999',
          hospital: '+880-XXX-XXXXXX',
          ambulance: '1999'
        }
      }
    ];

    const createdDestinations = await Destination.insertMany(sampleDestinations);

    res.status(201).json({
      success: true,
      message: 'Sample destinations seeded successfully',
      count: createdDestinations.length,
      destinations: createdDestinations
    });
  } catch (error) {
    console.error('Seed destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding destinations',
      error: error.message
    });
  }
});


// Helper function to check if dates overlap
function datesOverlap(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

// Helper function to check service availability
const checkServiceAvailability = (service, checkIn, checkOut) => {
  const requestedCheckIn = new Date(checkIn);
  const requestedCheckOut = new Date(checkOut);
  
  const availFrom = new Date(service.availableFromDate);
  const availTo = new Date(service.availableToDate);
  
  // Check if dates are within service availability period
  if (requestedCheckIn < availFrom || requestedCheckOut > availTo) {
    return {
      available: false,
      reason: 'Dates outside service availability period',
      conflictingBookings: []
    };
  }
  
  // Check if bookedDates exists and is an array
  if (!service.bookedDates || !Array.isArray(service.bookedDates) || service.bookedDates.length === 0) {
    return { 
      available: true, 
      reason: 'Available', 
      conflictingBookings: [] 
    };
  }
  
  // Filter out cancelled bookings
  const activeBookings = service.bookedDates.filter(booking => 
    booking && booking.status !== 'cancelled'
  );
  
  if (activeBookings.length === 0) {
    return { 
      available: true, 
      reason: 'Available', 
      conflictingBookings: [] 
    };
  }
  
  // Check for date conflicts with active bookings
  const conflicts = activeBookings.filter(booking => {
    const bookedCheckIn = new Date(booking.checkIn);
    const bookedCheckOut = new Date(booking.checkOut);
    return datesOverlap(requestedCheckIn, requestedCheckOut, bookedCheckIn, bookedCheckOut);
  });
  
  if (conflicts.length > 0) {
    return {
      available: false,
      reason: 'Service already booked for these dates',
      conflictingBookings: conflicts
    };
  }
  
  return { available: true, reason: 'Available', conflictingBookings: [] };
};

// Helper function to check if service is fully booked
const isServiceFullyBooked = (service) => {
  if (!service.bookedDates || !Array.isArray(service.bookedDates) || service.bookedDates.length === 0) {
    return false;
  }
  
  // Filter active (non-cancelled) bookings
  const activeBookings = service.bookedDates.filter(booking => 
    booking && booking.status !== 'cancelled'
  );
  
  if (activeBookings.length === 0) {
    return false;
  }
  
  const availFrom = new Date(service.availableFromDate);
  const availTo = new Date(service.availableToDate);
  
  // Check if there's a booking that covers the entire availability period
  const fullyBooking = activeBookings.some(booking => {
    const bookedCheckIn = new Date(booking.checkIn);
    const bookedCheckOut = new Date(booking.checkOut);
    
    // Check if this booking covers the entire available period
    return bookedCheckIn <= availFrom && bookedCheckOut >= availTo;
  });
  
  return fullyBooking;
};


// Add these endpoints to your server.js file

// ==================== REVIEW AND RECEIPT ENDPOINTS ====================

// Review Schema (add to schemas section)
const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

// Submit a review for a booking (Protected)
app.post('/api/bookings/:id/review', authenticate, async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('hostId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // ✅ FIX: Check if booking date has passed OR if it's cancelled
    // Instead of checking booking.status === 'completed'
    const bookingDate = new Date(booking.checkIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    
    const hasStarted = bookingDate <= today;
    const isCancelled = booking.status === 'cancelled';
    
    if (!hasStarted && !isCancelled) {
      return res.status(400).json({
        success: false,
        message: 'You can only review bookings that have started or been cancelled'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      bookingId: booking._id,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const newReview = new Review({
      bookingId: booking._id,
      userId: req.user._id,
      hostId: booking.hostId._id,
      rating: parseInt(rating),
      review: review?.trim() || null
    });

    await newReview.save();

    // Update host rating
    const host = await Host.findById(booking.hostId._id);
    if (host) {
      const allReviews = await Review.find({ hostId: host._id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      host.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
      host.reviews = allReviews.length;
      await host.save();
    }

    console.log(`✅ Review submitted for booking: ${booking.bookingId}`);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview
    });
  } catch (error) {
    console.error('❌ Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get receipt for a booking (Protected)
app.get('/api/bookings/:id/receipt', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('hostId', 'name location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const receipt = {
      bookingId: booking.bookingId,
      hostName: booking.hostId?.name || 'Host',
      location: booking.hostId?.location || 'Location',
      checkIn: booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A',
      checkOut: booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A',
      guests: booking.guests,
      services: booking.selectedServices,
      paymentMethod: booking.paymentMethod === 'card' ? 'Credit/Debit Card' : 'bKash',
      totalAmount: booking.grandTotal,
      bookingDate: new Date(booking.createdAt).toLocaleDateString(),
      status: booking.status
    };

    res.json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error('❌ Get receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get e-ticket for a transport booking (Protected)
app.get('/api/transport-tickets/:bookingId/ticket', authenticate, async (req, res) => {
  try {
    const ticket = await TransportTicket.findOne({
      bookingId: req.params.bookingId,
      userId: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      ticket: {
        bookingId: ticket.bookingId,
        pnr: ticket.pnr,
        transportType: ticket.transportType,
        provider: ticket.provider,
        from: ticket.from,
        to: ticket.to,
        journeyDate: ticket.journeyDate,
        departureTime: ticket.departureTime,
        arrivalTime: ticket.arrivalTime,
        duration: ticket.duration,
        passengers: ticket.passengers,
        totalAmount: ticket.totalAmount,
        contactEmail: ticket.contactEmail,
        contactPhone: ticket.contactPhone,
        status: ticket.status
      }
    });
  } catch (error) {
    console.error('❌ Get e-ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching e-ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all reviews for a host (Public)
app.get('/api/hosts/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ hostId: req.params.id })
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: reviews.length,
      reviews: reviews.map(r => ({
        id: r._id,
        rating: r.rating,
        review: r.review,
        author: {
          name: r.userId.fullName,
          username: r.userId.username
        },
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Get host reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// ==================== BOOKING ROUTES ====================

// Create booking (Protected)
app.post('/api/bookings', authenticate, async (req, res) => {
  try {
    const {
      bookingType,
      hostId,
      transportationId,
      checkIn,
      checkOut,
      travelDate,
      guests,
      passengers,
      seatClass,
      selectedServices,
      notes
    } = req.body;

    // Validation
    if (!bookingType || (bookingType === 'host' && !hostId) || (bookingType === 'transportation' && !transportationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data'
      });
    }

    let totalAmount = 0;
    let platformFee = 0;
    let grandTotal = 0;

    if (bookingType === 'host') {
      // Host booking
      const host = await Host.findById(hostId);
      if (!host || !host.available) {
        return res.status(400).json({
          success: false,
          message: 'Host not available'
        });
      }

      if (!checkIn || !checkOut) {
        return res.status(400).json({
          success: false,
          message: 'Check-in and check-out dates required'
        });
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (days <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid dates'
        });
      }

      if (guests > host.maxGuests) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${host.maxGuests} guests allowed`
        });
      }

      totalAmount = host.price * days;
      platformFee = totalAmount * 0.15;
      grandTotal = totalAmount + platformFee;

    } else {
      // Transportation booking
      const transportation = await Transportation.findById(transportationId);
      if (!transportation || transportation.availableSeats < passengers) {
        return res.status(400).json({
          success: false,
          message: 'Not enough seats available'
        });
      }

      if (!travelDate) {
        return res.status(400).json({
          success: false,
          message: 'Travel date required'
        });
      }

      const basePrice = transportation.price;
      const classMultiplier = seatClass === 'Business' ? 2 : seatClass === 'First' ? 3 : 1;
      totalAmount = basePrice * passengers * classMultiplier;
      platformFee = totalAmount * 0.15;
      grandTotal = totalAmount + platformFee;

      // Update available seats
      transportation.availableSeats -= passengers;
      await transportation.save();
    }

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      bookingType,
      hostId: bookingType === 'host' ? hostId : null,
      transportationId: bookingType === 'transportation' ? transportationId : null,
      checkIn: bookingType === 'host' ? checkIn : null,
      checkOut: bookingType === 'host' ? checkOut : null,
      travelDate: bookingType === 'transportation' ? travelDate : null,
      guests: bookingType === 'host' ? guests : null,
      passengers: bookingType === 'transportation' ? passengers : null,
      seatClass: bookingType === 'transportation' ? seatClass : null,
      selectedServices: selectedServices || [],
      totalAmount,
      platformFee,
      grandTotal,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's bookings
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hostId', 'name location price propertyImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('❌ Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// Get all trips for user
// Create trip
app.post('/api/trips', authenticate, async (req, res) => {
  try {
    const {
      destination,
      date,
      endDate,
      host,
      hostAvatar,
      image,
      weather,
      status,
      services,
      checkIn,
      checkOut,
      guests,
      nights,
      totalAmount,
      hostRating,
      description
    } = req.body;

    if (!destination || !date || !endDate || !host) {
      return res.status(400).json({
        success: false,
        message: 'Destination, dates, and host are required'
      });
    }

    const trip = new Trip({
      destination,
      date,
      endDate,
      host,
      hostAvatar: hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.replace(/\s/g, '')}`,
      image: image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80',
      weather: weather || '25°C, Pleasant',
      status: status || 'upcoming',
      services: services || ['Local Guide'],
      checkIn: checkIn || '2:00 PM',
      checkOut: checkOut || '11:00 AM',
      guests: guests || 2,
      nights: nights || 3,
      totalAmount: totalAmount || 12500,
      hostRating: hostRating || 4.5,
      description: description || `Enjoy your stay at ${destination}`,
      userId: req.user._id
    });

    await trip.save();

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip
    });
  } catch (error) {
    console.error('❌ Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trip'
    });
  }
});

// ==================== UPDATED PUT /api/bookings/:id/cancel ENDPOINT ====================
// Replace the existing cancellation endpoint (around line 2675) with this:

// Cancel booking (Protected)
app.put('/api/bookings/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled'
      });
    }

    // Mark booking as cancelled
    booking.status = 'cancelled';
    await booking.save();

    // ✅ NEW: Update service bookedDates to mark this booking as cancelled
    if (booking.bookingType === 'host' && booking.hostId) {
      const host = await Host.findById(booking.hostId);
      if (host) {
        // Find all services for this host
        const services = await HostService.find({ hostId: host._id });
        
        for (const service of services) {
          if (service.bookedDates && Array.isArray(service.bookedDates)) {
            // Find and update the booking status
            const bookingIndex = service.bookedDates.findIndex(b => 
              b.bookingId && b.bookingId.toString() === booking._id.toString()
            );
            
            if (bookingIndex !== -1) {
              service.bookedDates[bookingIndex].status = 'cancelled';
              
              // Check if service should become available again
              if (!isServiceFullyBooked(service)) {
                service.available = true;
                console.log('✅ Service is now available again after cancellation');
              }
              
              await service.save();
              break;
            }
          }
        }
      }
    }

    // Handle transportation booking cancellation (existing code)
    if (booking.bookingType === 'transportation' && booking.transportationId) {
      const transportation = await Transportation.findById(booking.transportationId);
      if (transportation) {
        transportation.availableSeats += booking.passengers || 1;
        await transportation.save();
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('❌ Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Cancel booking (Protected)
app.put('/api/bookings/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled'
      });
    }

    if (booking.bookingType === 'transportation' && booking.transportationId) {
      // Return seats to transportation
      const transportation = await Transportation.findById(booking.transportationId);
      if (transportation) {
        transportation.availableSeats += booking.passengers || 1;
        await transportation.save();
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('❌ Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


//============ HOST SERVICES ROUTES ============

// Get all services for a specific host (Protected)
async function getOrCreateHostProfile(user) {
  let hostProfile = await Host.findOne({ userId: user._id });

  if (!hostProfile) {
    // Auto-create a minimal host profile so service creation doesn't fail
    hostProfile = new Host({
      name: user.fullName || user.username,
      userId: user._id,
      location: '',
      rating: 0,
      reviews: 0,
      verified: false,
      languages: [],
      image: user.profilePicture || null,
      available: false,
      description: '',
      experience: 'Beginner',
      responseTime: 'Within 1 hour',
    });
    await hostProfile.save();
    console.log(`✅ Auto-created Host profile for user: ${user.email}`);
  }

  return hostProfile;
}

// GET /api/host-services/my-services — Get all services for current host
app.get('/api/host-services/my-services', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Only hosts can access their services'
      });
    }

    const hostProfile = await getOrCreateHostProfile(req.user);

    const services = await HostService.find({
      hostId: hostProfile._id,
      active: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('❌ Get host services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/host-services — Create a new service
app.post('/api/host-services', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Only hosts can create services'
      });
    }

    const {
      name,
      description,
      price,
      serviceType,
      location,
      maxGuests,
      minStay,
      propertyImage,
      experience,
      responseTime,
      cancellationPolicy,
      availableFromDate,
      availableToDate
    } = req.body;

    // ── Validation ──────────────────────────────────────────
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Service name is required' });
    }

    if (!location || !String(location).trim()) {
      return res.status(400).json({ success: false, message: 'Location is required' });
    }

    if (price === undefined || price === null || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    if (!Array.isArray(serviceType) || serviceType.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one service type is required' });
    }

    if (!availableFromDate || !availableToDate) {
      return res.status(400).json({ success: false, message: 'Available from date and to date are required' });
    }

    const fromDate = new Date(availableFromDate);
    const toDate = new Date(availableToDate);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ success: false, message: 'Available from date must be before available to date' });
    }

    // Property image required only for accommodation
    const offersAccommodation = serviceType.includes('Accommodation');
    if (offersAccommodation && (!propertyImage || !String(propertyImage).trim())) {
      return res.status(400).json({ success: false, message: 'Property image is required when offering accommodation' });
    }

    // Validate property image URL if provided
    if (propertyImage && String(propertyImage).trim() !== '') {
      try {
        new URL(propertyImage);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid property image URL' });
      }
    }
    // ── End Validation ──────────────────────────────────────

    // Auto-create host profile if missing — no more 404 errors
    const hostProfile = await getOrCreateHostProfile(req.user);

    const service = new HostService({
      hostId: hostProfile._id,
      userId: req.user._id,
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      price: parseFloat(price),
      serviceType,
      location: String(location).trim(),
      maxGuests: maxGuests ? parseInt(maxGuests) : 4,
      minStay: minStay ? parseInt(minStay) : 1,
      propertyImage: propertyImage || '',
      experience: experience || 'Beginner',
      responseTime: responseTime || 'Within 1 hour',
      cancellationPolicy: cancellationPolicy || 'Flexible',
      availableFromDate: fromDate,
      availableToDate: toDate,
      available: true,
      active: true
    });

    await service.save();

    console.log(`✅ Service created: "${service.name}" for host: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('❌ Create service error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== NEW ENDPOINT: Check Service Availability ====================
// Add this NEW endpoint to allow frontend to verify availability before showing booking form
// Add this AFTER the GET /api/host-services endpoint

// GET /api/host-services/:id/availability — Check if a specific service is available
app.get('/api/host-services/:id/availability', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    
    const service = await HostService.findOne({
      _id: req.params.id,
      active: true
    }).populate('hostId', 'name location verified');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    // Check if service is explicitly unavailable
    if (!service.available) {
      return res.json({
        success: true,
        available: false,
        reason: 'Service is currently unavailable',
        service: {
          id: service._id,
          name: service.name,
          location: service.location
        }
      });
    }

    // Check if service is fully booked
    if (isServiceFullyBooked(service)) {
      return res.json({
        success: true,
        available: false,
        reason: 'Service is fully booked for its entire availability period',
        service: {
          id: service._id,
          name: service.name,
          location: service.location,
          availableFrom: service.availableFromDate,
          availableTo: service.availableToDate
        }
      });
    }

    // If specific dates are provided, check those dates
    if (checkIn && checkOut) {
      const availabilityCheck = checkServiceAvailability(service, checkIn, checkOut);
      
      return res.json({
        success: true,
        available: availabilityCheck.available,
        reason: availabilityCheck.reason,
        conflictingBookings: availabilityCheck.conflictingBookings,
        service: {
          id: service._id,
          name: service.name,
          location: service.location,
          availableFrom: service.availableFromDate,
          availableTo: service.availableToDate
        }
      });
    }

    // Service is available
    res.json({
      success: true,
      available: true,
      reason: 'Service is available',
      service: {
        id: service._id,
        name: service.name,
        location: service.location,
        availableFrom: service.availableFromDate,
        availableTo: service.availableToDate,
        price: service.price,
        maxGuests: service.maxGuests
      }
    });

  } catch (error) {
    console.error('❌ Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/host-services/:id — Update a service
app.put('/api/host-services/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ success: false, message: 'Only hosts can update services' });
    }

    const service = await HostService.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const {
      name, description, price, serviceType, location,
      maxGuests, minStay, propertyImage, experience,
      responseTime, cancellationPolicy, availableFromDate,
      availableToDate, available
    } = req.body;

    // Validate dates if both provided
    if (availableFromDate && availableToDate) {
      const from = new Date(availableFromDate);
      const to = new Date(availableToDate);
      if (from > to) {
        return res.status(400).json({ success: false, message: 'Available from date must be before available to date' });
      }
    }

    // Check accommodation image requirement
    const newServiceType = serviceType || service.serviceType;
    const newPropertyImage = propertyImage !== undefined ? propertyImage : service.propertyImage;
    if (newServiceType.includes('Accommodation') && !newPropertyImage) {
      return res.status(400).json({ success: false, message: 'Property image is required when offering accommodation' });
    }

    if (name !== undefined) service.name = String(name).trim();
    if (description !== undefined) service.description = String(description).trim();
    if (price !== undefined) service.price = parseFloat(price);
    if (serviceType !== undefined) service.serviceType = serviceType;
    if (location !== undefined) service.location = String(location).trim();
    if (maxGuests !== undefined) service.maxGuests = parseInt(maxGuests);
    if (minStay !== undefined) service.minStay = parseInt(minStay);
    if (propertyImage !== undefined) service.propertyImage = propertyImage;
    if (experience !== undefined) service.experience = experience;
    if (responseTime !== undefined) service.responseTime = responseTime;
    if (cancellationPolicy !== undefined) service.cancellationPolicy = cancellationPolicy;
    if (availableFromDate) service.availableFromDate = new Date(availableFromDate);
    if (availableToDate) service.availableToDate = new Date(availableToDate);
    if (available !== undefined) service.available = available;

    await service.save();

    console.log(`✅ Service updated: "${service.name}" for host: ${req.user.email}`);

    res.json({ success: true, message: 'Service updated successfully', service });
  } catch (error) {
    console.error('❌ Update service error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/host-services/:id — Soft delete a service
app.delete('/api/host-services/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ success: false, message: 'Only hosts can delete services' });
    }

    const service = await HostService.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    service.active = false;
    service.available = false;
    await service.save();

    console.log(`✅ Service deleted: "${service.name}" for host: ${req.user.email}`);

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('❌ Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



// ==================== ENHANCED GET /api/host-services ENDPOINT ====================
// This version ensures fully booked services NEVER appear in Book Travel page
// Replace the existing GET /api/host-services endpoint (around line 3290) with this:

// GET /api/host-services — Public listing with filters (ENHANCED VERSION)
app.get('/api/host-services', async (req, res) => {
  try {
    const {
      location, minPrice, maxPrice, serviceType,
      availableFrom, availableTo, limit = 20, page = 1
    } = req.query;

    // ✅ CRITICAL: Only fetch services that are active
    let query = { active: true };

    if (location) query.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (serviceType) query.serviceType = serviceType;
    if (availableFrom && availableTo) {
      query.availableFromDate = { $lte: new Date(availableFrom) };
      query.availableToDate = { $gte: new Date(availableTo) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch all matching services
    const allServices = await HostService.find(query)
      .populate('hostId', 'name location rating reviews verified hostBadge')
      .sort({ createdAt: -1 });

    // ✅ CRITICAL: Filter out fully booked services BEFORE pagination
    const availableServices = allServices.filter(service => {
      // 1. If service is explicitly marked unavailable, exclude it
      if (service.available === false) {
        console.log(`🚫 Service "${service.name}" excluded: marked unavailable`);
        return false;
      }
      
      // 2. Check if service is fully booked
      if (isServiceFullyBooked(service)) {
        console.log(`🚫 Service "${service.name}" excluded: fully booked`);
        return false;
      }
      
      // 3. If host is not available, exclude the service
      if (service.hostId && !service.hostId.verified) {
        // Optional: You can also filter by host verification status
        // Uncomment the line below if you want to hide unverified hosts
        // return false;
      }
      
      console.log(`✅ Service "${service.name}" included: available for booking`);
      return true;
    });

    // Apply pagination to filtered results
    const paginatedServices = availableServices.slice(skip, skip + parseInt(limit));
    const total = availableServices.length;

    console.log(`📊 Services Summary: ${allServices.length} total, ${availableServices.length} available, ${paginatedServices.length} returned`);

    res.json({
      success: true,
      count: paginatedServices.length,
      total,
      totalAvailable: availableServices.length,
      totalInDatabase: allServices.length,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      services: paginatedServices
    });
  } catch (error) {
    console.error('❌ Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/host-services/stats/my-stats — Service statistics
app.get('/api/host-services/stats/my-stats', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ success: false, message: 'Only hosts can access service statistics' });
    }

    const hostProfile = await getOrCreateHostProfile(req.user);

    const [totalServices, activeServices, totalBookingsAgg, avgRatingAgg] = await Promise.all([
      HostService.countDocuments({ hostId: hostProfile._id }),
      HostService.countDocuments({ hostId: hostProfile._id, active: true, available: true }),
      HostService.aggregate([
        { $match: { hostId: hostProfile._id } },
        { $group: { _id: null, total: { $sum: '$totalBookings' } } }
      ]),
      HostService.aggregate([
        { $match: { hostId: hostProfile._id, reviews: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalServices,
        activeServices,
        inactiveServices: totalServices - activeServices,
        totalBookings: totalBookingsAgg[0]?.total || 0,
        averageRating: avgRatingAgg[0]?.avg || 0
      }
    });
  } catch (error) {
    console.error('❌ Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== MESSAGE ROUTES ====================

// REPLACE the existing GET /api/messages/conversations endpoint in your server.js with this:

// Get conversations for current user (Protected) - IMPROVED VERSION
app.get('/api/messages/conversations', authenticate, async (req, res) => {
  try {
    console.log('📬 Fetching conversations for user:', req.user.email, req.user._id);

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate({
      path: 'participants',
      select: 'username fullName email profilePicture role'
    })
    .populate({
      path: 'lastMessage',
      select: 'content type createdAt senderId'
    })
    .sort({ updatedAt: -1 })
    .lean(); // Use lean() for better performance

    console.log(`Found ${conversations.length} conversations`);

    if (conversations.length === 0) {
      return res.json({
        success: true,
        conversations: [],
        message: 'No conversations found'
      });
    }

    // Format conversations for frontend
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        try {
          // Find the other participant (not the current user)
          const otherParticipant = conv.participants.find(
            p => p._id.toString() !== req.user._id.toString()
          );

          if (!otherParticipant) {
            console.log(`⚠️ No other participant found for conversation ${conv._id}`);
            return null;
          }

          console.log(`Processing conversation with ${otherParticipant.email}`);

          // Count unread messages for this conversation
          const unreadMessages = await Message.countDocuments({
            conversationId: conv._id,
            receiverId: req.user._id,
            read: false
          });

          // Get host info if the other participant is a host
          let hostInfo = null;
          if (otherParticipant.role === 'host') {
            const host = await Host.findOne({ userId: otherParticipant._id })
              .select('name location rating reviews verified propertyImage')
              .lean();
            
            if (host) {
              hostInfo = {
                hostName: host.name,
                location: host.location,
                rating: host.rating || 0,
                reviews: host.reviews || 0,
                verified: host.verified || false,
                propertyImage: host.propertyImage
              };
            }
          }

          // Format the conversation
          const formatted = {
            _id: conv._id,
            participantId: otherParticipant._id,
            hostName: otherParticipant.fullName || otherParticipant.username,
            hostAvatar: otherParticipant.profilePicture || 
                       `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant.username}`,
            lastMessage: conv.lastMessage?.content || 'No messages yet',
            time: formatTimeAgo(conv.lastMessage?.createdAt || conv.updatedAt),
            unread: unreadMessages,
            online: false, // Would require WebSocket implementation
            hostInfo: hostInfo,
            updatedAt: conv.updatedAt
          };

          console.log(`✅ Formatted conversation:`, {
            id: formatted._id,
            with: formatted.hostName,
            unread: formatted.unread
          });

          return formatted;
        } catch (convError) {
          console.error(`Error formatting conversation ${conv._id}:`, convError);
          return null;
        }
      })
    );

    // Filter out null values (failed formatting)
    const validConversations = formattedConversations.filter(conv => conv !== null);

    console.log(`✅ Returning ${validConversations.length} valid conversations`);

    res.json({
      success: true,
      conversations: validConversations,
      count: validConversations.length
    });

  } catch (error) {
    console.error('❌ Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function for time formatting (if not already present)
function formatTimeAgo(date) {
  if (!date) return '';
  
  try {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + 'y ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + 'mo ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + 'd ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + 'h ago';
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + 'm ago';
    
    return 'Just now';
  } catch (e) {
    console.error('Error formatting time:', e);
    return '';
  }
}

// REPLACE the existing GET /api/messages/conversations/:conversationId endpoint with this:

// Get messages for a conversation (Protected) - IMPROVED VERSION
app.get('/api/messages/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    console.log('📨 Fetching messages for conversation:', conversationId);
    console.log('User:', req.user.email, req.user._id);

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    }).lean();

    if (!conversation) {
      console.log('❌ Conversation not found or user not a participant');
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or you do not have access'
      });
    }

    console.log('✅ Conversation found, participants:', conversation.participants);

    // Build query for messages
    let query = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch messages with populated sender and receiver
    const messages = await Message.find(query)
      .populate({
        path: 'senderId',
        select: 'username fullName email profilePicture'
      })
      .populate({
        path: 'receiverId',
        select: 'username fullName email profilePicture'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .lean();

    console.log(`Found ${messages.length} messages`);

    // Check if there are more messages
    const hasMore = messages.length > parseInt(limit);
    if (hasMore) {
      messages.pop(); // Remove extra message used to check hasMore
    }

    // Get the other participant for conversation info
    const otherParticipantId = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    const otherUser = await User.findById(otherParticipantId)
      .select('fullName username email profilePicture role')
      .lean();

    // Get host info if available
    let conversationInfo = {
      id: conversation._id,
      hostName: otherUser?.fullName || otherUser?.username || 'Unknown',
      hostAvatar: otherUser?.profilePicture || 
                 `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username || 'default'}`,
      hostRating: 0,
      hostReviews: 0,
      hostLocation: '',
      hostVerified: false
    };

    if (otherUser?.role === 'host') {
      const host = await Host.findOne({ userId: otherUser._id })
        .select('rating reviews location verified')
        .lean();
      
      if (host) {
        conversationInfo.hostRating = host.rating || 0;
        conversationInfo.hostReviews = host.reviews || 0;
        conversationInfo.hostLocation = host.location || '';
        conversationInfo.hostVerified = host.verified || false;
      }
    }

    // Format messages for frontend
    const formattedMessages = messages.reverse().map(msg => {
      const isMe = msg.senderId?._id?.toString() === req.user._id.toString();
      
      return {
        id: msg._id,
        sender: isMe ? 'me' : 'host',
        text: msg.content || '',
        time: formatTime(msg.createdAt),
        type: msg.type || 'text',
        read: msg.read || false,
        createdAt: msg.createdAt,
        senderId: msg.senderId?._id,
        receiverId: msg.receiverId?._id
      };
    });

    console.log(`✅ Returning ${formattedMessages.length} formatted messages`);

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: req.user._id,
        read: false
      },
      { read: true }
    );

    console.log('✅ Marked messages as read');

    res.json({
      success: true,
      messages: formattedMessages,
      conversationInfo,
      pagination: {
        hasMore,
        nextCursor: hasMore ? messages[messages.length - 1]?.createdAt : null
      }
    });

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function for message time formatting
function formatTime(date) {
  if (!date) return '';
  
  try {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting message time:', e);
    return '';
  }
}

// Send message (Protected)
app.post('/api/messages/send', authenticate, async (req, res) => {
  try {
    const { conversationId, receiverId, content, type = 'text', metadata } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }

    let conversation;
    
    if (conversationId) {
      // Existing conversation
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user._id
      });
    } else if (receiverId) {
      // Find or create conversation
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, receiverId] },
        isActive: true
      });

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [req.user._id, receiverId]
        });
        await conversation.save();
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either conversationId or receiverId is required'
      });
    }

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      senderId: req.user._id,
      receiverId: receiverId || conversation.participants.find(
        p => p.toString() !== req.user._id.toString()
      ),
      content: content.trim(),
      type,
      metadata: metadata || {}
    });

    await message.save();

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.unreadCount += 1;
    await conversation.save();

    // Populate message
    await message.populate('senderId', 'username fullName');
    await message.populate('receiverId', 'username fullName');

    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        sender: message.senderId._id.toString() === req.user._id.toString() ? 'me' : 'host',
        text: message.content,
        time: formatTime(message.createdAt),
        type: message.type,
        read: message.read
      }
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// Send payment message (System message)
app.post('/api/messages/send-payment', authenticate, async (req, res) => {
  try {
    const { conversationId, amount, description } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const paymentMessage = new Message({
      conversationId,
      senderId: req.user._id,
      receiverId: conversation.participants.find(
        p => p.toString() !== req.user._id.toString()
      ),
      content: `Payment of ৳${amount.toLocaleString()}${description ? ` for ${description}` : ''}`,
      type: 'payment',
      metadata: {
        amount,
        description,
        timestamp: new Date()
      }
    });

    await paymentMessage.save();

    // Update conversation
    conversation.lastMessage = paymentMessage._id;
    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'Payment message sent successfully'
    });
  } catch (error) {
    console.error('❌ Send payment message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending payment message'
    });
  }
});

// Mark messages as read (Protected)
app.put('/api/messages/read/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversationId,
        receiverId: req.user._id,
        read: false
      },
      { read: true }
    );

    // Update conversation unread count
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { unreadCount: 0 }
    });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('❌ Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating message status'
    });
  }
});

// Delete conversation (Soft delete)
app.delete('/api/messages/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        participants: req.user._id
      },
      { isActive: false },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation'
    });
  }
});

app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const { fullName, phone, location, languages, bio } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    
    // Handle languages array
    if (languages) {
      if (Array.isArray(languages)) {
        user.languages = languages;
      } else if (typeof languages === 'string') {
        // If it comes as a comma-separated string
        user.languages = languages.split(',').map(lang => lang.trim()).filter(Boolean);
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        languages: user.languages,
        bio: user.bio,
        role: user.role,
        profilePicture: user.profilePicture,
        hostBadge: user.hostBadge,
        hostRating: user.hostRating,
        totalGuests: user.totalGuests,
        responseRate: user.responseRate,
        verified: user.verified,
        kycCompleted: user.kycCompleted,
        createdAt: user.createdAt,
        idVerifiedAt: user.idVerifiedAt,
        bgCheckAt: user.bgCheckAt,
        trainingAt: user.trainingAt,
        bankVerifiedAt: user.bankVerifiedAt
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile' 
    });
  }
});

// Updated GET /api/auth/me route to include new fields

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        location: req.user.location,
        languages: req.user.languages,
        bio: req.user.bio,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        hostBadge: req.user.hostBadge,
        hostRating: req.user.hostRating,
        totalGuests: req.user.totalGuests,
        responseRate: req.user.responseRate,
        verified: req.user.verified,
        kycCompleted: req.user.kycCompleted,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin,
        idVerifiedAt: req.user.idVerifiedAt,
        bgCheckAt: req.user.bgCheckAt,
        trainingAt: req.user.trainingAt,
        bankVerifiedAt: req.user.bankVerifiedAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user data' 
    });
  }
});

// Updated Register Route to include new fields

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, fullName, email, phone, password, role } = req.body;

    // ============ VALIDATION ============
    
    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: username, fullName, email, and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Validate phone if provided
    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({
          success: false,
          message: phoneValidation.message
        });
      }
    }

    // Phone is required for hosts
    const isHost = role === 'host';
    if (isHost && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for host registration'
      });
    }

    // ============ CHECK EXISTING USER ============
    
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          success: false,
          message: 'This email is already registered. Please login or use a different email.' 
        });
      }
      return res.status(400).json({ 
        success: false,
        message: 'This username is already taken. Please choose a different username.' 
      });
    }

    // ============ CREATE USER ============
    
    const user = new User({
      username: username.toLowerCase(),
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: role || 'tourist',
      profilePicture: '',
      // Basic fields - no defaults
      location: '',
      languages: [],
      bio: '',
      // Host-specific fields - only for hosts
      ...(isHost && {
        hostBadge: 'Host',
        verified: false,
        kycCompleted: false,
        hostRating: 0,
        totalGuests: 0,
        responseRate: 0
      })
    });

    await user.save();

    // ============ CREATE BASIC HOST PROFILE (if host) ============
    
    let hostProfile = null;
    if (isHost) {
      try {
        // Create a minimal host profile
        // User will complete it later via profile settings
        hostProfile = new Host({
          name: fullName,
          userId: user._id,
          location: '', // To be filled by user
          rating: 0,
          reviews: 0,
          verified: false,
          languages: [], // To be filled by user
          price: 0, // To be filled by user
          image: user.profilePicture || null, // Use user's profile picture
          propertyImage: '', // To be filled by user
          services: [], // To be filled by user
          available: false, // Not available until profile is complete
          description: '', // To be filled by user
          experience: 'Beginner', // Default, can be updated
          responseTime: 'Within 1 hour', // Default, can be updated
          cancellationPolicy: 'Flexible', // Default, can be updated
          minStay: 1, // Default, can be updated
          maxGuests: 1 // Default, can be updated
        });

        await hostProfile.save();
        
        console.log(`✅ Basic host profile created for: ${user.email} (Host ID: ${hostProfile._id})`);
        console.log(`⚠️ Host profile is incomplete - user needs to complete it`);
      } catch (hostError) {
        console.error('❌ Error creating host profile:', hostError);
        
        // Rollback user creation if host profile fails
        await User.findByIdAndDelete(user._id);
        
        return res.status(500).json({
          success: false,
          message: 'Error creating host profile. Please try again.',
          error: process.env.NODE_ENV === 'development' ? hostError.message : undefined
        });
      }
    }

    // ============ GENERATE TOKEN ============
    
    const token = generateToken(user._id);

    console.log(`✅ New user registered: ${user.email} (Role: ${user.role})`);
    if (isHost && hostProfile) {
      console.log(`✅ Host registration complete - profile needs completion`);
    }

    // ============ SEND RESPONSE ============
    
    res.status(201).json({
      success: true,
      message: isHost 
        ? 'Registration successful! Please complete your host profile to start hosting.' 
        : 'Registration successful! Welcome to Bhromonbondhu!',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        languages: user.languages,
        bio: user.bio,
        role: user.role,
        profilePicture: user.profilePicture,
        hostBadge: user.hostBadge || null,
        hostRating: user.hostRating || 0,
        totalGuests: user.totalGuests || 0,
        responseRate: user.responseRate || 0,
        verified: user.verified || false,
        kycCompleted: user.kycCompleted || false,
        createdAt: user.createdAt
      },
      ...(hostProfile && {
        host: {
          id: hostProfile._id,
          name: hostProfile.name,
          profileComplete: false, // Flag to show profile is incomplete
          needsCompletion: true
        }
      })
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        message: `This ${field} is already registered. Please use a different ${field}.` 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// ============ NEW ENDPOINT: Complete Host Profile ============

app.put('/api/hosts/complete-profile', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Only hosts can complete host profiles'
      });
    }

    const {
      location,
      languages,
      bio,
      price,
      propertyImage,
      services,
      experience,
      responseTime,
      cancellationPolicy,
      minStay,
      maxGuests,
      availableFromDate,
      availableToDate
    } = req.body;

    // Check if accommodation is offered
    const offersAccommodation = services && services.includes('Accommodation');

    // Validate required fields
    if (!location || !languages || !bio || !price || !services) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: location, languages, bio, price, and services'
      });
    }

    // If offering accommodation, property image is required
    if (offersAccommodation && !propertyImage) {
      return res.status(400).json({
        success: false,
        message: 'Property image is required when offering accommodation service'
      });
    }

    // Validate property image URL if provided
    if (propertyImage) {
      try {
        new URL(propertyImage);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property image URL'
        });
      }
    }

    // Additional validations
    if (!Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one language is required'
      });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one service is required'
      });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    if (bio.length < 20 || bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio must be between 20 and 500 characters'
      });
    }

    // Validate URL
    try {
      new URL(propertyImage);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property image URL'
      });
    }

    // Find host profile
    const hostProfile = await Host.findOne({ userId: req.user._id });

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Get user's profile picture
    const user = await User.findById(req.user._id);

    // Update host profile
    hostProfile.location = location;
    hostProfile.languages = languages;
    hostProfile.description = bio;
    hostProfile.price = price;
    hostProfile.propertyImage = propertyImage || '';
    hostProfile.services = services;
    hostProfile.offersAccommodation = offersAccommodation;
    hostProfile.available = true;
    hostProfile.availableFromDate = availableFromDate;
    hostProfile.availableToDate = availableToDate;
    hostProfile.image = user?.profilePicture || null; // Set image from user profile picture

    if (experience) hostProfile.experience = experience;
    if (responseTime) hostProfile.responseTime = responseTime;
    if (cancellationPolicy) hostProfile.cancellationPolicy = cancellationPolicy;
    if (minStay) hostProfile.minStay = minStay;
    if (maxGuests) hostProfile.maxGuests = maxGuests;

    await hostProfile.save();

    // Also update user profile
    user.location = location;
    user.languages = languages;
    user.bio = bio;
    await user.save();

    console.log(`✅ Host profile completed for: ${user.email}`);

    // Populate user info
    await hostProfile.populate('userId', 'profilePicture fullName username email');
    const hostData = hostProfile.toObject();
    hostData.image = hostProfile.userId?.profilePicture || null;

    res.json({
      success: true,
      message: 'Host profile completed successfully! You can now start hosting.',
      host: hostData,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        languages: user.languages,
        bio: user.bio,
        role: user.role,
        profilePicture: user.profilePicture,
        hostBadge: user.hostBadge,
        hostRating: user.hostRating,
        totalGuests: user.totalGuests,
        responseRate: user.responseRate,
        verified: user.verified,
        kycCompleted: user.kycCompleted
      }
    });
  } catch (error) {
    console.error('❌ Complete host profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing host profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// ============ ENDPOINT: Check if Host Profile is Complete ============

app.get('/api/hosts/profile-status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Only hosts can check profile status'
      });
    }

    const hostProfile = await Host.findOne({ userId: req.user._id })
      .populate('userId', 'profilePicture');

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Check if profile is complete
    const isComplete = 
      hostProfile.location && 
      hostProfile.languages.length > 0 && 
      hostProfile.description && 
      hostProfile.price > 0 && 
      hostProfile.propertyImage && 
      hostProfile.services.length > 0;

    const missingFields = [];
    if (!hostProfile.location) missingFields.push('location');
    if (hostProfile.languages.length === 0) missingFields.push('languages');
    if (!hostProfile.description) missingFields.push('bio/description');
    if (hostProfile.price <= 0) missingFields.push('price');
    if (!hostProfile.propertyImage) missingFields.push('propertyImage');
    if (hostProfile.services.length === 0) missingFields.push('services');

    // Get current profile picture
    const currentImage = hostProfile.userId?.profilePicture || null;

    res.json({
      success: true,
      profileComplete: isComplete,
      available: hostProfile.available,
      missingFields,
      completionPercentage: Math.round(((6 - missingFields.length) / 6) * 100),
      hostImage: currentImage
    });
  } catch (error) {
    console.error('❌ Check profile status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking profile status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// ============ EXISTING ENDPOINTS (Keep these) ============

// Get host profile for current user
app.get('/api/hosts/my-profile', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Only hosts can access host profiles'
      });
    }

    const hostProfile = await Host.findOne({ userId: req.user._id })
      .populate('userId', 'profilePicture fullName username email');

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found. Please contact support.'
      });
    }

    // Format host to include user profile picture
    const hostData = hostProfile.toObject();
    hostData.image = hostProfile.userId?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hostProfile.name.replace(/\s/g, '')}`;

    res.json({
      success: true,
      host: hostData
    });
  } catch (error) {
    console.error('❌ Get host profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching host profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update host profile (same as before)
app.put('/api/hosts/my-profile', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Only hosts can update host profiles'
      });
    }

    const {
      name,
      location,
      price,
      propertyImage,
      services,
      languages,
      description,
      experience,
      responseTime,
      cancellationPolicy,
      minStay,
      maxGuests,
      available
    } = req.body;

    const hostProfile = await Host.findOne({ userId: req.user._id });

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Update fields
    if (name) hostProfile.name = name;
    if (location) hostProfile.location = location;
    if (price !== undefined) hostProfile.price = price;
    if (propertyImage) hostProfile.propertyImage = propertyImage;
    if (services) hostProfile.services = services;
    if (languages) hostProfile.languages = languages;
    if (description) hostProfile.description = description;
    if (experience) hostProfile.experience = experience;
    if (responseTime) hostProfile.responseTime = responseTime;
    if (cancellationPolicy) hostProfile.cancellationPolicy = cancellationPolicy;
    if (minStay !== undefined) hostProfile.minStay = minStay;
    if (maxGuests !== undefined) hostProfile.maxGuests = maxGuests;
    if (available !== undefined) hostProfile.available = available;

    await hostProfile.save();

    // Also update corresponding fields in User model
    const user = await User.findById(req.user._id);
    if (name) user.fullName = name;
    if (location) user.location = location;
    if (languages) user.languages = languages;
    if (description) user.bio = description;
    await user.save();

    // Refresh host data with user info
    await hostProfile.populate('userId', 'profilePicture fullName username');
    const hostData = hostProfile.toObject();
    hostData.image = hostProfile.userId?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hostProfile.name.replace(/\s/g, '')}`;

    res.json({
      success: true,
      message: 'Host profile updated successfully',
      host: hostData
    });
  } catch (error) {
    console.error('❌ Update host profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating host profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Updated Login Route to return new fields

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide both username/email and password' 
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() }, 
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password. Please check your credentials and try again.' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Your account has been deactivated. Please contact support for assistance.' 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid username or password. Please check your credentials and try again.' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ User logged in: ${user.email} (Role: ${user.role})`);

    res.json({
      success: true,
      message: 'Login successful! Welcome back!',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        languages: user.languages,
        bio: user.bio,
        role: user.role,
        profilePicture: user.profilePicture,
        hostBadge: user.hostBadge,
        hostRating: user.hostRating,
        totalGuests: user.totalGuests,
        responseRate: user.responseRate,
        verified: user.verified,
        kycCompleted: user.kycCompleted,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        idVerifiedAt: user.idVerifiedAt,
        bgCheckAt: user.bgCheckAt,
        trainingAt: user.trainingAt,
        bankVerifiedAt: user.bankVerifiedAt
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during login. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get unread count
app.get('/api/messages/unread-count', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    });

    let totalUnread = 0;
    for (const conv of conversations) {
      const unread = await Message.countDocuments({
        conversationId: conv._id,
        receiverId: req.user._id,
        read: false
      });
      totalUnread += unread;
    }

    res.json({
      success: true,
      unreadCount: totalUnread
    });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count'
    });
  }
});

// Helper functions
function formatTime(date) {
  const messageDate = new Date(date);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function formatTimeAgo(date) {
  const messageDate = new Date(date);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}

// ==================== COMMUNITY ROUTES ====================

// Community Post Schema
const communityPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [1000, 'Post cannot exceed 1000 characters']
  },
  image: {
    type: String
  },
  location: {
    type: String
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  trending: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

// Create a new post (Protected)
app.post('/api/community/posts', authenticate, async (req, res) => {
  try {
    const { content, image, location, tags } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty'
      });
    }

    const post = new CommunityPost({
      userId: req.user._id,
      content: content.trim(),
      image: image || null,
      location: location || null,
      tags: tags || [],
      likes: [],
      comments: [],
      shares: 0
    });

    await post.save();

    // Populate user details
    await post.populate({
      path: 'userId',
      select: 'username fullName'
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        _id: post._id,
        content: post.content,
        image: post.image,
        location: post.location,
        author: {
          id: post.userId._id,
          name: post.userId.fullName,
          username: post.userId.username
        },
        likes: post.likes.length,
        comments: post.comments.length,
        shares: post.shares,
        liked: false,
        createdAt: post.createdAt,
        timeAgo: 'Just now'
      }
    });
  } catch (error) {
    console.error('❌ Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all community posts (with pagination)
app.get('/api/community/posts', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (userId) {
      query.userId = userId;
    }

    let sortOptions = {};
    if (sort === 'popular') {
      sortOptions = { likes: -1, createdAt: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const posts = await CommunityPost.find(query)
      .populate({
        path: 'userId',
        select: 'username fullName'
      })
      .populate({
        path: 'likes.userId',
        select: '_id'
      })
      .populate({
        path: 'comments.userId',
        select: 'username fullName'
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Format posts for frontend
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      image: post.image,
      location: post.location,
      author: {
        id: post.userId._id,
        name: post.userId.fullName,
        username: post.userId.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId.username}`
      },
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares,
      liked: post.likes.some(like => like.userId?._id?.toString() === req.user._id.toString()),
      tags: post.tags,
      createdAt: post.createdAt,
      timeAgo: getTimeAgo(post.createdAt)
    }));

    const total = await CommunityPost.countDocuments(query);

    res.json({
      success: true,
      posts: formattedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    console.error('❌ Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Like/Unlike a post
app.post('/api/community/posts/:id/like', authenticate, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const alreadyLiked = post.likes.find(like => 
      like.userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(like => 
        like.userId.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push({ userId: req.user._id });
    }

    await post.save();

    res.json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error('❌ Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating like',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add comment to post
app.post('/api/community/posts/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      userId: req.user._id,
      content: content.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Populate user for the new comment
    await post.populate({
      path: 'comments.userId',
      select: 'username fullName'
    });

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        id: newComment._id,
        content: newComment.content,
        author: {
          id: newComment.userId._id,
          name: newComment.userId.fullName,
          username: newComment.userId.username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newComment.userId.username}`
        },
        createdAt: newComment.createdAt,
        timeAgo: 'Just now'
      }
    });
  } catch (error) {
    console.error('❌ Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Share a post
app.post('/api/community/posts/:id/share', authenticate, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.shares += 1;
    await post.save();

    res.json({
      success: true,
      message: 'Post shared',
      shares: post.shares
    });
  } catch (error) {
    console.error('❌ Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get trending topics
app.get('/api/community/trending', async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Extract trending topics from tags in recent posts
    const posts = await CommunityPost.find({
      createdAt: { $gte: lastWeek }
    });

    const tagCounts = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        const cleanTag = tag.toLowerCase();
        tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
      });
    });

    const trendingTopics = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({
        tag: `#${tag.charAt(0).toUpperCase() + tag.slice(1)}`,
        posts: count
      }));

    res.json({
      success: true,
      trendingTopics
    });
  } catch (error) {
    console.error('❌ Get trending topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending topics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get suggested users to follow
app.get('/api/community/suggested-users', authenticate, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true
    })
    .select('username fullName createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

    // Count trips for each user
    const usersWithTripCount = await Promise.all(
      users.map(async (user) => {
        const tripCount = await Trip.countDocuments({ userId: user._id });
        return {
          id: user._id,
          name: user.fullName,
          username: user.username,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          trips: tripCount,
          joined: getTimeAgo(user.createdAt)
        };
      })
    );

    res.json({
      success: true,
      users: usersWithTripCount
    });
  } catch (error) {
    console.error('❌ Get suggested users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggested users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + 'y ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + 'mo ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + 'd ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + 'h ago';
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + 'm ago';
  
  return 'Just now';
}

// Delete a post (only by author)
app.delete('/api/community/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await CommunityPost.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or unauthorized'
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Seed sample community posts (development only)
app.post('/api/community/seed', authenticate, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Seed endpoint disabled in production'
    });
  }

  try {
    // Clear existing posts
    await CommunityPost.deleteMany({});

    const samplePosts = [
      {
        userId: req.user._id,
        content: 'Just had the most amazing experience in Rangamati! The lake views are breathtaking and the local culture is so rich. Highly recommend staying with a local host to get the authentic experience 🌊✨',
        location: 'Rangamati',
        image: 'https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjU0MzQwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['rangamati', 'lake', 'culture'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: req.user._id,
        content: 'Pro tip: Visit Ratargul in the monsoon season. The swamp forest is magical! Don\'t forget to bring waterproof bags for your electronics. The boat ride through the forest is unforgettable ⭐️🚣',
        location: 'Ratargul',
        tags: ['ratargul', 'monsoon', 'swampforest'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        userId: req.user._id,
        content: 'Sunset at Cox\'s Bazar never gets old! 🌅 Best time to visit is early morning or evening to avoid crowds. The seafood here is incredible - try the grilled prawns at the beach market!',
        location: 'Cox\'s Bazar',
        image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        tags: ['coxsbazar', 'sunset', 'seafood'],
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      }
    ];

    // Add likes and comments to some posts
    samplePosts[0].likes = [{ userId: req.user._id }];
    samplePosts[2].likes = [{ userId: req.user._id }];
    samplePosts[0].comments = [
      {
        userId: req.user._id,
        content: 'This looks amazing! Planning to visit next month.'
      }
    ];

    const createdPosts = await CommunityPost.insertMany(samplePosts);

    res.status(201).json({
      success: true,
      message: 'Sample community posts seeded successfully',
      count: createdPosts.length,
      posts: createdPosts
    });
  } catch (error) {
    console.error('❌ Seed community error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding community posts',
      error: error.message
    });
  }
});

// ==================== SEED DATA ROUTES ====================

// Seed sample hosts (Development only)
app.post('/api/hosts/seed', authenticate, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Seed endpoint disabled in production'
    });
  }

  try {
    // Clear existing hosts for this user
    await Host.deleteMany({ userId: req.user._id });

    // Get current user's profile picture
    const user = await User.findById(req.user._id);
    const userImage = user?.profilePicture || null;

    const sampleHosts = [
      {
        name: 'Fatima Khan',
        location: "Cox's Bazar",
        rating: 4.9,
        reviews: 124,
        verified: true,
        languages: ['Bengali', 'English'],
        price: 2500,
        propertyImage: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        services: ['Local Guide', 'Meals', 'Transportation'],
        description: 'Experience the longest sea beach in the world with local insights',
        experience: 'Expert',
        responseTime: 'Within 30 minutes',
        cancellationPolicy: 'Flexible',
        minStay: 2,
        maxGuests: 6,
        image: userImage
      },
      {
        name: 'Rafiq Ahmed',
        location: 'Sylhet',
        rating: 4.8,
        reviews: 98,
        verified: true,
        languages: ['Bengali', 'English', 'Hindi'],
        price: 2000,
        propertyImage: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        services: ['Local Guide', 'Photography', 'Trekking'],
        description: 'Explore tea gardens and hills with an experienced guide',
        experience: 'Expert',
        responseTime: 'Within 1 hour',
        cancellationPolicy: 'Moderate',
        minStay: 1,
        maxGuests: 4,
        image: userImage
      },
      {
        name: 'Shahana Begum',
        location: 'Dhaka',
        rating: 4.7,
        reviews: 156,
        verified: true,
        languages: ['Bengali', 'English'],
        price: 1800,
        propertyImage: 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc2NTQ3NTIxMXww&ixlib=rb-4.1.0&q=80&w=1080',
        services: ['City Tour', 'Shopping Guide', 'Food Tour'],
        description: 'Discover the vibrant capital city with local expertise',
        experience: 'Intermediate',
        responseTime: 'Within 2 hours',
        cancellationPolicy: 'Flexible',
        minStay: 1,
        maxGuests: 8,
        image: userImage
      }
    ];

    // Add userId to each host
    const hostsWithUserId = sampleHosts.map(host => ({
      ...host,
      userId: req.user._id
    }));

    const createdHosts = await Host.insertMany(hostsWithUserId);

    res.status(201).json({
      success: true,
      message: 'Sample hosts seeded successfully',
      count: createdHosts.length,
      hosts: createdHosts
    });
  } catch (error) {
    console.error('❌ Seed hosts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding hosts',
      error: error.message
    });
  }
});

// Seed sample transportation (Development only)
app.post('/api/transportation/seed', authenticate, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Seed endpoint disabled in production'
    });
  }

  try {
    // Clear existing transportation
    await Transportation.deleteMany({});

    const sampleTransportation = [
      // Flights
      {
        type: 'flight',
        from: 'Dhaka',
        to: "Cox's Bazar",
        operator: 'Biman Bangladesh',
        departure: '10:00 AM',
        arrival: '11:15 AM',
        departureDate: 'Dec 20, 2024',
        duration: '1h 15m',
        price: 4500,
        availableSeats: 12,
        totalSeats: 50,
        class: 'Economy',
        facilities: ['Meal', 'Entertainment', 'WiFi'],
        description: 'Direct flight to Cox\'s Bazar'
      },
      {
        type: 'flight',
        from: 'Dhaka',
        to: 'Sylhet',
        operator: 'US-Bangla',
        departure: '2:30 PM',
        arrival: '3:30 PM',
        departureDate: 'Dec 21, 2024',
        duration: '1h',
        price: 3800,
        availableSeats: 8,
        totalSeats: 50,
        class: 'Business',
        facilities: ['Meal', 'Entertainment', 'WiFi', 'Extra Legroom'],
        description: 'Direct flight to Sylhet'
      },
      // Trains
      {
        type: 'train',
        from: 'Dhaka',
        to: 'Chittagong',
        operator: 'Suborno Express',
        departure: '7:00 AM',
        arrival: '1:30 PM',
        departureDate: 'Dec 20, 2024',
        duration: '6h 30m',
        price: 800,
        availableSeats: 25,
        totalSeats: 100,
        class: 'AC',
        facilities: ['Food Service', 'Water', 'Newspaper'],
        description: 'Express train to Chittagong'
      },
      {
        type: 'train',
        from: 'Dhaka',
        to: 'Sylhet',
        operator: 'Parabat Express',
        departure: '9:00 PM',
        arrival: '5:30 AM',
        departureDate: 'Dec 20, 2024',
        duration: '8h 30m',
        price: 650,
        availableSeats: 18,
        totalSeats: 100,
        class: 'Sleeper',
        facilities: ['Berth', 'Food Service', 'Water'],
        description: 'Overnight train to Sylhet'
      },
      // Buses
      {
        type: 'bus',
        from: 'Dhaka',
        to: "Cox's Bazar",
        operator: 'Green Line',
        departure: '11:00 PM',
        arrival: '8:00 AM',
        departureDate: 'Dec 20, 2024',
        duration: '9h',
        price: 1200,
        availableSeats: 15,
        totalSeats: 40,
        class: 'AC',
        facilities: ['AC', 'Snacks', 'Water', 'WiFi'],
        description: 'Overnight AC bus to Cox\'s Bazar'
      },
      {
        type: 'bus',
        from: 'Dhaka',
        to: 'Bandarban',
        operator: 'Shyamoli',
        departure: '10:30 PM',
        arrival: '7:00 AM',
        departureDate: 'Dec 20, 2024',
        duration: '8h 30m',
        price: 1000,
        availableSeats: 20,
        totalSeats: 40,
        class: 'Non-AC',
        facilities: ['Snacks', 'Water'],
        description: 'Overnight bus to Bandarban'
      }
    ];

    const createdTransportation = await Transportation.insertMany(sampleTransportation);

    res.status(201).json({
      success: true,
      message: 'Sample transportation seeded successfully',
      count: createdTransportation.length,
      transportation: createdTransportation
    });
  } catch (error) {
    console.error(' Seed transportation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding transportation',
      error: error.message
    });
  }
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(' Server error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(` Bhromonbondhu API Server`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log('='.repeat(50));
});