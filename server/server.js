// server.js - Complete Backend with MongoDB Atlas Integration
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

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
    default: ''
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
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

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

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
    required: [true, 'Host name is required']
  },
  hostAvatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
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
    min: 1,
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
    type: String, // Store as "10:00 AM" format
    required: [true, 'Departure time is required']
  },
  arrival: {
    type: String,
    required: [true, 'Arrival time is required']
  },
  departureDate: {
    type: String, // Store as "Dec 20, 2024"
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

// Host Schema
const hostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Host name is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
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
  },
  verified: {
    type: Boolean,
    default: false
  },
  languages: [{
    type: String,
    default: []
  }],
  price: {
    type: Number,
    required: [true, 'Price per day is required']
  },
  image: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  },
  propertyImage: {
    type: String,
    required: [true, 'Property image is required']
  },
  services: [{
    type: String,
    default: []
  }],
  available: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: 'Experienced local host'
  },
  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner'
  },
  responseTime: {
    type: String,
    default: 'Within 1 hour'
  },
  cancellationPolicy: {
    type: String,
    default: 'Flexible'
  },
  minStay: {
    type: Number,
    default: 1
  },
  maxGuests: {
    type: Number,
    default: 4
  }
}, {
  timestamps: true
});

const Host = mongoose.model('Host', hostSchema);

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
  transportationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transportation'
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  travelDate: {
    type: Date
  },
  guests: {
    type: Number,
    default: 1
  },
  passengers: {
    type: Number,
    default: 1
  },
  seatClass: {
    type: String
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

// Generate JWT Token
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
    const { username, fullName, email, phone, password, role } = req.body;

    // Validation
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

    // Check if user already exists
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

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: role || 'tourist'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log(`✅ New user registered: ${user.email} (Role: ${user.role})`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Bhromonbondhu!',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
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

    console.log(` User logged in: ${user.email} (Role: ${user.role})`);

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
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error(' Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred during login. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get Current User (Protected Route)
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
  console.log(` User logged out: ${req.user.email}`);
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

// Update Profile (Protected Route)
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    
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
        role: user.role
      }
    });
  } catch (error) {
    console.error(' Profile update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile' 
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
    console.error(' Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});



// Get all trips for a user (Protected)
app.get('/api/trips', authenticate, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: trips.length,
      trips: trips
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

// Get all hosts (Public - no auth required for browsing)
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
      .limit(parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    res.json({
      success: true,
      count: hosts.length,
      hosts
    });
  } catch (error) {
    console.error(' Get hosts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hosts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get host by ID
app.get('/api/hosts/:id', async (req, res) => {
  try {
    const host = await Host.findById(req.params.id);

    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host not found'
      });
    }

    res.json({
      success: true,
      host
    });
  } catch (error) {
    console.error(' Get host error:', error);
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
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`
    });

    await host.save();

    res.status(201).json({
      success: true,
      message: 'Host profile created successfully',
      host
    });
  } catch (error) {
    console.error(' Create host error:', error);
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

// Get user's bookings (Protected)
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hostId', 'name location price propertyImage')
      .populate('transportationId', 'type from to operator departure arrival duration price')
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
      message: 'Error fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get booking by ID (Protected)
app.get('/api/bookings/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    .populate('hostId')
    .populate('transportationId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
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
        maxGuests: 6
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
        maxGuests: 4
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
        maxGuests: 8
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