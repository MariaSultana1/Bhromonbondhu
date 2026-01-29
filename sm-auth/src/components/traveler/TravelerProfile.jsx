import { CheckCircle, Shield, AlertCircle, Camera, Edit, Phone, Mail, MapPin, Calendar } from 'lucide-react';

export function TravelerProfile({ user }) {
  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl mb-2">Profile</h2>
        <p className="text-gray-600">Manage your account and verification</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <img
                  src="./images/Ellipse 22.png"
                  alt={user.name}
                  className="w-24 h-24 rounded-full"
                />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl">{user.name}</h3>
                  {user.verified && (
                    <CheckCircle className="w-5 h-5 text-blue-500" title="Verified User" />
                  )}
                </div>
                <p className="text-gray-600 mb-3">{user.email}</p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
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
                    <span>+880 1XXX-XXXXXX</span>
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
                    <span>Jan 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>


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

              <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                Change Password
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Language</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>English</option>
                  <option>বাংলা (Bengali)</option>
                  <option>हिन्दी (Hindi)</option>
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


        <div className="space-y-6">
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
                <CheckCircle className="w-5 h-5 text-green-500" />
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


          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Travel Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Trips</span>
                <span className="text-lg text-blue-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Places Visited</span>
                <span className="text-lg text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reviews Given</span>
                <span className="text-lg text-blue-600">6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Travel Points</span>
                <span className="text-lg text-purple-600">2,450</span>
              </div>
            </div>
          </div>


          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Badges & Achievements</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-1">
                  🏆
                </div>
                <p className="text-xs">Explorer</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-1">
                  ⭐
                </div>
                <p className="text-xs">Reviewer</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-1">
                  🌟
                </div>
                <p className="text-xs">Local Friend</p>
              </div>
            </div>
          </div>


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
    </div>
  );
}