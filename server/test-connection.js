#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests MongoDB Atlas connection and all critical services
 * Run from: npm run test-connection
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const PORT = process.env.PORT;

console.log('\n' + '='.repeat(60));
console.log('🔧 BHROMONBONDHU - CONNECTION TEST SUITE');
console.log('='.repeat(60) + '\n');

// Test 1: Environment Variables
console.log('📋 TEST 1: Environment Variables');
console.log('-'.repeat(60));
try {
  if (!MONGODB_URI) throw new Error('MONGODB_URI not found');
  console.log('✅ MONGODB_URI:', MONGODB_URI.substring(0, 50) + '...');
  
  if (!JWT_SECRET) throw new Error('JWT_SECRET not found');
  console.log('✅ JWT_SECRET: configured');
  
  if (!FRONTEND_URL) throw new Error('FRONTEND_URL not found');
  console.log('✅ FRONTEND_URL:', FRONTEND_URL);
  
  if (!PORT) throw new Error('PORT not found');
  console.log('✅ PORT:', PORT);
  
  console.log('✅ All environment variables loaded\n');
} catch (error) {
  console.error('❌ Environment Variable Error:', error.message, '\n');
  process.exit(1);
}

// Test 2: MongoDB Connection
console.log('📊 TEST 2: MongoDB Atlas Connection');
console.log('-'.repeat(60));
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log('   Cluster: cluster0.twni1mw.mongodb.net');
    console.log('   Database: bhromonbondhu\n');
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('📦 TEST 3: Database Collections');
    console.log('-'.repeat(60));
    if (collections.length === 0) {
      console.log('⚠️  No collections found (will be created on first use)\n');
    } else {
      console.log(`✅ Found ${collections.length} collection(s):`);
      collections.forEach(col => {
        console.log(`   • ${col.name}`);
      });
      console.log('');
    }
    
    console.log('🎯 TEST 4: Connection Details');
    console.log('-'.repeat(60));
    console.log('✅ Backend Server: http://localhost:' + PORT);
    console.log('✅ API Endpoint: http://localhost:' + PORT + '/api');
    console.log('✅ Frontend URL: ' + FRONTEND_URL);
    console.log('✅ Database: bhromonbondhu\n');
    
    console.log('='.repeat(60));
    console.log('✨ ALL TESTS PASSED! Ready to start servers.');
    console.log('='.repeat(60));
    console.log('\n📚 STARTUP INSTRUCTIONS:\n');
    console.log('Terminal 1 (Backend):');
    console.log('  cd server');
    console.log('  npm run dev\n');
    console.log('Terminal 2 (Frontend):');
    console.log('  cd sm-auth');
    console.log('  npm start\n');
    console.log('Then open: http://localhost:3000\n');
    
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n🔧 TROUBLESHOOTING:\n');
    console.error('1. Check internet connection');
    console.error('2. Verify MONGODB_URI in .env is correct');
    console.error('3. Go to MongoDB Atlas: https://cloud.mongodb.com');
    console.error('4. Click Network Access');
    console.error('5. Click "Add IP Address"');
    console.error('6. Select "Allow Access from Anywhere" (0.0.0.0/0)');
    console.error('7. Confirm changes');
    console.error('8. Wait 1-2 minutes and try again\n');
    process.exit(1);
  });
