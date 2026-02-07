// server.js - Complete Backend with MongoDB Atlas Integration
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config(); // Load .env
require('dotenv').config({ path: '.env.local', override: true }); // Load .env.local (overrides .env)

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
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      return false;
    }

    console.log('🔄 Attempting to connect to MongoDB...');

    // Mask URI for logs (hide password)
    const maskUri = (uri) => {
      try {
        return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@\/]+)(:)([^@]+)(@)/, (m, p1, user, colon, pass, at) => {
          return p1 + user + ':' + '***' + at;
        });
      } catch (e) {
        return 'mongodb://***';
      }
    };

    const uri = process.env.MONGODB_URI;
    console.log('📍 MongoDB URI (masked):', maskUri(uri));

    // Check if database name is present in URI
    const dbNameMatch = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/(.+?)\?/);
    if (!dbNameMatch) {
      console.warn('⚠️  The MONGODB_URI does not include an explicit database name.');
      console.warn('   Example format: mongodb+srv://user:pass@host/myDatabase?retryWrites=true&w=majority');
      console.warn('   Not having a db name may still work, but it is recommended to include one (e.g., /bhromonbondhu).');
    } else {
      console.log('📂 Database name in URI:', dbNameMatch[1]);
    }

    // Extract host for SRV check (cluster host)
    const hostMatch = uri.match(/mongodb(?:\+srv)?:\/\/[^@]+@([^\/\?]+)/);
    if (hostMatch) {
      const host = hostMatch[1];
      console.log('🌐 SRV host detected:', host);
    }

    const connection = await mongoose.connect(uri, {
      // Newer drivers ignore these flags, but left for backwards compatibility
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Atlas connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Check common issues
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('');
      console.error('🔍 NETWORK/DNS Issue Detected:');
      console.error('   Possible causes:');
      console.error('   1. ❌ IP not whitelisted in MongoDB Atlas Network Access');
      console.error('   2. ❌ MongoDB cluster is paused');
      console.error('   3. ❌ No internet connectivity');
      console.error('   4. ❌ Firewall/VPN blocking MongoDB');
      console.error('');
      console.error('✅ To fix:');
      console.error('   1. Go to MongoDB Atlas → Network Access → IP Whitelist');
      console.error('   2. Add your IP address or 0.0.0.0/0 (development)');
      console.error('   3. Wait 5-10 minutes and retry');
    } else if (error.message.includes('authentication failed')) {
      console.error('');
      console.error('🔍 Authentication Failed:');
      console.error('   Check your database credentials in .env file');
      console.error('   MONGODB_URI format: mongodb+srv://username:password@host/db');
    }
    
    return false;
  }
};

// Store connection status
let mongoConnected = false;

// Initial connection attempt (non-blocking)
connectDB().then(connected => {
  mongoConnected = connected;
  if (!connected) {
    console.warn('⚠️  Server starting without MongoDB connection');
    console.warn('📌 API will be available, but database features will fail');
  }
});

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

// ==================== ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.json({ 
    success: true,
    status: 'Server is running',
    mongodb: {
      status: statusMap[mongoStatus],
      connected: mongoStatus === 1,
      readyState: mongoStatus
    },
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
        lastLogin: user.lastLogin
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
        role: user.role
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

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Bhromonbondhu API Server`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log('='.repeat(50));
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Another process is listening on this port.`);
    console.error('   To free the port on Windows:');
    console.error('     1) Run: netstat -ano | findstr :' + PORT);
    console.error('     2) Note the PID (last column) and run: taskkill /PID <PID> /F');
    console.error('   Or use: npx kill-port ' + PORT + ' (if you have npx available)');
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});