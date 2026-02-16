/**
 * API Service for Host Dashboard
 * Centralizes all API calls and handles authentication
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get authorization header with token
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Handle API errors consistently
 */
async function handleApiResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.message || `HTTP ${response.status}`;
    
    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    throw new Error(message);
  }
  return response.json();
}

/**
 * Host Dashboard API Service
 */
export const hostDashboardAPI = {
  // ==================== Host Profile ====================
  
  /**
   * Get current host's profile
   */
  getHostProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/hosts/my-profile`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Update host profile
   */
  updateHostProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/hosts/my-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleApiResponse(response);
  },

  /**
   * Complete host profile setup
   */
  completeHostProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/hosts/complete-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleApiResponse(response);
  },

  /**
   * Check if host profile is complete
   */
  checkProfileStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/hosts/profile-status`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  // ==================== Bookings ====================

  /**
   * Get all bookings for host
   */
  getBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/bookings${queryParams ? '?' + queryParams : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Get single booking details
   */
  getBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId, reason) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleApiResponse(response);
  },

  /**
   * Get booking receipt
   */
  getBookingReceipt: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/receipt`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  // ==================== Earnings ====================

  /**
   * Get earnings summary
   */
  getEarningsSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/hosts/earnings/summary`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Get detailed earnings with transactions
   */
  getEarnings: async (limit = 100) => {
    const response = await fetch(
      `${API_BASE_URL}/hosts/earnings?limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(response);
  },

  /**
   * Get earnings statistics
   */
  getEarningsStats: async (period = 'month') => {
    const response = await fetch(
      `${API_BASE_URL}/hosts/earnings/stats?period=${period}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(response);
  },

  // ==================== Reviews ====================

  /**
   * Get all reviews for host
   */
  getReviews: async (hostId) => {
    const response = await fetch(`${API_BASE_URL}/hosts/${hostId}/reviews`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Submit a review response
   */
  submitReviewResponse: async (reviewId, response) => {
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}/response`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ response }),
    });
    return handleApiResponse(res);
  },

  // ==================== Services ====================

  /**
   * Get host services
   */
  getHostServices: async () => {
    const response = await fetch(`${API_BASE_URL}/host-services/my-services`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Create a new service
   */
  createService: async (serviceData) => {
    const response = await fetch(`${API_BASE_URL}/host-services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleApiResponse(response);
  },

  /**
   * Update a service
   */
  updateService: async (serviceId, serviceData) => {
    const response = await fetch(`${API_BASE_URL}/host-services/${serviceId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleApiResponse(response);
  },

  /**
   * Delete a service
   */
  deleteService: async (serviceId) => {
    const response = await fetch(`${API_BASE_URL}/host-services/${serviceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Check service availability
   */
  checkServiceAvailability: async (serviceId, checkIn, checkOut) => {
    const response = await fetch(
      `${API_BASE_URL}/host-services/${serviceId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(response);
  },

  /**
   * Get service statistics
   */
  getServiceStats: async () => {
    const response = await fetch(`${API_BASE_URL}/host-services/stats/my-stats`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  // ==================== Messages ====================

  /**
   * Get all conversations
   */
  getConversations: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Get messages in a conversation
   */
  getMessages: async (conversationId, limit = 50) => {
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}?limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(response);
  },

  /**
   * Send a message
   */
  sendMessage: async (conversationId, content) => {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversationId, content }),
    });
    return handleApiResponse(response);
  },

  /**
   * Mark messages as read
   */
  markMessagesAsRead: async (conversationId) => {
    const response = await fetch(
      `${API_BASE_URL}/messages/read/${conversationId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(response);
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  // ==================== User Profile ====================

  /**
   * Get current user data
   */
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleApiResponse(response);
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (imageBase64) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ profilePicture: imageBase64 }),
    });
    return handleApiResponse(response);
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleApiResponse(response);
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      handleApiResponse(response);
    } finally {
      localStorage.removeItem('token');
    }
  },
};

export default hostDashboardAPI;