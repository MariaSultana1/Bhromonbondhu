import { CheckCircle, AlertCircle, Shield, Camera, Edit, Phone, Mail, MapPin, Languages, Award, X, HelpCircle } from 'lucide-react';
import { useState } from 'react';

export function HostProfileComplete({ user }) {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditBio, setShowEditBio] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);

  return (
    <div className="space-y-6">
     
      <div>
        <h2 className="text-2xl mb-2">Host Profile</h2>
        <p className="text-gray-600">Manage your profile and verification</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <img
                  src="./images/man 2.png"
                  alt={user.name}
                  className="w-24 h-24 rounded-full"
                />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl">{user.name}</h3>
                  {user.verified && (
                    <CheckCircle className="w-5 h-5 text-green-500" title="Verified Host" />
                  )}
                </div>
                <p className="text-gray-600 mb-1">{user.email}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Superhost</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            
            <div className="border-t pt-6 mb-6">
              <h4 className="mb-3">About Me</h4>
              <p className="text-sm text-gray-700 mb-3">
                Passionate local guide with 5+ years of experience showing travelers the best of Cox's Bazar. 
                I love sharing my culture, cuisine, and the hidden gems of my hometown with visitors from around the world.
              </p>
              <button
                onClick={() => setShowEditBio(true)}
                className="text-sm text-blue-500 hover:underline"
              >
                Edit Bio
              </button>
            </div>

            
            <div className="border-t pt-6">
              <h4 className="mb-4">Contact Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">+880 1712-345678</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Cox's Bazar, Bangladesh</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Languages</label>
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Bengali, English</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Verification Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="text-sm mb-1">Identity Verified</h4>
                    <p className="text-xs text-gray-600">Verified on Nov 12, 2023</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Verified</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="text-sm mb-1">Police Clearance</h4>
                    <p className="text-xs text-gray-600">Valid until Dec 2025</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Verified</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="text-sm mb-1">Host Training</h4>
                    <p className="text-xs text-gray-600">Completed on Jan 5, 2024</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Completed</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="text-sm mb-1">Bank Account</h4>
                    <p className="text-xs text-gray-600">**** **** **** 1234</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Linked</span>
              </div>
            </div>
          </div>
        </div>

       
        <div className="space-y-6">
         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="text-green-600">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Acceptance Rate</span>
                  <span className="text-blue-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Profile Completeness</span>
                  <span className="text-purple-600">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Need Help?</h3>
            <button
              onClick={() => setShowContactSupport(true)}
              className="w-full flex items-center gap-2 justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <HelpCircle className="w-5 h-5" />
              Contact Support
            </button>
          </div>

        
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4>Safety Tips</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Never share sensitive information outside the platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Always verify guest identity before check-in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Report any suspicious activity immediately</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Edit Profile</h3>
              <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Full Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+880 1712-345678"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Location</label>
                <input
                  type="text"
                  defaultValue="Cox's Bazar, Bangladesh"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Languages</label>
                <input
                  type="text"
                  defaultValue="Bengali, English"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button className="w-full py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showEditBio && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Edit Bio</h3>
              <button onClick={() => setShowEditBio(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">About You</label>
                <textarea
                  defaultValue="Passionate local guide with 5+ years of experience showing travelers the best of Cox's Bazar. I love sharing my culture, cuisine, and the hidden gems of my hometown with visitors from around the world."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-2">Tell guests what makes you a great host (500 characters max)</p>
              </div>
              <button className="w-full py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 shadow-md">
                Update Bio
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showContactSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Contact Support</h3>
                <p className="text-blue-100 text-sm">We're here to help 24/7</p>
              </div>
              <button onClick={() => setShowContactSupport(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Subject</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Booking Issue</option>
                  <option>Payment Problem</option>
                  <option>Account Help</option>
                  <option>Technical Support</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Message</label>
                <textarea
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Attach File (Optional)</label>
                <input
                  type="file"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md">
                Submit Ticket
              </button>
              <p className="text-xs text-center text-gray-600">
                Average response time: 2-4 hours
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}