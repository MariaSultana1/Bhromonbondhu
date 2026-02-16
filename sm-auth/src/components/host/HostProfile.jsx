import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, AlertCircle, Shield, Camera, Edit, Phone, Mail,
  MapPin, Languages, Award, Lock, User, X, Star, Users,
  Clock, Briefcase, Globe, CreditCard, FileText, ChevronRight,
  Eye, EyeOff, Save, Upload, BarChart2
} from 'lucide-react';

const API = 'http://localhost:5000';
const getToken = () => localStorage.getItem('token');

// ─── Reusable input ───────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
  />
);

const Select = ({ children, className = '', ...props }) => (
  <select
    {...props}
    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white ${className}`}
  >
    {children}
  </select>
);

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
      ${type === 'success' ? 'bg-teal-600' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
};

// ─── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// ─── Verification row ──────────────────────────────────────────────────────────
const VerifRow = ({ label, done, date }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3">
      {done
        ? <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
        : <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />}
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {done && date && <p className="text-xs text-teal-600">Completed {date}</p>}
        {!done && <p className="text-xs text-amber-500">Pending</p>}
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════════
export function HostProfile({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [hostData, setHostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'complete' | 'security'
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef(null);

  // ── Edit profile form ──────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    fullName: '', phone: '', location: '', languages: '', bio: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // ── Complete host profile form ─────────────────────────────────────────────
  const [completeForm, setCompleteForm] = useState({
    location: '',
    languages: '',
    bio: '',
    price: '',
    propertyImage: '',
    services: [],
    experience: 'Beginner',
    responseTime: 'Within 1 hour',
    cancellationPolicy: 'Flexible',
    minStay: '1',
    maxGuests: '4',
    availableFromDate: '',
    availableToDate: ''
  });
  const [completeLoading, setCompleteLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  // ── Password form ──────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ cur: false, new: false, con: false });
  const [pwLoading, setPwLoading] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

  // ── Fetch user + host data ─────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [meRes, hostRes, statusRes] = await Promise.all([
        fetch(`${API}/api/auth/me`, { headers }),
        fetch(`${API}/api/hosts/my-profile`, { headers }),
        fetch(`${API}/api/hosts/profile-status`, { headers })
      ]);

      const meData = await meRes.json();
      if (meData.success) {
        setUser(meData.user);
        setEditForm({
          fullName: meData.user.fullName || '',
          phone: meData.user.phone || '',
          location: meData.user.location || '',
          languages: Array.isArray(meData.user.languages) ? meData.user.languages.join(', ') : '',
          bio: meData.user.bio || ''
        });
      }

      const hostJson = await hostRes.json();
      if (hostJson.success) {
        setHostData(hostJson.host);
        // Pre-fill complete form with existing data
        const h = hostJson.host;
        setCompleteForm(prev => ({
          ...prev,
          location: h.location || '',
          languages: Array.isArray(h.languages) ? h.languages.join(', ') : '',
          bio: h.description || h.bio || '',
          price: h.price ? String(h.price) : '',
          propertyImage: h.propertyImage || '',
          services: h.services || [],
          experience: h.experience || 'Beginner',
          responseTime: h.responseTime || 'Within 1 hour',
          cancellationPolicy: h.cancellationPolicy || 'Flexible',
          minStay: h.minStay ? String(h.minStay) : '1',
          maxGuests: h.maxGuests ? String(h.maxGuests) : '4',
          availableFromDate: h.availableFromDate ? h.availableFromDate.split('T')[0] : '',
          availableToDate: h.availableToDate ? h.availableToDate.split('T')[0] : ''
        }));
      }

      const statusJson = await statusRes.json();
      if (statusJson.success) setProfileStatus(statusJson);

    } catch (e) {
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Profile picture upload ─────────────────────────────────────────────────
  const handlePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Please select an image file', 'error');
    if (file.size > 5 * 1024 * 1024) return showToast('Image must be under 5MB', 'error');

    setUploadingImg(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const res = await fetch(`${API}/api/auth/profile-picture`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ profilePicture: ev.target.result })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          showToast('Profile picture updated!');
        } else showToast(data.message || 'Upload failed', 'error');
      } catch { showToast('Upload failed', 'error'); }
      finally { setUploadingImg(false); }
    };
    reader.readAsDataURL(file);
  };

  // ── Save basic profile ─────────────────────────────────────────────────────
  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          fullName: editForm.fullName,
          phone: editForm.phone,
          location: editForm.location,
          languages: editForm.languages.split(',').map(l => l.trim()).filter(Boolean),
          bio: editForm.bio
        })
      });
      const data = await res.json();
      if (data.success) { setUser(data.user); showToast('Profile updated!'); }
      else showToast(data.message || 'Update failed', 'error');
    } catch { showToast('Update failed', 'error'); }
    finally { setEditLoading(false); }
  };

  // ── Toggle service ─────────────────────────────────────────────────────────
  const toggleService = (svc) => {
    setCompleteForm(prev => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter(s => s !== svc)
        : [...prev.services, svc]
    }));
  };

  // ── Complete host profile ──────────────────────────────────────────────────
  const handleCompleteProfile = async () => {
    const { location, languages, bio, price, services, availableFromDate, availableToDate, propertyImage } = completeForm;

    if (!location.trim()) return showToast('Location is required', 'error');
    if (!languages.trim()) return showToast('Languages are required', 'error');
    if (!bio.trim() || bio.trim().length < 20) return showToast('Bio must be at least 20 characters', 'error');
    if (!price || parseFloat(price) <= 0) return showToast('Price must be a positive number', 'error');
    if (!services.length) return showToast('Select at least one service', 'error');
    if (!availableFromDate || !availableToDate) return showToast('Availability dates are required', 'error');
    if (services.includes('Accommodation') && !propertyImage.trim()) return showToast('Property image URL is required for Accommodation', 'error');

    setCompleteLoading(true);
    try {
      const res = await fetch(`${API}/api/hosts/complete-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          location: completeForm.location.trim(),
          languages: completeForm.languages.split(',').map(l => l.trim()).filter(Boolean),
          bio: completeForm.bio.trim(),
          price: parseFloat(completeForm.price),
          propertyImage: completeForm.propertyImage.trim(),
          services: completeForm.services,
          experience: completeForm.experience,
          responseTime: completeForm.responseTime,
          cancellationPolicy: completeForm.cancellationPolicy,
          minStay: parseInt(completeForm.minStay) || 1,
          maxGuests: parseInt(completeForm.maxGuests) || 4,
          availableFromDate: completeForm.availableFromDate,
          availableToDate: completeForm.availableToDate
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Host profile completed! 🎉');
        fetchData(); // Refresh all data
        setActiveTab('profile');
      } else showToast(data.message || 'Failed to complete profile', 'error');
    } catch { showToast('Failed to complete profile', 'error'); }
    finally { setCompleteLoading(false); }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handlePwChange = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword)
      return showToast('Please fill all password fields', 'error');
    if (pwForm.newPassword.length < 6)
      return showToast('New password must be at least 6 characters', 'error');
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return showToast('New passwords do not match', 'error');

    setPwLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password changed successfully!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else showToast(data.message || 'Failed to change password', 'error');
    } catch { showToast('Failed to change password', 'error'); }
    finally { setPwLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    </div>
  );

  const isProfileComplete = profileStatus?.profileComplete;
  const completionPct = profileStatus?.completionPercentage || 0;
  const missingFields = profileStatus?.missingFields || [];

  const SERVICE_OPTIONS = ['Local Guide', 'Transportation', 'Meals', 'Photography', 'Activities', 'Accommodation'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Host Profile</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account and hosting setup</p>
        </div>
        {!isProfileComplete && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-700 font-medium">{completionPct}% complete</span>
            <button
              onClick={() => setActiveTab('complete')}
              className="text-xs bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Complete now
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'complete', label: 'Host Setup', icon: Briefcase },
          { id: 'security', label: 'Security', icon: Lock }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === id ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'complete' && !isProfileComplete && (
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ════ TAB: PROFILE ════ */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic info card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-5 mb-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-4 ring-teal-50" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center ring-4 ring-teal-50">
                      <User className="w-9 h-9 text-teal-500" />
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePicChange} className="hidden" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingImg}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 shadow-md disabled:opacity-60"
                    title="Change photo"
                  >
                    {uploadingImg
                      ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Name block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-800">{user?.fullName || user?.username}</h3>
                    {user?.verified && <CheckCircle className="w-5 h-5 text-teal-500" title="Verified" />}
                  </div>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {user?.hostBadge && (
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                        <Award className="w-3 h-3" /> {user.hostBadge}
                      </span>
                    )}
                    {isProfileComplete && (
                      <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Profile Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <Input value={editForm.fullName} onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
                </Field>
                <Field label="Phone">
                  <Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
                </Field>
                <Field label="Location">
                  <Input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} placeholder="City, Bangladesh" />
                </Field>
                <Field label="Languages" hint="Comma separated: Bengali, English">
                  <Input value={editForm.languages} onChange={e => setEditForm(p => ({ ...p, languages: e.target.value }))} placeholder="Bengali, English" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email (cannot be changed)">
                    <Input value={user?.email} disabled />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Bio">
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      placeholder="Tell guests about yourself..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                    />
                  </Field>
                </div>
              </div>

              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex items-center gap-2 px-5 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Verification card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-teal-500" />
                <h3 className="font-semibold text-gray-800">Verification Requirements</h3>
              </div>
              <VerifRow label="Identity Verification (NID/Passport)" done={!!user?.idVerifiedAt} date={fmt(user?.idVerifiedAt)} />
              <VerifRow label="Police Background Check" done={!!user?.bgCheckAt} date={fmt(user?.bgCheckAt)} />
              <VerifRow label="Host Training" done={!!user?.trainingAt} date={fmt(user?.trainingAt)} />
              <VerifRow label="Bank Account Verification" done={!!user?.bankVerifiedAt} date={fmt(user?.bankVerifiedAt)} />

              {user?.kycCompleted ? (
                <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> All verifications complete — you're a trusted host!
                </div>
              ) : (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> Contact support to complete verification steps.
                </div>
              )}
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Star} label="Rating" value={`${user?.hostRating || 0}/5`} color="bg-yellow-100 text-yellow-600" />
              <StatCard icon={Users} label="Guests" value={user?.totalGuests || 0} color="bg-blue-100 text-blue-600" />
              <StatCard icon={BarChart2} label="Response" value={`${user?.responseRate || 0}%`} color="bg-green-100 text-green-600" />
              <StatCard icon={Clock} label="Member" value={fmt(user?.createdAt) || '—'} color="bg-purple-100 text-purple-600" />
            </div>

            {/* Profile completeness */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3">Profile Completeness</h4>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${completionPct}%`,
                    background: completionPct === 100 ? '#14b8a6' : completionPct >= 60 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mb-3">{completionPct}% complete</p>
              {missingFields.length > 0 && (
                <div className="space-y-1.5">
                  {missingFields.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      Missing: {f}
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveTab('complete')}
                    className="mt-2 w-full text-xs text-teal-600 border border-teal-300 rounded-lg py-1.5 hover:bg-teal-50 transition-colors flex items-center justify-center gap-1"
                  >
                    Complete profile <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
              {missingFields.length === 0 && (
                <p className="text-xs text-teal-600 font-medium">✓ Your profile is fully complete!</p>
              )}
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3">Badges</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { emoji: '🏆', label: 'Superhost', active: user?.hostBadge === 'Superhost' || user?.hostBadge === 'Pro Host' },
                  { emoji: '⭐', label: 'Top Rated', active: (user?.hostRating || 0) >= 4.5 },
                  { emoji: '✓', label: 'Verified', active: !!user?.verified },
                  { emoji: '💬', label: 'Responsive', active: (user?.responseRate || 0) >= 90 },
                  { emoji: '🎖️', label: 'Pro Host', active: user?.hostBadge === 'Pro Host' },
                  { emoji: '🌟', label: 'Trusted', active: !!user?.kycCompleted }
                ].map(b => (
                  <div key={b.label} className={`text-center p-2 rounded-xl transition-all ${b.active ? 'bg-teal-50 opacity-100' : 'bg-gray-50 opacity-40 grayscale'}`}>
                    <div className="text-2xl mb-0.5">{b.emoji}</div>
                    <p className="text-xs text-gray-600">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ TAB: HOST SETUP (Complete Profile) ════ */}
      {activeTab === 'complete' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-5">
            <h3 className="text-lg font-bold text-white">Complete Your Host Profile</h3>
            <p className="text-teal-100 text-sm mt-1">
              Fill in the details below to start accepting guests. Fields marked * are required.
            </p>
          </div>

          <div className="p-6 space-y-8">

            {/* ── Section 1: Location & Languages ── */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-500" /> Location & Languages
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Your Location *">
                  <Input
                    value={completeForm.location}
                    onChange={e => setCompleteForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Cox's Bazar, Bangladesh"
                  />
                </Field>
                <Field label="Languages Spoken *" hint="Comma separated">
                  <Input
                    value={completeForm.languages}
                    onChange={e => setCompleteForm(p => ({ ...p, languages: e.target.value }))}
                    placeholder="Bengali, English, Hindi"
                  />
                </Field>
              </div>
            </div>

            {/* ── Section 2: About You ── */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-500" /> About You
              </h4>
              <Field label="Bio / Description * (min 20 characters)" hint="Tell guests about yourself, your area, and your hosting style">
                <textarea
                  value={completeForm.bio}
                  onChange={e => setCompleteForm(p => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  placeholder="Share your story, local knowledge, and what makes your hosting special..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
                <p className="mt-1 text-xs text-gray-400">{completeForm.bio.length}/500 characters (min 20)</p>
              </Field>
            </div>

            {/* ── Section 3: Services Offered ── */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-500" /> Services Offered *
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SERVICE_OPTIONS.map(svc => {
                  const active = completeForm.services.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left
                        ${active
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'}`}
                    >
                      <span className="mr-1.5">
                        {svc === 'Local Guide' && '🗺️'}
                        {svc === 'Transportation' && '🚗'}
                        {svc === 'Meals' && '🍽️'}
                        {svc === 'Photography' && '📷'}
                        {svc === 'Activities' && '🏄'}
                        {svc === 'Accommodation' && '🏠'}
                      </span>
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Section 4: Pricing & Capacity ── */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-500" /> Pricing & Capacity
              </h4>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Price per day (BDT) *">
                  <Input
                    type="number"
                    value={completeForm.price}
                    onChange={e => setCompleteForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. 2500"
                    min="0"
                  />
                </Field>
                <Field label="Max Guests *">
                  <Input
                    type="number"
                    value={completeForm.maxGuests}
                    onChange={e => setCompleteForm(p => ({ ...p, maxGuests: e.target.value }))}
                    placeholder="4"
                    min="1"
                  />
                </Field>
                <Field label="Minimum Stay (nights)">
                  <Input
                    type="number"
                    value={completeForm.minStay}
                    onChange={e => setCompleteForm(p => ({ ...p, minStay: e.target.value }))}
                    placeholder="1"
                    min="1"
                  />
                </Field>
              </div>
            </div>

            {/* ── Section 5: Property Image (conditional) ── */}
            {completeForm.services.includes('Accommodation') && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-500" /> Property Image
                </h4>
                <Field label="Property Image URL * (required for Accommodation)" hint="Paste a direct image URL (e.g. from Imgur, Cloudinary, etc.)">
                  <Input
                    value={completeForm.propertyImage}
                    onChange={e => setCompleteForm(p => ({ ...p, propertyImage: e.target.value }))}
                    placeholder="https://example.com/your-property.jpg"
                  />
                </Field>
                {completeForm.propertyImage && (
                  <div className="mt-2 relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={completeForm.propertyImage}
                      alt="Property preview"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Section 6: Availability ── */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-500" /> Availability
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Available From *">
                  <Input
                    type="date"
                    value={completeForm.availableFromDate}
                    onChange={e => setCompleteForm(p => ({ ...p, availableFromDate: e.target.value }))}
                  />
                </Field>
                <Field label="Available Until *">
                  <Input
                    type="date"
                    value={completeForm.availableToDate}
                    onChange={e => setCompleteForm(p => ({ ...p, availableToDate: e.target.value }))}
                  />
                </Field>
              </div>
            </div>

            {/* ── Section 7: Preferences ── */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" /> Preferences
              </h4>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Experience Level">
                  <Select value={completeForm.experience} onChange={e => setCompleteForm(p => ({ ...p, experience: e.target.value }))}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </Select>
                </Field>
                <Field label="Response Time">
                  <Select value={completeForm.responseTime} onChange={e => setCompleteForm(p => ({ ...p, responseTime: e.target.value }))}>
                    <option>Within 30 minutes</option>
                    <option>Within 1 hour</option>
                    <option>Within 2 hours</option>
                    <option>Within 24 hours</option>
                  </Select>
                </Field>
                <Field label="Cancellation Policy">
                  <Select value={completeForm.cancellationPolicy} onChange={e => setCompleteForm(p => ({ ...p, cancellationPolicy: e.target.value }))}>
                    <option>Flexible</option>
                    <option>Moderate</option>
                    <option>Strict</option>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">* Required fields must be filled before saving</p>
              <button
                onClick={handleCompleteProfile}
                disabled={completeLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors shadow-sm"
              >
                {completeLoading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><Save className="w-4 h-4" /> Save Host Profile</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ TAB: SECURITY ════ */}
      {activeTab === 'security' && (
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Change password */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-5 h-5 text-teal-500" />
              <h3 className="font-semibold text-gray-800">Change Password</h3>
            </div>
            <div className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password', vis: 'cur' },
                { key: 'newPassword', label: 'New Password', vis: 'new' },
                { key: 'confirmPassword', label: 'Confirm New Password', vis: 'con' }
              ].map(({ key, label, vis }) => (
                <Field key={key} label={label}>
                  <div className="relative">
                    <Input
                      type={showPw[vis] ? 'text' : 'password'}
                      value={pwForm[key]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      className="pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => ({ ...p, [vis]: !p[vis] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw[vis] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
              ))}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 space-y-0.5">
                <p>• Minimum 6 characters</p>
                <p>• New passwords must match</p>
              </div>
              <button
                onClick={handlePwChange}
                disabled={pwLoading}
                className="w-full py-2.5 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors"
              >
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>

          {/* Account settings */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Notification Preferences</h3>
              {[
                { id: 'notif-booking', label: 'New booking notifications', checked: true },
                { id: 'notif-msg', label: 'Message notifications', checked: true },
                { id: 'notif-review', label: 'Review notifications', checked: true },
                { id: 'notif-promo', label: 'Promotional emails', checked: false }
              ].map(({ id, label, checked }) => (
                <label key={id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 cursor-pointer">
                  <input type="checkbox" defaultChecked={checked} className="w-4 h-4 accent-teal-500 rounded" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Auto-Accept Bookings</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-checked:bg-teal-500 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm text-gray-600">Automatically accept qualifying bookings</span>
              </label>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-100">
              <h3 className="font-semibold text-red-600 mb-3">Danger Zone</h3>
              <div className="space-y-2">
                <button className="w-full py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Download My Data
                </button>
                <button className="w-full py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}