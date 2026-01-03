import { useState } from 'react';
import { MapPin, Navigation, AlertCircle, Phone, Trophy, Camera, MessageCircle, Clock, Battery, Wifi } from 'lucide-react';

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

  const handleSOS = () => {
    setSosActive(true);
    alert('SOS Activated! Emergency contacts have been notified and your location is being shared.');
  };

  return (
    <div className="space-y-6">
    
      <div>
        <h2 className="text-2xl mb-2">Live Journey</h2>
        <p className="text-gray-600">Track your trip in real-time</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
        
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

          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Real-Time Location</h3>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-600">Interactive map would display here</p>
                  <p className="text-sm text-gray-500">Showing route from Dhaka to Cox's Bazar</p>
                </div>
              </div>
              
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

       
        <div className="space-y-6">
         
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

         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message Host
              </button>
              <button className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" />
                Share Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
