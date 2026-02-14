import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Shield, AlertCircle, Camera, Edit, Phone, Mail, MapPin, Calendar, X, Lock, User } from 'lucide-react';

export function TravelerProfile({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Reference for file input
  const fileInputRef = useRef(null);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: ''
  });

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch traveler statistics
  const fetchTravelerStats = async () => {
    try {
      setStatsLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/traveler/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats:', data.message);
        // Set default stats if fetch fails
        setStats({
          totalTrips: 0,
          placesVisited: 0,
          reviewsGiven: 0,
          hostsBooked: 0,
          travelTier: 'Explorer',
          travelPoints: 0
        });
      }
    } catch (err) {
      console.error('Error fetching traveler stats:', err);
      // Set default stats on error
      setStats({
        totalTrips: 0,
        placesVisited: 0,
        reviewsGiven: 0,
        hostsBooked: 0,
        travelTier: 'Explorer',
        travelPoints: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please login to view your profile');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setEditForm({
          fullName: data.user.fullName || '',
          phone: data.user.phone || ''
        });
      } else {
        setError(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    }
  };

  // Load user profile and stats on component mount
  useEffect(() => {
    if (!initialUser) {
      fetchUserProfile();
    } else {
      setEditForm({
        fullName: initialUser.fullName || '',
        phone: initialUser.phone || ''
      });
    }
    
    // Always fetch stats
    fetchTravelerStats();
  }, [initialUser]);

  // Handle profile picture upload
  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;

        const token = getAuthToken();
        if (!token) {
          setError('Please login to update your profile picture');
          setUploadingImage(false);
          return;
        }

        // Send to backend
        const response = await fetch('http://localhost:5000/api/auth/profile-picture', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            profilePicture: base64Image
          })
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setSuccess('Profile picture updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.message || 'Failed to upload profile picture');
        }

        setUploadingImage(false);
      };

      reader.onerror = () => {
        setError('Failed to read image file');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture. Please try again.');
      setUploadingImage(false);
    }
  };

  // Handle Edit Profile Submit
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please login to update your profile');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          phone: editForm.phone
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          setShowEditModal(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Password Submit
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Please fill in all password fields');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please login to change your password');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format joined date
  const formatJoinedDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl mb-2">Profile</h2>
        <p className="text-gray-600">Manage your account and verification</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                {/* Profile Picture or Default Icon */}
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName || user.username}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Camera Button with Upload Functionality */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <button 
                  onClick={handleProfilePictureClick}
                  disabled={uploadingImage}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Change profile picture"
                >
                  {uploadingImage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl">{user.username}</h3>
                  {user.verified && (
                    <CheckCircle className="w-5 h-5 text-blue-500" title="Verified User" />
                  )}
                </div>
                <p className="text-gray-600 mb-3">{user.fullName}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="mb-4">Contact Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Dhaka, Bangladesh</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Member Since</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatJoinedDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm mb-1">Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-600">Add an extra layer of security</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm mb-1">Biometric Login</h4>
                  <p className="text-xs text-gray-600">Use fingerprint or face recognition</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Language</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>English</option>
                  <option>বাংলা (Bengali)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Currency</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>BDT (৳)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="notifications" className="w-4 h-4" defaultChecked />
                <label htmlFor="notifications" className="text-sm">Email notifications for bookings and updates</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="marketing" className="w-4 h-4" />
                <label htmlFor="marketing" className="text-sm">Receive promotional emails and offers</label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-500" />
              <h3>Verification Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Phone</span>
                {user.phone ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Identity (KYC)</span>
                {user.kycCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </div>
            {!user.kycCompleted && (
              <div className="mt-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                  <p className="text-xs text-yellow-800">
                    KYC verification is required for bookings over ৳10,000
                  </p>
                </div>
                <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Complete KYC
                </button>
              </div>
            )}
          </div>

          {/* Travel Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Travel Stats</h3>
            {statsLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading stats...</p>
              </div>
            ) : stats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Trips</span>
                  <span className="text-lg font-semibold text-blue-600">{stats.totalTrips || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Places Visited</span>
                  <span className="text-lg font-semibold text-blue-600">{stats.placesVisited || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reviews Given</span>
                  <span className="text-lg font-semibold text-blue-600">{stats.reviewsGiven || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Travel Tier</span>
                  <span className="text-lg font-semibold text-purple-600">{stats.travelTier || 'Explorer'}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-gray-600">Travel Points</span>
                  <span className="text-lg font-semibold text-purple-600">{(stats.travelPoints || 0).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No stats available</p>
              </div>
            )}
          </div>

          {/* Badges & Achievements */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Badges & Achievements</h3>
            <div className="grid grid-cols-3 gap-3">
              {/* Travel Tier Badge */}
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 ${
                  stats?.travelTier === 'Gold Traveler' ? 'bg-yellow-100 text-yellow-600' :
                  stats?.travelTier === 'Silver Traveler' ? 'bg-gray-200 text-gray-600' :
                  stats?.travelTier === 'Bronze Traveler' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {stats?.travelTier === 'Gold Traveler' ? '🥇' :
                   stats?.travelTier === 'Silver Traveler' ? '🥈' :
                   stats?.travelTier === 'Bronze Traveler' ? '🥉' :
                   '🎫'}
                </div>
                <p className="text-xs font-semibold">{stats?.travelTier || 'Explorer'}</p>
              </div>

              {/* Explorer Badge (5+ trips) */}
              <div className="text-center opacity-75">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 ${
                  (stats?.totalTrips || 0) >= 5 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  🌍
                </div>
                <p className="text-xs">Explorer</p>
                {(stats?.totalTrips || 0) < 5 && <p className="text-xs text-gray-400">{5 - (stats?.totalTrips || 0)} trips</p>}
              </div>

              {/* Places Badge (10+ places) */}
              <div className="text-center opacity-75">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 ${
                  (stats?.placesVisited || 0) >= 10 ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  📍
                </div>
                <p className="text-xs">Wanderer</p>
                {(stats?.placesVisited || 0) < 10 && <p className="text-xs text-gray-400">{10 - (stats?.placesVisited || 0)} places</p>}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-200">
            <h3 className="text-red-600 mb-4">Danger Zone</h3>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Download My Data
              </button>
              <button className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Edit Profile</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email (cannot be changed)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-semibold">Change Password</h3>
              </div>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setError('');
                  setSuccess('');
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter new password (min. 6 characters)"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Re-enter new password"
                  minLength={6}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  • Password must be at least 6 characters long<br />
                  • Make sure your new passwords match
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError('');
                    setSuccess('');
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}