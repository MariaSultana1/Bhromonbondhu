import { useState } from 'react';
import { Sparkles, MapPin, Calendar as CalendarIcon, AlertTriangle, Brain, TrendingUp, Cloud, DollarSign } from 'lucide-react';

const moodDestinations = [
  {
    mood: 'Adventure',
    destinations: [
      { name: 'Sajek Valley', match: 95, image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080' },
      { name: 'Bandarban', match: 92, image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080' }
    ]
  },
  {
    mood: 'Relaxation',
    destinations: [
      { name: 'Cox\'s Bazar', match: 98, image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080' },
      { name: 'Kuakata', match: 94, image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080' }
    ]
  }
];

const sampleItinerary = {
  destination: 'Cox\'s Bazar',
  duration: '3 days',
  budget: '৳15,000',
  days: [
    {
      day: 1,
      title: 'Arrival & Beach Sunset',
      activities: [
        { time: '2:00 PM', activity: 'Arrive and check-in with host', icon: 'home' },
        { time: '4:00 PM', activity: 'Visit Laboni Beach', icon: 'map' },
        { time: '6:00 PM', activity: 'Sunset watching at beach', icon: 'sun' },
        { time: '8:00 PM', activity: 'Dinner at local restaurant', icon: 'food' }
      ]
    },
    {
      day: 2,
      title: 'Exploration Day',
      activities: [
        { time: '8:00 AM', activity: 'Breakfast with host', icon: 'food' },
        { time: '10:00 AM', activity: 'Visit Himchari National Park', icon: 'map' },
        { time: '1:00 PM', activity: 'Lunch at local spot', icon: 'food' },
        { time: '3:00 PM', activity: 'Inani Beach visit', icon: 'beach' },
        { time: '7:00 PM', activity: 'Beach-side dinner', icon: 'food' }
      ]
    },
    {
      day: 3,
      title: 'Departure',
      activities: [
        { time: '9:00 AM', activity: 'Morning beach walk', icon: 'map' },
        { time: '11:00 AM', activity: 'Checkout and departure', icon: 'home' }
      ]
    }
  ]
};

const riskAnalysis = {
  overall: 'Low Risk',
  riskLevel: 25,
  factors: [
    { category: 'Weather', risk: 'Low', description: 'Clear skies expected, perfect travel conditions', icon: Cloud },
    { category: 'Health', risk: 'Low', description: 'No disease outbreaks in the area', icon: AlertTriangle },
    { category: 'Safety', risk: 'Low', description: 'Area has good security, verified host', icon: AlertTriangle },
    { category: 'Budget', risk: 'Medium', description: 'Season pricing slightly higher than usual', icon: DollarSign }
  ],
  recommendations: [
    'Carry mosquito repellent',
    'Book accommodations in advance',
    'Keep emergency contacts saved',
    'Purchase travel insurance'
  ]
};

export function TravelAI() {
  const [activeTool, setActiveTool] = useState('mood');
  const [selectedMood, setSelectedMood] = useState('Adventure');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl">Travel AI Assistant</h2>
        </div>
        <p>Powered by artificial intelligence to plan your perfect journey</p>
      </div>

     
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTool('mood')}
          className={`p-4 rounded-xl border-2 transition-all ${
            activeTool === 'mood'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <Brain className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="mb-1">Mood-Based Suggestions</h3>
          <p className="text-sm text-gray-600">Find destinations matching your vibe</p>
        </button>
        <button
          onClick={() => setActiveTool('itinerary')}
          className={`p-4 rounded-xl border-2 transition-all ${
            activeTool === 'itinerary'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <CalendarIcon className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="mb-1">Smart Itinerary</h3>
          <p className="text-sm text-gray-600">AI-generated travel plans</p>
        </button>
        <button
          onClick={() => setActiveTool('risk')}
          className={`p-4 rounded-xl border-2 transition-all ${
            activeTool === 'risk'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <AlertTriangle className="w-8 h-8 text-orange-500 mb-2" />
          <h3 className="mb-1">Risk Predictor</h3>
          <p className="text-sm text-gray-600">Real-time safety analysis</p>
        </button>
      </div>

  
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {activeTool === 'mood' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">What's your travel mood?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Adventure', 'Relaxation', 'Cultural', 'Nature'].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMood === mood
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {generating ? 'Analyzing your mood...' : 'Find Perfect Destinations'}
            </button>

            {moodDestinations
              .filter((m) => m.mood === selectedMood)
              .map((moodGroup) => (
                <div key={moodGroup.mood}>
                  <h4 className="mb-4">Top matches for {moodGroup.mood}</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {moodGroup.destinations.map((dest) => (
                      <div key={dest.name} className="relative group cursor-pointer rounded-xl overflow-hidden">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                          <h4 className="text-white mb-1">{dest.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/30 rounded-full h-2">
                              <div
                                className="bg-green-400 rounded-full h-2"
                                style={{ width: `${dest.match}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-sm">{dest.match}% match</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTool === 'itinerary' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Generate Smart Itinerary</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2">Destination</label>
                  <input
                    type="text"
                    placeholder="Where to?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Duration</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>2-3 days</option>
                    <option>4-5 days</option>
                    <option>1 week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Budget</label>
                  <input
                    type="text"
                    placeholder="৳10,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
              >
                Generate Itinerary
              </button>
            </div>

   
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="mb-1">{sampleItinerary.destination} Itinerary</h4>
                  <p className="text-sm text-gray-600">
                    {sampleItinerary.duration} • {sampleItinerary.budget}
                  </p>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Export
                </button>
              </div>

              <div className="space-y-6">
                {sampleItinerary.days.map((day) => (
                  <div key={day.day} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="mb-1">Day {day.day}: {day.title}</h4>
                    <div className="space-y-3 mt-3">
                      {day.activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">
                            {activity.time}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTool === 'risk' && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4">Travel Risk Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2">Destination</label>
                  <input
                    type="text"
                    placeholder="Enter destination"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Travel Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600"
              >
                Analyze Risk
              </button>
            </div>

            <div className="border-t pt-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4>Overall Risk Level</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      riskAnalysis.riskLevel < 40
                        ? 'bg-green-100 text-green-700'
                        : riskAnalysis.riskLevel < 70
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {riskAnalysis.overall}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      riskAnalysis.riskLevel < 40
                        ? 'bg-green-500'
                        : riskAnalysis.riskLevel < 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${riskAnalysis.riskLevel}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {riskAnalysis.factors.map((factor, index) => {
                  const Icon = factor.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm">{factor.category}</h4>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              factor.risk === 'Low'
                                ? 'bg-green-100 text-green-700'
                                : factor.risk === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {factor.risk}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="mb-3">Safety Recommendations</h4>
                <ul className="space-y-2">
                  {riskAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}