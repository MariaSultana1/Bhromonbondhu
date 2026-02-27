import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, MapPin, Clock, CheckCircle, AlertTriangle, Battery, Wifi, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Red marker for SOS
const sosIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjZGMyNjI2IiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDEuNCAwLjMgMi43IDAuOCAzLjlsMTEuNyAyMy42IDExLjctMjMuNmMwLjUtMS4yIDAuOC0yLjUgMC44LTMuOUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxOC4yYy0zLjIgMC01LjctMi42LTUuNy01LjdzMi42LTUuNyA1LjctNS43IDUuNyAyLjYgNS43IDUuN1MxNS43IDE4LjIgMTIuNSAxOC4yeiIvPjwvc3ZnPg==',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function SOSMonitor() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]);

  useEffect(() => {
    fetchActiveAlerts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActiveAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/admin/sos/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch alerts');

      const data = await response.json();
      setActiveAlerts(data.alerts || []);
      
      // Update map center if there are alerts
      if (data.alerts && data.alerts.length > 0) {
        setMapCenter([
          data.alerts[0].location.lat,
          data.alerts[0].location.lng
        ]);
      }
    } catch (err) {
      console.error('Error fetching SOS alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/sos/${selectedAlert._id}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resolutionNotes: resolutionNotes || 'Resolved by admin'
        })
      });

      if (!response.ok) throw new Error('Failed to resolve alert');

      // Remove from active alerts
      setActiveAlerts(prev => prev.filter(a => a._id !== selectedAlert._id));
      setShowResolveModal(false);
      setSelectedAlert(null);
      setResolutionNotes('');

    } catch (err) {
      console.error('Error resolving alert:', err);
      alert('Failed to resolve alert: ' + err.message);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <p className="ml-3 text-gray-600">Loading SOS alerts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SOS Emergency Monitor</h2>
          <p className="text-gray-600 mt-1">
            {activeAlerts.length} active emergency {activeAlerts.length === 1 ? 'alert' : 'alerts'}
          </p>
        </div>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">URGENT</span>
        </div>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-green-800 font-semibold text-lg">No Active SOS Alerts</p>
          <p className="text-green-600 mt-2">All travelers are safe</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alert List */}
          <div className="lg:col-span-1 space-y-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert._id}
                onClick={() => setSelectedAlert(alert)}
                className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${
                  selectedAlert?._id === alert._id
                    ? 'border-red-500 shadow-lg'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{alert.userName}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.userEmail}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(alert.createdAt)}</span>
                    </div>
                    {alert.tripInfo?.destination && (
                      <p className="text-xs text-gray-500 mt-1">
                        Destination: {alert.tripInfo.destination}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map and Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedAlert ? (
              <>
                {/* Map */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="h-[300px] rounded-lg overflow-hidden">
                    <MapContainer
                      center={[selectedAlert.location.lat, selectedAlert.location.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker 
                        position={[selectedAlert.location.lat, selectedAlert.location.lng]}
                        icon={sosIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <strong className="text-red-600">🚨 SOS Location</strong>
                            <p className="text-xs mt-1">{selectedAlert.userName}</p>
                            {selectedAlert.location.address && (
                              <p className="text-xs mt-1">{selectedAlert.location.address}</p>
                            )}
                            <p className="text-xs mt-1">
                              Accuracy: ±{Math.round(selectedAlert.location.accuracy)}m
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>

                {/* Alert Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Emergency Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{selectedAlert.userName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedAlert.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedAlert.userPhone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-sm">
                          Lat: {selectedAlert.location.lat.toFixed(6)}<br />
                          Lng: {selectedAlert.location.lng.toFixed(6)}
                        </p>
                        {selectedAlert.location.address && (
                          <p className="text-xs text-gray-600 mt-1">
                            {selectedAlert.location.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Alert Time</p>
                        <p className="font-medium">{formatTime(selectedAlert.createdAt)}</p>
                      </div>
                      {selectedAlert.tripInfo?.destination && (
                        <div>
                          <p className="text-sm text-gray-500">Destination</p>
                          <p className="font-medium">{selectedAlert.tripInfo.destination}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Device Status</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Battery className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{selectedAlert.deviceInfo?.battery?.level || '?'}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Wifi className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{selectedAlert.deviceInfo?.connection || '4g'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                    <a
                      href={`tel:${selectedAlert.userPhone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Call Traveler
                    </a>
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select an SOS alert to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Resolve SOS Alert</h3>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Marking this alert as resolved for {selectedAlert.userName}
            </p>

            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add resolution notes (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveAlert}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}