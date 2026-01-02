import React, { useState } from "react";
import { CheckCircle, AlertCircle, Shield, Camera, Edit, Phone, Mail, MapPin, Languages, Award } from 'lucide-react';

export function HostProfile({ user }) {
  const [autoAccept, setAutoAccept] = useState(false);
  const [notifications, setNotifications] = useState({
    booking: true,
    message: true,
    review: true
  });

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
                <img src="./images/man 3.png" alt={user.name} className="w-24 h-24 rounded-full" />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl">{user.name}</h3>
                  {user.verified && <CheckCircle className="w-5 h-5 text-green-500" title="Verified Host" />}
                </div>
                <p className="text-gray-600 mb-1">{user.email}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Superhost</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="border-t pt-6 mb-6">
              <h4 className="mb-3">About Me</h4>
              <p className="text-sm text-gray-700 mb-3">
                Passionate local guide with 5+ years of experience showing travelers the best of Cox's Bazar. 
                I love sharing my culture, cuisine, and the hidden gems of my hometown with visitors from around the world.
              </p>
              <button className="text-sm text-blue-500 hover:underline">Edit Bio</button>
            </div>

            {/* Contact Information */}
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
                    <span className="text-sm">{user.phone || '+880 1XXX-XXXXXX'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{user.location || "Cox's Bazar, Bangladesh"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Languages</label>
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{user.languages || "Bengali, English, Hindi"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Requirements */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Verification Requirements</h3>
            <div className="space-y-4">
              {[
                { title: "Identity Verification", desc: "National ID card verified and approved", date: "Jan 15, 2024" },
                { title: "Police Background Check", desc: "Clean record verified by local authorities", date: "Jan 20, 2024" },
                { title: "Host Training", desc: "Completed platform safety and hospitality training", date: "Jan 25, 2024" },
                { title: "Bank Account Verification", desc: "Bank details verified for payouts", date: "Jan 28, 2024" }
              ].map((v) => (
                <div key={v.title} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-sm mb-1">{v.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{v.desc}</p>
                    <span className="text-xs text-green-600">Completed on {v.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings / Preferences */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Notification Settings</label>
                <div className="space-y-2">
                  {[
                    { id: "booking", label: "New booking notifications" },
                    { id: "message", label: "Message notifications" },
                    { id: "review", label: "Review notifications" }
                  ].map((n) => (
                    <div key={n.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notifications[n.id]}
                        onChange={() =>
                          setNotifications({ ...notifications, [n.id]: !notifications[n.id] })
                        }
                        className="w-4 h-4"
                      />
                      <label className="text-sm">{n.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Auto-Accept Bookings</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autoAccept}
                    onChange={() => setAutoAccept(!autoAccept)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  <span className="ml-3 text-sm text-gray-600">Automatically accept qualifying bookings</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-500" />
              <h3>Verification Status</h3>
            </div>
            {["Identity", "Police Check", "Training", "Bank Details"].map((v) => (
              <div key={v} className="flex items-center justify-between mb-1">
                <span className="text-sm">{v}</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">✓ All verifications complete! You're a trusted host.</p>
            </div>
          </div>

          {/* Host Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Host Performance</h3>
            {[
              { label: "Overall Rating", value: "4.9/5.0", color: "text-yellow-600" },
              { label: "Total Guests", value: "124", color: "text-blue-600" },
              { label: "Response Rate", value: "98%", color: "text-green-600" },
              { label: "Member Since", value: "Jan 2024", color: "text-gray-600" }
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{s.label}</span>
                <span className={`text-lg ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Host Badges */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Host Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🏆", label: "Superhost", bg: "bg-yellow-50" },
                { icon: "⭐", label: "Top Rated", bg: "bg-blue-50" },
                { icon: "✓", label: "Verified", bg: "bg-green-50" },
                { icon: "💬", label: "Quick Responder", bg: "bg-purple-50" }
              ].map((b) => (
                <div key={b.label} className={`text-center p-3 ${b.bg} rounded-lg`}>
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <p className="text-xs">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="mb-3">Need Help?</h4>
            <p className="text-sm text-gray-700 mb-3">
              Our host support team is available 24/7 to assist you.
            </p>
            <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
