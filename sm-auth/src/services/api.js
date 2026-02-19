// API Service for Profile Management
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Profile API
export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return response.json();
  },

  // Update profile picture
  updateProfilePicture: async (profilePictureUrl) => {
    const response = await fetch(`${API_BASE_URL}/profile/picture`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ profilePicture: profilePictureUrl })
    });
    return response.json();
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/picture`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Complete KYC
  completeKYC: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/complete-kyc`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Auth API
export const authAPI = {
  // Get current user
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return response.json();
  }
};

// Upload image to Cloudinary (example)
export const uploadImage = async (file) => {
  // Note: You need to set up Cloudinary or another image hosting service
  // This is just an example structure
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_upload_preset'); // Set in Cloudinary
  
  const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};