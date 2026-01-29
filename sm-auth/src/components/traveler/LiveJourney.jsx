import { useState } from 'react';
import { MapPin, Navigation, AlertCircle, Phone, Trophy, Camera, MessageCircle, Clock, Battery, Wifi, X, Send, Image, MapPinned } from 'lucide-react';

const currentJourney = {
  destination: 'Cox\'s Bazar',
  host: 'Fatima Khan',
  startTime: '8:00 AM',
  estimatedArrival: '2:30 PM',
  progress: 65
};

const checkpoints = [
  { name: 'Dhaka - Start', time: '8:00 AM', completed: true },
  { name: 'Comilla', time: '10:30 AM', completed: true },
  { name: 'Feni', time: '12:00 PM', completed: true },
  { name: 'Chittagong', time: '1:15 PM', completed: false, current: true },
  { name: 'Cox\'s Bazar - End', time: '2:30 PM', completed: false }
];

const emergencyContacts = [
  { name: 'Local Police', number: '999', type: 'police' },
  { name: 'Emergency Helpline', number: '102', type: 'emergency' },
  { name: 'Platform Support', number: '+880 1XXX-XXXXXX', type: 'support' }
];

const aiChallenges = [
  {
    id: 1,
    title: 'Learn a Local Phrase',
    description: 'Say "আপনার নাম কী?" (What is your name?) to a local',
    points: 50,
    completed: false
  },
  {
    id: 2,
    title: 'Capture the Moment',
    description: 'Take a photo of a local landmark',
    points: 30,
    completed: true
  },
  {
    id: 3,
    title: 'Try Local Cuisine',
    description: 'Share a photo of your meal',
    points: 40,
    completed: false
  }
];

export function LiveJourney() {
  const [sosActive, setSosActive] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showMessageHost, setShowMessageHost] = useState(false);
  const [showShareUpdate, setShowShareUpdate] = useState(false);

  const handleSOS = () => {
    setSosActive(true);
    // In a real app, this would trigger emergency protocols
    alert('SOS Activated! Emergency contacts have been notified and your location is being shared.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Live Journey</h2>
        <p className="text-gray-600">Track your trip in real-time</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Journey Status */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl mb-1">Journey to {currentJourney.destination}</h3>
                <p className="text-white/90 text-sm">Host: {currentJourney.host}</p>
              </div>
              <Navigation className="w-8 h-8" />
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{currentJourney.progress}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${currentJourney.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Started: {currentJourney.startTime}</span>
              <span>ETA: {currentJourney.estimatedArrival}</span>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Real-Time Location</h3>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              {/* Mock map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-600">Interactive map would display here</p>
                  <p className="text-sm text-gray-500">Showing route from Dhaka to Cox's Bazar</p>
                </div>
              </div>
              {/* Mock route markers */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Location Active</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>3h 15m remaining</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Navigation className="w-4 h-4" />
                <span>142 km remaining</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Wifi className="w-4 h-4" />
                <span>Good signal</span>
              </div>
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Journey Timeline</h3>
            <div className="space-y-4">
              {checkpoints.map((checkpoint, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        checkpoint.completed
                          ? 'bg-green-500'
                          : checkpoint.current
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-gray-300'
                      }`}
                    ></div>
                    {index < checkpoints.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          checkpoint.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className={checkpoint.current ? 'text-blue-600' : ''}>
                      {checkpoint.name}
                    </h4>
                    <p className="text-sm text-gray-500">{checkpoint.time}</p>
                    {checkpoint.current && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                        Current Location
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Challenges */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3>AI Micro-Challenges</h3>
              </div>
              <button
                onClick={() => setShowChallenges(!showChallenges)}
                className="text-sm text-blue-500 hover:underline"
              >
                {showChallenges ? 'Hide' : 'Show All'}
              </button>
            </div>
            {showChallenges && (
              <div className="space-y-3">
                {aiChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-4 border rounded-lg ${
                      challenge.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm mb-1">{challenge.title}</h4>
                        <p className="text-xs text-gray-600">{challenge.description}</p>
                      </div>
                      <span className="text-sm text-yellow-600 ml-2">+{challenge.points} pts</span>
                    </div>
                    {!challenge.completed && (
                      <button className="w-full mt-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        Complete Challenge
                      </button>
                    )}
                    {challenge.completed && (
                      <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                        <Trophy className="w-4 h-4" />
                        <span>Completed!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Complete challenges to earn points and unlock special rewards!
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SOS Button */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-center">Emergency SOS</h3>
            <button
              onClick={handleSOS}
              disabled={sosActive}
              className={`w-full h-32 rounded-xl flex flex-col items-center justify-center transition-all ${
                sosActive
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white active:scale-95'
              }`}
            >
              <AlertCircle className="w-12 h-12 mb-2" />
              <span className="text-xl">{sosActive ? 'SOS Active' : 'Press for SOS'}</span>
            </button>
            {sosActive && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ✓ Emergency contacts notified
                  <br />
                  ✓ Location being shared
                  <br />
                  ✓ Support team alerted
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-3">
              Press only in case of emergency
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-blue-500" />
              <h3>Emergency Contacts</h3>
            </div>
            <div className="space-y-2">
              {emergencyContacts.map((contact, index) => (
                <a
                  key={index}
                  href={`tel:${contact.number}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>{contact.name}</div>
                  <div className="text-sm text-blue-600">{contact.number}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Device Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Device Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Battery</span>
                </div>
                <span className="text-sm">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Connection</span>
                </div>
                <span className="text-sm text-green-600">Strong</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">GPS</span>
                </div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => setShowMessageHost(!showMessageHost)}
              >
                <MessageCircle className="w-4 h-4" />
                Message Host
              </button>
              <button
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => setShowShareUpdate(!showShareUpdate)}
              >
                <Camera className="w-4 h-4" />
                Share Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Host Modal */}
      {showMessageHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Message {currentJourney.host}</h3>
                <p className="text-blue-100 text-sm">Send an update to your host</p>
              </div>
              <button onClick={() => setShowMessageHost(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Host Info */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  {currentJourney.host.charAt(0)}
                </div>
                <div>
                  <div className="mb-1">{currentJourney.host}</div>
                  <div className="text-sm text-gray-600">{currentJourney.destination}</div>
                </div>
              </div>

              {/* Quick Messages */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Quick Messages</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    ✅ I'm on my way
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    🚗 Slight delay
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    📍 Just passed checkpoint
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    ⏰ Arriving soon
                  </button>
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Custom Message</label>
                <textarea
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageHost(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowMessageHost(false);
                    alert('Message sent to ' + currentJourney.host);
                  }}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Update Modal */}
      {showShareUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Share Journey Update</h3>
                <p className="text-purple-100 text-sm">Share your experience with others</p>
              </div>
              <button onClick={() => setShowShareUpdate(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Current Location */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinned className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Current Location</span>
                </div>
                <div className="text-purple-900">Chittagong, Bangladesh</div>
                <div className="text-sm text-purple-700 mt-1">{currentJourney.progress}% of journey complete</div>
              </div>

              {/* Upload Photo */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Add Photos (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload photos</p>
                  <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                </div>
              </div>

              {/* Update Text */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">What's happening?</label>
                <textarea
                  placeholder="Share your journey experience..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Share with</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="visibility" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Host Only</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="visibility" className="w-4 h-4" />
                    <span className="text-sm">Public</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareUpdate(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowShareUpdate(false);
                    alert('Update shared successfully!');
                  }}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Share Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}