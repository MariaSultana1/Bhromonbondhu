/**
 * Complete Journey Test Script
 * 
 * This script tests the journey completion flow for the Bhromonbondhu platform.
 * It simulates a user completing their trip with:
 * - Rating
 * - Review
 * - Photos
 * 
 * Usage:
 *   node complete_journey_test.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ==================== CONFIGURATION ====================

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const LOG_FILE = 'journey_completion_test.log';

// Test user credentials
const TEST_USER = {
  email: 'testuser@example.com',
  username: 'testuser',
  password: 'password123'
};

// Journey completion data
const JOURNEY_COMPLETION = {
  rating: 5,
  review: 'Amazing experience! The host was very welcoming and helpful. The location is beautiful and the amenities were excellent. Highly recommend this place to anyone visiting the area.',
  photos: [
    // Base64 encoded sample images (small PNG files for testing)
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQIW2P4//8/AymAESAAIQEgI+75FwAAAABJRU5ErkJggg=='
  ]
};

// ==================== LOGGING UTILITIES ====================

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
  log(message, 'success');
}

function logError(message, error = null) {
  console.error(`❌ ${message}`);
  log(message, 'error');
  
  if (error) {
    const errorDetails = error.response?.data || error.message;
    log(`Error Details: ${JSON.stringify(errorDetails)}`, 'error');
    console.error('Error Details:', errorDetails);
  }
}

function logInfo(message) {
  console.log(`📌 ${message}`);
  log(message, 'info');
}

function logData(label, data) {
  console.log(`\n📊 ${label}:`);
  console.log(JSON.stringify(data, null, 2));
  log(`${label}: ${JSON.stringify(data)}`, 'data');
}

// ==================== HTTP CLIENT ====================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (config.headers.Authorization) {
      log(`Making ${config.method.toUpperCase()} request to ${config.url}`, 'request');
    }
    return config;
  },
  (error) => {
    logError('Request setup failed', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    log(`Response received: ${response.status} ${response.statusText}`, 'response');
    return response;
  },
  (error) => {
    const status = error.response?.status || 'Unknown';
    const message = error.response?.data?.message || error.message;
    log(`Response error: ${status} - ${message}`, 'error');
    return Promise.reject(error);
  }
);

// ==================== TEST FUNCTIONS ====================

/**
 * Register a new test user
 */
async function registerTestUser() {
  logInfo('Step 1: Registering test user...');
  
  try {
    const response = await apiClient.post('/auth/register', {
      username: TEST_USER.username,
      fullName: 'Test User',
      email: TEST_USER.email,
      phone: '01701234567',
      password: TEST_USER.password,
      role: 'tourist'
    });

    logSuccess(`User registered: ${response.data.user.email}`);
    logData('Registered User', response.data.user);
    
    return response.data.token;
  } catch (error) {
    if (error.response?.status === 400) {
      logInfo('User already exists, proceeding to login...');
      return null;
    }
    logError('Failed to register user', error);
    throw error;
  }
}

/**
 * Login user
 */
async function loginUser() {
  logInfo('Step 2: Logging in user...');
  
  try {
    const response = await apiClient.post('/auth/login', {
      username: TEST_USER.username,
      password: TEST_USER.password
    });

    logSuccess(`User logged in: ${response.data.user.email}`);
    logData('Login Response', response.data.user);
    
    return response.data.token;
  } catch (error) {
    logError('Failed to login user', error);
    throw error;
  }
}

/**
 * Get user's upcoming trips
 */
async function getUpcomingTrips(token) {
  logInfo('Step 3: Fetching upcoming trips...');
  
  try {
    const response = await apiClient.get('/trips', {
      headers: { Authorization: `Bearer ${token}` }
    });

    logSuccess(`Found ${response.data.count} trips`);
    
    if (response.data.trips.length === 0) {
      logError('No upcoming trips found. Please create a trip first.');
      return null;
    }

    logData('Trips', response.data.trips.map(t => ({
      id: t._id,
      destination: t.destination,
      date: t.startDate || t.date,
      status: t.status || t.bookingStatus
    })));
    
    return response.data.trips[0];
  } catch (error) {
    logError('Failed to fetch trips', error);
    throw error;
  }
}

/**
 * Get trip completion status
 */
async function getTripCompletionStatus(token, tripId) {
  logInfo('Step 4: Checking trip completion status...');
  
  try {
    const response = await apiClient.get(`/trips/${tripId}/completion-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    logSuccess('Trip completion status retrieved');
    logData('Completion Status', {
      tripId: response.data.tripId,
      status: response.data.status,
      destination: response.data.destination,
      canComplete: response.data.canComplete,
      hasReview: !!response.data.tripReview
    });
    
    return response.data;
  } catch (error) {
    logError('Failed to get trip completion status', error);
    throw error;
  }
}

/**
 * Complete the journey
 */
async function completeJourney(token, tripId) {
  logInfo('Step 5: Completing journey...');
  
  try {
    const completionData = {
      rating: JOURNEY_COMPLETION.rating,
      review: JOURNEY_COMPLETION.review,
      photos: JOURNEY_COMPLETION.photos
    };

    logData('Completion Data', {
      rating: completionData.rating,
      review: completionData.review.substring(0, 50) + '...',
      photosCount: completionData.photos.length
    });

    const response = await apiClient.post(`/trips/${tripId}/complete`, completionData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    logSuccess('Journey completed successfully!');
    logData('Completion Response', {
      message: response.data.message,
      status: response.data.trip?.status,
      totalTripsCompleted: response.data.stats?.totalTripsCompleted,
      pointsAwarded: response.data.stats?.points
    });
    
    return response.data;
  } catch (error) {
    logError('Failed to complete journey', error);
    
    if (error.response?.status === 400) {
      logInfo(`Reason: ${error.response.data.message}`);
    }
    
    throw error;
  }
}

/**
 * Verify journey completion
 */
async function verifyCompletion(token, tripId) {
  logInfo('Step 6: Verifying journey completion...');
  
  try {
    const response = await apiClient.get(`/trips/${tripId}/completion-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.status === 'completed') {
      logSuccess('✨ Journey successfully verified as COMPLETED!');
      logData('Final Status', {
        status: response.data.status,
        hasReview: !!response.data.tripReview
      });
      return true;
    } else {
      logError(`Journey status is still: ${response.data.status}`);
      return false;
    }
  } catch (error) {
    logError('Failed to verify completion', error);
    throw error;
  }
}

// ==================== MAIN TEST FLOW ====================

async function runCompleteJourneyTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         BHROMONBONDHU JOURNEY COMPLETION TEST SCRIPT           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  logInfo(`Test started at ${new Date().toISOString()}`);
  logInfo(`API Base URL: ${API_BASE_URL}`);

  let token = null;
  let trip = null;

  try {
    // Step 1: Register or login user
    logInfo('\n========== AUTHENTICATION ==========\n');
    
    token = await registerTestUser();
    
    if (!token) {
      token = await loginUser();
    }

    // Step 2: Get upcoming trips
    logInfo('\n========== TRIP RETRIEVAL ==========\n');
    
    trip = await getUpcomingTrips(token);
    
    if (!trip) {
      logError('Cannot proceed without a trip');
      logInfo('Please create a trip first using the travel booking feature.');
      process.exit(1);
    }

    // Step 3: Check trip completion status
    logInfo('\n========== PRE-COMPLETION CHECK ==========\n');
    
    const preCompletionStatus = await getTripCompletionStatus(token, trip._id);
    
    if (!preCompletionStatus.canComplete) {
      logError(`Cannot complete trip. Status: ${preCompletionStatus.status}`);
      logInfo('The trip must be in "upcoming" status to be completed.');
      process.exit(1);
    }

    // Step 4: Complete the journey
    logInfo('\n========== JOURNEY COMPLETION ==========\n');
    
    const completionResult = await completeJourney(token, trip._id);

    // Step 5: Verify completion
    logInfo('\n========== VERIFICATION ==========\n');
    
    const isCompleted = await verifyCompletion(token, trip._id);

    // Success summary
    if (isCompleted) {
      console.log('\n');
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║              ✅ TEST PASSED - JOURNEY COMPLETED                ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.log('\n');
      
      logSuccess('All steps completed successfully!');
      
      logData('Summary', {
        tripId: trip._id,
        destination: trip.destination,
        rating: JOURNEY_COMPLETION.rating,
        status: 'completed',
        pointsAwarded: completionResult.stats?.points || 0
      });
    }

  } catch (error) {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║              ❌ TEST FAILED - SEE ERRORS ABOVE                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    logError('Test execution failed');
    process.exit(1);
  }

  logInfo(`Test completed at ${new Date().toISOString()}`);
  logInfo(`Log file: ${LOG_FILE}`);
  
  console.log('\n');
}

// ==================== ALTERNATIVE: Direct Completion (if you know the trip ID) ====================

/**
 * Direct completion - use if you already have a trip ID
 */
async function directCompleteJourney(tripId) {
  logInfo('Running DIRECT journey completion...');
  
  try {
    // Login
    const token = await loginUser();
    
    // Verify trip exists
    const trips = await apiClient.get('/trips', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const trip = trips.data.trips.find(t => t._id === tripId);
    
    if (!trip) {
      logError(`Trip with ID ${tripId} not found`);
      return false;
    }

    logData('Found Trip', {
      id: trip._id,
      destination: trip.destination,
      status: trip.status || trip.bookingStatus
    });

    // Complete the journey
    const response = await apiClient.post(`/trips/${tripId}/complete`, {
      rating: JOURNEY_COMPLETION.rating,
      review: JOURNEY_COMPLETION.review,
      photos: JOURNEY_COMPLETION.photos
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    logSuccess('Journey completed!');
    logData('Response', response.data);
    
    return true;
  } catch (error) {
    logError('Direct completion failed', error);
    return false;
  }
}

// ==================== RUN TEST ====================

// Check for command line arguments
const args = process.argv.slice(2);

if (args[0] === '--trip-id' && args[1]) {
  // Direct completion with trip ID
  directCompleteJourney(args[1]).then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  // Full test flow
  runCompleteJourneyTest().catch(error => {
    logError('Unhandled error', error);
    process.exit(1);
  });
}

// ==================== EXPORT FOR REUSE ====================

module.exports = {
  registerTestUser,
  loginUser,
  getUpcomingTrips,
  getTripCompletionStatus,
  completeJourney,
  verifyCompletion,
  directCompleteJourney,
  apiClient
};