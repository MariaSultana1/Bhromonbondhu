#!/usr/bin/env node

/**
 * Journey Completion Testing - Helper Scripts
 * 
 * Quick commands for testing different scenarios:
 *   npm run test:journey
 *   npm run test:journey:direct
 *   npm run test:journey:debug
 * 
 * Usage:
 *   node journey_test_scenarios.js [scenario] [options]
 */

const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function divider() {
  print('═'.repeat(70), 'cyan');
}

// ==================== SCENARIO 1: Simple Completion ====================

async function scenario_simple() {
  print('\n📝 Scenario 1: Simple Journey Completion', 'magenta');
  divider();

  try {
    // Login
    print('\n1️⃣ Logging in...', 'blue');
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    const token = loginRes.data.token;
    print('✅ Login successful', 'green');

    // Get trips
    print('\n2️⃣ Fetching trips...', 'blue');
    const tripsRes = await axios.get(`${API_BASE_URL}/trips`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!tripsRes.data.trips.length) {
      print('❌ No trips found', 'red');
      return;
    }

    const trip = tripsRes.data.trips[0];
    print(`✅ Found trip: ${trip.destination}`, 'green');

    // Complete journey
    print('\n3️⃣ Completing journey...', 'blue');
    const completeRes = await axios.post(`${API_BASE_URL}/trips/${trip._id}/complete`, {
      rating: 5,
      review: 'Amazing experience!',
      photos: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    print(`✅ Journey completed!`, 'green');
    print(`   Points awarded: ${completeRes.data.stats.points}`, 'yellow');
    print(`   Total completed: ${completeRes.data.stats.totalTripsCompleted}`, 'yellow');

  } catch (error) {
    print(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// ==================== SCENARIO 2: Completion with Photos ====================

async function scenario_with_photos() {
  print('\n📸 Scenario 2: Journey Completion with Photos', 'magenta');
  divider();

  try {
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    const token = loginRes.data.token;

    const tripsRes = await axios.get(`${API_BASE_URL}/trips`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!tripsRes.data.trips.length) {
      print('❌ No trips found', 'red');
      return;
    }

    const trip = tripsRes.data.trips[0];

    // Sample base64 images
    const photos = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQIW2P4//8/AymAESAAIQEgI+75FwAAAABJRU5ErkJggg=='
    ];

    print('\n📤 Uploading journey with 2 photos...', 'blue');
    
    const completeRes = await axios.post(`${API_BASE_URL}/trips/${trip._id}/complete`, {
      rating: 4,
      review: 'Great location with amazing views. The local guide was very helpful. Would definitely recommend!',
      photos: photos
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    print(`✅ Journey completed with photos!`, 'green');
    print(`   Rating: ${completeRes.data.trip.tripReview?.rating || 4} stars`, 'yellow');
    print(`   Photos uploaded: ${completeRes.data.trip.tripReview?.photos?.length || 2}`, 'yellow');

  } catch (error) {
    print(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// ==================== SCENARIO 3: Completion with Full Details ====================

async function scenario_full_details() {
  print('\n📋 Scenario 3: Full Journey Completion with Details', 'magenta');
  divider();

  try {
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    const token = loginRes.data.token;
    print('✅ Logged in', 'green');

    // Get trips
    const tripsRes = await axios.get(`${API_BASE_URL}/trips`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!tripsRes.data.trips.length) {
      print('❌ No trips found', 'red');
      return;
    }

    const trip = tripsRes.data.trips[0];
    print(`\n📍 Journey Details:`, 'cyan');
    print(`   Destination: ${trip.destination}`, 'yellow');
    print(`   Date: ${trip.startDate || trip.date}`, 'yellow');
    print(`   Status: ${trip.status || trip.bookingStatus}`, 'yellow');

    // Check if can complete
    print(`\n🔍 Checking completion status...`, 'blue');
    const statusRes = await axios.get(`${API_BASE_URL}/trips/${trip._id}/completion-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    print(`   Can complete: ${statusRes.data.canComplete ? 'Yes ✅' : 'No ❌'}`, 'yellow');

    if (!statusRes.data.canComplete) {
      print(`   Reason: Trip must be "upcoming" status`, 'red');
      return;
    }

    // Complete with detailed review
    print(`\n✍️ Completing journey...`, 'blue');
    
    const fullReview = `
This trip to ${trip.destination} was absolutely incredible! 

Highlights:
- The accommodation was clean and comfortable
- The host was extremely welcoming and helpful
- Local attractions were easily accessible
- Food was delicious and reasonably priced
- Peaceful and relaxing environment

Would definitely come back and highly recommend to other travelers!
    `.trim();

    const completeRes = await axios.post(`${API_BASE_URL}/trips/${trip._id}/complete`, {
      rating: 5,
      review: fullReview,
      photos: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    print(`✅ Journey Completed!`, 'green');
    print(`\n📊 Results:`, 'cyan');
    print(`   Trip Status: ${completeRes.data.trip.status}`, 'yellow');
    print(`   Rating: ${completeRes.data.trip.tripReview?.rating} ⭐`, 'yellow');
    print(`   Points Awarded: ${completeRes.data.stats.points}`, 'yellow');
    print(`   Total Trips Completed: ${completeRes.data.stats.totalTripsCompleted}`, 'yellow');

  } catch (error) {
    print(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// ==================== SCENARIO 4: Test All Trips ====================

async function scenario_complete_all() {
  print('\n🔄 Scenario 4: Complete All Upcoming Trips', 'magenta');
  divider();

  try {
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    const token = loginRes.data.token;

    const tripsRes = await axios.get(`${API_BASE_URL}/trips`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const trips = tripsRes.data.trips;
    print(`\n📍 Found ${trips.length} trips`, 'cyan');

    let completed = 0;
    let failed = 0;

    for (const trip of trips) {
      try {
        print(`\n⏳ Completing: ${trip.destination}...`, 'blue');
        
        await axios.post(`${API_BASE_URL}/trips/${trip._id}/complete`, {
          rating: 4,
          review: `Great trip to ${trip.destination}!`,
          photos: []
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        print(`✅ Completed`, 'green');
        completed++;
      } catch (error) {
        const msg = error.response?.data?.message || error.message;
        print(`⚠️ Failed: ${msg}`, 'yellow');
        failed++;
      }
    }

    divider();
    print(`\n📊 Summary:`, 'cyan');
    print(`   ✅ Completed: ${completed}`, 'green');
    print(`   ❌ Failed: ${failed}`, 'red');
    print(`   📍 Total: ${trips.length}`, 'yellow');

  } catch (error) {
    print(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// ==================== SCENARIO 5: Debug Mode ====================

async function scenario_debug() {
  print('\n🐛 Scenario 5: Debug Mode - Detailed Logs', 'magenta');
  divider();

  const logStream = fs.createWriteStream('journey_debug.log');

  function debugLog(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
    logStream.write(logMessage + '\n');
  }

  try {
    debugLog('Starting debug test...', 'start');

    debugLog('Attempting login...', 'request');
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    debugLog(`Login response: ${JSON.stringify(loginRes.data.user)}`, 'response');
    
    const token = loginRes.data.token;

    debugLog('Fetching trips...', 'request');
    const tripsRes = await axios.get(`${API_BASE_URL}/trips`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    debugLog(`Found ${tripsRes.data.trips.length} trips`, 'response');

    if (tripsRes.data.trips.length) {
      const trip = tripsRes.data.trips[0];
      
      debugLog(`Selected trip: ${trip._id}`, 'info');
      debugLog(`Trip data: ${JSON.stringify(trip)}`, 'data');

      debugLog('Checking completion status...', 'request');
      const statusRes = await axios.get(`${API_BASE_URL}/trips/${trip._id}/completion-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      debugLog(`Status: ${JSON.stringify(statusRes.data)}`, 'response');

      debugLog('Completing journey...', 'request');
      const completeRes = await axios.post(`${API_BASE_URL}/trips/${trip._id}/complete`, {
        rating: 5,
        review: 'Test review',
        photos: []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      debugLog(`Completion response: ${JSON.stringify(completeRes.data)}`, 'response');
      
      print(`\n✅ Debug test completed! Check journey_debug.log for details.`, 'green');
    }

  } catch (error) {
    debugLog(`ERROR: ${error.message}`, 'error');
    if (error.response) {
      debugLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
    }
    print(`\n❌ Debug test failed! Check journey_debug.log for details.`, 'red');
  }

  logStream.end();
}

// ==================== MAIN ====================

const scenarios = {
  'simple': scenario_simple,
  'photos': scenario_with_photos,
  'full': scenario_full_details,
  'all': scenario_complete_all,
  'debug': scenario_debug
};

const args = process.argv.slice(2);
const scenarioName = args[0] || 'simple';

print('\n', 'cyan');
divider();
print(' 🚀 JOURNEY COMPLETION TEST SCENARIOS', 'magenta');
divider();
print(`\nAPI URL: ${API_BASE_URL}`, 'cyan');

if (scenarios[scenarioName]) {
  scenarios[scenarioName]().then(() => {
    print('\n', 'cyan');
    divider();
    print(' ✅ Test completed', 'green');
    divider();
    print('\n', 'cyan');
  }).catch(error => {
    print(`\n❌ Unexpected error: ${error.message}`, 'red');
  });
} else {
  print('\n❌ Unknown scenario', 'red');
  print('\nAvailable scenarios:', 'yellow');
  print('  simple  - Simple journey completion', 'cyan');
  print('  photos  - Completion with photo uploads', 'cyan');
  print('  full    - Full completion with detailed review', 'cyan');
  print('  all     - Complete all upcoming trips', 'cyan');
  print('  debug   - Debug mode with detailed logs', 'cyan');
  print('\nUsage: node journey_test_scenarios.js [scenario]', 'yellow');
  print('\n', 'cyan');
}