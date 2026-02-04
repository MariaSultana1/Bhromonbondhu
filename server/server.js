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

// User Schema - UPDATED with profilePicture field
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
  profilePicture: {
    type: String,
    default: '' // Empty string means no profile picture, will show default icon
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

    // Create new user (profilePicture will be empty by default)
    const user = new User({
      username: username.toLowerCase(),
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: role || 'tourist',
      profilePicture: '' // Empty by default
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
        profilePicture: user.profilePicture,
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

// Upload Profile Picture (Protected Route) - NEW ENDPOINT
app.put('/api/auth/profile-picture', authenticate, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture provided'
      });
    }

    // Validate base64 image format
    if (!profilePicture.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Please upload a valid image file.'
      });
    }

    // Check file size (limit to 5MB in base64)
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

// ==================== MESSAGE ROUTES ====================

// Get conversations for current user (Protected)
app.get('/api/messages/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate({
      path: 'participants',
      select: 'username fullName email'
    })
    .populate({
      path: 'lastMessage',
      select: 'content type createdAt'
    })
    .sort({ updatedAt: -1 });

    // Format conversations
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          p => p._id.toString() !== req.user._id.toString()
        );

        if (!otherParticipant) {
          return null;
        }

        const unreadMessages = await Message.countDocuments({
          conversationId: conv._id,
          receiverId: req.user._id,
          read: false
        });

        // Get host info if available
        let hostInfo = {};
        const host = await Host.findOne({ userId: otherParticipant._id });
        if (host) {
          hostInfo = {
            hostName: host.name,
            location: host.location,
            rating: host.rating,
            propertyImage: host.propertyImage
          };
        }

        return {
          _id: conv._id,
          participantId: otherParticipant._id,
          hostName: otherParticipant.fullName,
          hostAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant.username}`,
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          time: formatTimeAgo(conv.lastMessage?.createdAt || conv.updatedAt),
          unread: unreadMessages,
          online: false, // This would require WebSocket implementation
          hostInfo
        };
      })
    );

    const filteredConversations = formattedConversations.filter(conv => conv !== null);

    res.json({
      success: true,
      conversations: filteredConversations
    });
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// Get messages for a conversation (Protected)
app.get('/api/messages/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is participant
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

    let query = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'username fullName')
      .populate('receiverId', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1);

    const hasMore = messages.length > parseInt(limit);
    if (hasMore) {
      messages.pop(); // Remove extra message used to check hasMore
    }

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiverId: req.user._id,
        read: false
      },
      { read: true }
    );

    // Format messages for frontend
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id,
      sender: msg.senderId._id.toString() === req.user._id.toString() ? 'me' : 'host',
      text: msg.content,
      time: formatTime(msg.createdAt),
      type: msg.type,
      read: msg.read
    }));

    const otherParticipant = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Get host info
    const host = await Host.findOne({ userId: otherParticipant });
    const user = await User.findById(otherParticipant);

    res.json({
      success: true,
      messages: formattedMessages,
      conversationInfo: {
        id: conversation._id,
        hostName: user?.fullName || 'Unknown',
        hostAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`,
        hostRating: host?.rating || 0,
        hostReviews: host?.reviews || 0,
        hostLocation: host?.location || '',
        hostVerified: host?.verified || false
      },
      pagination: {
        hasMore,
        nextCursor: hasMore ? messages[messages.length - 1]?.createdAt : null
      }
    });
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

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