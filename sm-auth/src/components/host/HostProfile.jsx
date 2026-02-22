import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, Award, Star, Users, Clock, Shield,
  Camera, Edit, Phone, Mail, MapPin, Calendar, X,
  Lock, User, Briefcase, Globe, BarChart2, Trophy,
  Crown, Sparkles, Medal, Heart, Zap, ThumbsUp,
  MessageCircle, TrendingUp, Wallet, Download, AlertCircle
} from 'lucide-react';

export function HostProfile({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [hostData, setHostData] = useState(null);
  const [profileStatus, setProfileStatus] = useState(null);
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
    phone: '',
    location: '',
    languages: '',
    bio: ''
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

  // API fetch helper
  const apiFetch = async (path, options = {}) => {
    const token = getAuthToken();
    const response = await fetch(`http://localhost:5000${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  // Fetch all host data
  const fetchHostData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const meData = await apiFetch('/api/auth/me');
      if (meData.success) {
        setUser(meData.user);
        setEditForm({
          fullName: meData.user.fullName || '',
          phone: meData.user.phone || '',
          location: meData.user.location || '',
          languages: Array.isArray(meData.user.languages) 
            ? meData.user.languages.join(', ') 
            : (meData.user.languages || ''),
          bio: meData.user.bio || ''
        });
      }

      // Fetch host profile
      const hostData = await apiFetch('/api/hosts/my-profile');
      if (hostData.success) {
        setHostData(hostData.host);
      }

      // Fetch profile status
      const statusData = await apiFetch('/api/hosts/profile-status');
      if (statusData.success) {
        setProfileStatus(statusData);
      }

    } catch (err) {
      console.error('Error fetching host data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchHostData();
  }, []);

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
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;

        const data = await apiFetch('/api/auth/profile-picture', {
          method: 'PUT',
          body: JSON.stringify({ profilePicture: base64Image })
        });

        if (data.success) {
          setUser(data.user);
          setSuccess('Profile picture updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
          // Refresh host data to update image
          fetchHostData();
        }
      };

      reader.onerror = () => {
        setError('Failed to read image file');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture');
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
      // Parse languages from comma-separated string
      const languagesArray = editForm.languages
        .split(',')
        .map(lang => lang.trim())
        .filter(Boolean);

      const data = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: editForm.fullName,
          phone: editForm.phone,
          location: editForm.location,
          languages: languagesArray,
          bio: editForm.bio
        })
      });

      if (data.success) {
        setUser(data.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          setShowEditModal(false);
          setSuccess('');
        }, 2000);
        // Refresh host data
        fetchHostData();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
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
      const data = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

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
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
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

  // ==================== BADGE LOGIC ====================
  // All badges are awarded based on REAL data from the database
  // No hardcoded values - everything comes from user and hostData

  const calculateBadges = () => {
    if (!user || !hostData) return [];

    const badges = [];

    // 1. Verified Host Badge (from user.verified)
    if (user.verified) {
      badges.push({
        id: 'verified',
        name: 'Verified Host',
        icon: CheckCircle,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        description: 'Identity verified by Bhromonbondhu',
        level: 'basic',
        unlocked: true
      });
    }

    // 2. KYC Completed Badge (from user.kycCompleted)
    if (user.kycCompleted) {
      badges.push({
        id: 'kyc',
        name: 'KYC Verified',
        icon: Shield,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50',
        description: 'Completed KYC verification',
        level: 'basic',
        unlocked: true
      });
    }

    // 3. Profile Complete Badge (from profileStatus)
    if (profileStatus?.profileComplete) {
      badges.push({
        id: 'profile-complete',
        name: 'Profile Complete',
        icon: CheckCircle,
        iconColor: 'text-teal-500',
        bgColor: 'bg-teal-50',
        description: 'All profile information filled',
        level: 'basic',
        unlocked: true
      });
    }

    // 4. Host Badge (from user.hostBadge or hostData)
    // This is the main badge that determines host level
    const hostBadge = user.hostBadge || hostData?.hostBadge || 'Host';
    
    // Map badge levels with appropriate icons and colors
    if (hostBadge === 'Superhost') {
      badges.push({
        id: 'superhost',
        name: 'Superhost',
        icon: Crown,
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: 'Exceptional hosting experience',
        level: 'premium',
        unlocked: true
      });
    } else if (hostBadge === 'Pro Host') {
      badges.push({
        id: 'prohost',
        name: 'Pro Host',
        icon: Award,
        iconColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        description: 'Professional hosting service',
        level: 'advanced',
        unlocked: true
      });
    } else {
      badges.push({
        id: 'host',
        name: 'Host',
        icon: User,
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-50',
        description: 'Active host on Bhromonbondhu',
        level: 'basic',
        unlocked: true
      });
    }

    // 5. Top Rated Badge (based on hostRating)
    const hostRating = user.hostRating || hostData?.hostRating || 0;
    if (hostRating >= 4.5) {
      badges.push({
        id: 'top-rated',
        name: 'Top Rated',
        icon: Star,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        description: `Rated ${hostRating.toFixed(1)}/5 by guests`,
        level: 'premium',
        unlocked: true
      });
    } else if (hostRating >= 4.0) {
      badges.push({
        id: 'highly-rated',
        name: 'Highly Rated',
        icon: Star,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        description: `Rated ${hostRating.toFixed(1)}/5 by guests`,
        level: 'advanced',
        unlocked: true
      });
    }

    // 6. Responsive Badge (based on responseRate)
    const responseRate = user.responseRate || hostData?.responseRate || 0;
    if (responseRate >= 95) {
      badges.push({
        id: 'ultra-responsive',
        name: 'Ultra Responsive',
        icon: Zap,
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
        description: `${responseRate}% response rate`,
        level: 'premium',
        unlocked: true
      });
    } else if (responseRate >= 80) {
      badges.push({
        id: 'responsive',
        name: 'Responsive',
        icon: MessageCircle,
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
        description: `${responseRate}% response rate`,
        level: 'advanced',
        unlocked: true
      });
    }

    // 7. Experienced Host Badge (based on totalGuests)
    const totalGuests = user.totalGuests || hostData?.totalGuests || 0;
    if (totalGuests >= 100) {
      badges.push({
        id: 'master-host',
        name: 'Master Host',
        icon: Trophy,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        description: `Hosted ${totalGuests}+ guests`,
        level: 'elite',
        unlocked: true
      });
    } else if (totalGuests >= 50) {
      badges.push({
        id: 'expert-host',
        name: 'Expert Host',
        icon: Medal,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        description: `Hosted ${totalGuests}+ guests`,
        level: 'premium',
        unlocked: true
      });
    } else if (totalGuests >= 20) {
      badges.push({
        id: 'experienced-host',
        name: 'Experienced Host',
        icon: TrendingUp,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        description: `Hosted ${totalGuests}+ guests`,
        level: 'advanced',
        unlocked: true
      });
    }

    // 8. Early Adopter Badge (based on account age)
    const accountAge = new Date() - new Date(user.createdAt);
    const yearsAsHost = accountAge / (1000 * 60 * 60 * 24 * 365);
    if (yearsAsHost >= 2) {
      badges.push({
        id: 'veteran',
        name: 'Veteran Host',
        icon: Clock,
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        description: `Hosting since ${formatJoinedDate(user.createdAt)}`,
        level: 'premium',
        unlocked: true
      });
    }

    // 9. Popular Host Badge (based on number of reviews)
    const totalReviews = hostData?.reviews || 0;
    if (totalReviews >= 50) {
      badges.push({
        id: 'popular',
        name: 'Popular Host',
        icon: Heart,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        description: `${totalReviews}+ guest reviews`,
        level: 'premium',
        unlocked: true
      });
    } else if (totalReviews >= 20) {
      badges.push({
        id: 'well-reviewed',
        name: 'Well Reviewed',
        icon: ThumbsUp,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        description: `${totalReviews}+ guest reviews`,
        level: 'advanced',
        unlocked: true
      });
    }

    // Sort badges by level: elite > premium > advanced > basic
    const levelOrder = { elite: 0, premium: 1, advanced: 2, basic: 3 };
    return badges.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
  };

  const badges = calculateBadges();

  // Group badges by level for display
  const eliteBadges = badges.filter(b => b.level === 'elite');
  const premiumBadges = badges.filter(b => b.level === 'premium');
  const advancedBadges = badges.filter(b => b.level === 'advanced');
  const basicBadges = badges.filter(b => b.level === 'basic');

  if (!user || !hostData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading host profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Host Profile</h2>
        <p className="text-gray-600">Manage your hosting account and showcase your badges</p>
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

      {/* Main Profile Content */}
      <div className="max-w-5xl space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              {/* Profile Picture or Default Icon */}
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName || user.username}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-teal-50"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-teal-50">
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
                className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-xl">{user.fullName || user.username}</h3>
                {user.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500" title="Verified Host" />
                )}
                {user.hostBadge && (
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full">
                    <Crown className="w-3 h-3" />
                    {user.hostBadge}
                  </span>
                )}
                {profileStatus?.profileComplete && (
                  <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Profile Complete
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3">@{user.username}</p>
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

          {/* Profile Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Rating</p>
              <p className="font-semibold">{user.hostRating?.toFixed(1) || '0'}/5</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Guests</p>
              <p className="font-semibold">{user.totalGuests || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <BarChart2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Response</p>
              <p className="font-semibold">{user.responseRate || 0}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Member</p>
              <p className="font-semibold">{formatJoinedDate(user.createdAt)}</p>
            </div>
          </div>

          {/* Contact Information */}
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
                  <span>{hostData?.location || user.location || 'Not provided'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Languages</label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>
                    {hostData?.languages?.length > 0 
                      ? hostData.languages.join(', ') 
                      : user.languages?.length > 0
                        ? user.languages.join(', ')
                        : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {user.bio && (
            <div className="border-t pt-6 mt-4">
              <h4 className="mb-2">About</h4>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Badges Section - The main feature */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg">Host Badges</h3>
            </div>
            <span className="text-xs text-gray-500">{badges.length} badges earned</span>
          </div>

          {/* Badges Legend */}
          <div className="flex gap-4 mb-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Elite</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Premium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Advanced</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Basic</span>
            </div>
          </div>

          {/* Elite Badges */}
          {eliteBadges.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-purple-600 mb-3 flex items-center gap-1">
                <Crown className="w-4 h-4" /> Elite Badges
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {eliteBadges.map(badge => (
                  <div
                    key={badge.id}
                    className={`${badge.bgColor} rounded-xl p-4 text-center border border-purple-100 shadow-sm hover:shadow-md transition-shadow cursor-help`}
                    title={badge.description}
                  >
                    <badge.icon className={`w-8 h-8 ${badge.iconColor} mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-800">{badge.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Premium Badges */}
          {premiumBadges.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-amber-600 mb-3 flex items-center gap-1">
                <Award className="w-4 h-4" /> Premium Badges
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {premiumBadges.map(badge => (
                  <div
                    key={badge.id}
                    className={`${badge.bgColor} rounded-xl p-4 text-center border border-amber-100 shadow-sm hover:shadow-md transition-shadow cursor-help`}
                    title={badge.description}
                  >
                    <badge.icon className={`w-8 h-8 ${badge.iconColor} mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-800">{badge.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Badges */}
          {advancedBadges.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-blue-600 mb-3 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Advanced Badges
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {advancedBadges.map(badge => (
                  <div
                    key={badge.id}
                    className={`${badge.bgColor} rounded-xl p-4 text-center border border-blue-100 shadow-sm hover:shadow-md transition-shadow cursor-help`}
                    title={badge.description}
                  >
                    <badge.icon className={`w-8 h-8 ${badge.iconColor} mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-800">{badge.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Badges */}
          {basicBadges.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Basic Badges
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {basicBadges.map(badge => (
                  <div
                    key={badge.id}
                    className={`${badge.bgColor} rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-help`}
                    title={badge.description}
                  >
                    <badge.icon className={`w-8 h-8 ${badge.iconColor} mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-800">{badge.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {badges.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No badges earned yet. Complete your profile and start hosting to earn badges!</p>
            </div>
          )}
        </div>

        {/* Change Password - Only this remains from Security Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Change Password</h3>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Change Password
          </button>
        </div>

        {/* Profile Completeness */}
        {!profileStatus?.profileComplete && profileStatus?.missingFields?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Your profile is {profileStatus?.completionPercentage || 0}% complete. 
                  Add the following to earn badges and start hosting:
                </p>
                <ul className="space-y-1 text-sm text-amber-700">
                  {profileStatus.missingFields.map(field => (
                    <li key={field} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      {field === 'location' && 'Add your location'}
                      {field === 'languages' && 'Add languages you speak'}
                      {field === 'bio/description' && 'Write a bio about yourself'}
                      {field === 'price' && 'Set your hosting price'}
                      {field === 'propertyImage' && 'Upload property images'}
                      {field === 'services' && 'Select services you offer'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Cox's Bazar, Bangladesh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Languages</label>
                <input
                  type="text"
                  name="languages"
                  value={editForm.languages}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Bengali, English (comma separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple languages with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditFormChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Tell guests about yourself..."
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
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <Lock className="w-5 h-5 text-teal-500" />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default HostProfile;