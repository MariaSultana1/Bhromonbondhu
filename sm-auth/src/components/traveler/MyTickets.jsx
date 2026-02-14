// @ts-nocheck
// MyTickets.jsx - UPDATED to fetch from database
import { useState, useEffect } from 'react';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Download,
  Filter,
  Search,
  Bus,
  Train,
  Plane,
  QrCode,
  User,
  CreditCard,
  Loader
} from 'lucide-react';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to download ticket as HTML
const downloadTicket = (ticket) => {
  const ticketHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ticket - ${ticket.pnr}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          background: #f5f5f5;
        }
        .ticket-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .ticket-header {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .ticket-header h1 { font-size: 28px; margin-bottom: 10px; }
        .ticket-header p { font-size: 14px; opacity: 0.9; }
        .ticket-body {
          padding: 30px;
        }
        .ticket-section {
          margin-bottom: 25px;
          padding-bottom: 25px;
          border-bottom: 2px dashed #e5e7eb;
        }
        .ticket-section:last-child { border-bottom: none; }
        .ticket-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        .ticket-label {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        .ticket-value {
          color: #111827;
          font-size: 16px;
          font-weight: 600;
        }
        .route-display {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 25px;
          background: #f9fafb;
          border-radius: 12px;
          margin: 20px 0;
        }
        .route-location {
          text-align: center;
        }
        .route-location .time {
          font-size: 32px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 8px;
        }
        .route-location .city {
          font-size: 16px;
          color: #6b7280;
        }
        .route-arrow {
          font-size: 24px;
          color: #9ca3af;
        }
        .pnr-box {
          background: #fef3c7;
          border: 2px solid #fbbf24;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .pnr-box .label {
          font-size: 14px;
          color: #92400e;
          margin-bottom: 8px;
        }
        .pnr-box .value {
          font-size: 28px;
          font-weight: bold;
          color: #92400e;
          letter-spacing: 3px;
        }
        .transport-badge {
          display: inline-block;
          padding: 8px 16px;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background: #f9fafb;
          color: #6b7280;
          font-size: 12px;
        }
        .print-button {
          display: block;
          margin: 20px auto;
          padding: 12px 30px;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        }
        .print-button:hover {
          background: #2563EB;
        }
        @media print {
          body { padding: 0; background: white; }
          .print-button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="ticket-header">
          <h1>🎫 Bhromonbondhu</h1>
          <p>Your Travel Companion</p>
        </div>
        
        <div class="ticket-body">
          <div class="ticket-section">
            <div class="ticket-row">
              <div>
                <div class="ticket-label">Transport Type</div>
                <span class="transport-badge">${ticket.transportType}</span>
              </div>
              <div style="text-align: right;">
                <div class="ticket-label">Booking ID</div>
                <div class="ticket-value">${ticket.bookingId}</div>
              </div>
            </div>
          </div>

          <div class="pnr-box">
            <div class="label">PNR Number</div>
            <div class="value">${ticket.pnr}</div>
          </div>

          <div class="route-display">
            <div class="route-location">
              <div class="time">${ticket.departureTime}</div>
              <div class="city">${ticket.from}</div>
            </div>
            <div class="route-arrow">→</div>
            <div class="route-location">
              <div class="time">${ticket.arrivalTime}</div>
              <div class="city">${ticket.to}</div>
            </div>
          </div>

          <div class="ticket-section">
            <h3 style="margin-bottom: 15px; color: #111827;">Journey Details</h3>
            <div class="ticket-row">
              <div class="ticket-label">Operator</div>
              <div class="ticket-value">${ticket.provider}</div>
            </div>
            <div class="ticket-row">
              <div class="ticket-label">Date of Journey</div>
              <div class="ticket-value">${new Date(ticket.journeyDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
            ${ticket.vehicleNumber ? `<div class="ticket-row"><div class="ticket-label">Vehicle Number</div><div class="ticket-value">${ticket.vehicleNumber}</div></div>` : ''}
            ${ticket.trainNumber ? `<div class="ticket-row"><div class="ticket-label">Train Number</div><div class="ticket-value">${ticket.trainNumber}</div></div>` : ''}
            ${ticket.flightNumber ? `<div class="ticket-row"><div class="ticket-label">Flight Number</div><div class="ticket-value">${ticket.flightNumber}</div></div>` : ''}
          </div>

          <div class="ticket-section">
            <h3 style="margin-bottom: 15px; color: #111827;">Passenger Information</h3>
            ${ticket.passengers.map(p => `
              <div class="ticket-row">
                <div class="ticket-label">${p.firstName} ${p.lastName}</div>
                <div class="ticket-value">Seat ${p.seat} | ${p.class || 'Standard'}</div>
              </div>
            `).join('')}
          </div>

          <div class="ticket-section" style="border-bottom: none;">
            <div class="ticket-row">
              <div class="ticket-label">Total Amount Paid</div>
              <div class="ticket-value" style="color: #16a34a; font-size: 24px;">৳${(ticket.amount || ticket.totalAmount || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p style="margin-top: 8px;">Please carry a valid ID along with this ticket during your journey.</p>
        </div>
      </div>

      <button class="print-button" onclick="window.print()">Print Ticket</button>

      <script>
        // Auto-print on load
        window.onload = function() {
          setTimeout(() => window.print(), 500);
        };
      </script>
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([ticketHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ticket_${ticket.pnr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tickets from database
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const token = getAuthToken();
    
    if (!token) {
      // If no token, try to load from localStorage (fallback)
      const savedTickets = localStorage.getItem('bhromonbondhu_tickets');
      if (savedTickets) {
        setTickets(JSON.parse(savedTickets));
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/transport-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch tickets');
      }

      // Transform database tickets to match component format
      const transformedTickets = data.tickets.map(ticket => ({
        bookingId: ticket.bookingId,
        pnr: ticket.pnr,
        transportType: ticket.transportType,
        provider: ticket.provider,
        from: ticket.from,
        to: ticket.to,
        date: ticket.journeyDate,
        departureTime: ticket.departureTime,
        arrivalTime: ticket.arrivalTime,
        duration: ticket.duration,
        passengerName: ticket.passengers[0] ? `${ticket.passengers[0].firstName} ${ticket.passengers[0].lastName}` : 'N/A',
        passengers: ticket.passengers,
        seat: ticket.passengers[0]?.seat || 'N/A',
        class: ticket.passengers[0]?.class || 'Standard',
        amount: ticket.totalAmount,
        status: ticket.status,
        ticketNumber: ticket.passengers[0]?.ticketNumber || 'N/A',
        vehicleNumber: ticket.vehicleNumber,
        trainNumber: ticket.trainNumber,
        flightNumber: ticket.flightNumber,
        journeyDate: ticket.journeyDate
      }));

      setTickets(transformedTickets);

      // Also save to localStorage as backup
      localStorage.setItem('bhromonbondhu_tickets', JSON.stringify(transformedTickets));

    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
      
      // Fallback to localStorage
      const savedTickets = localStorage.getItem('bhromonbondhu_tickets');
      if (savedTickets) {
        setTickets(JSON.parse(savedTickets));
      }
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (type) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'train':
        return <Train className="w-5 h-5" />;
      default:
        return <Bus className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'upcoming':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = 
      ticket.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const upcomingCount = tickets.filter(t => t.status === 'confirmed' || t.status === 'upcoming').length;
  const completedCount = tickets.filter(t => t.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading your tickets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-400 rounded-2xl p-8 text-white">
        <h2 className="text-2xl mb-2">My Tickets</h2>
        <p className="text-blue-100">Manage and view all your booked tickets</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-yellow-800">
          <p className="font-medium">⚠️ Could not fetch latest tickets from server</p>
          <p className="text-sm mt-1">Showing cached tickets. {error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-green-500">
          <p className="text-gray-600 text-sm mb-1">Upcoming Trips</p>
          <p className="text-3xl font-bold text-gray-900">{upcomingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-500">
          <p className="text-gray-600 text-sm mb-1">Completed Trips</p>
          <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-purple-500">
          <p className="text-gray-600 text-sm mb-1">Total Tickets</p>
          <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by PNR, destination, or provider..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search' : 'Book your first ticket to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTickets.map((ticket) => (
            <div
              key={`${ticket.bookingId}-${ticket.ticketNumber}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden"
            >
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      {getTransportIcon(ticket.transportType)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{ticket.provider}</h3>
                      <p className="text-sm text-gray-600">
                        {ticket.vehicleNumber || ticket.trainNumber || ticket.flightNumber}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(ticket.status)}`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>

                {/* Route Display */}
                <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{ticket.departureTime}</p>
                    <p className="text-gray-600 font-medium">{ticket.from}</p>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <div className="w-24 h-0.5 bg-gray-300 mb-1"></div>
                    <p className="text-xs text-gray-500 uppercase">Journey</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{ticket.arrivalTime}</p>
                    <p className="text-gray-600 font-medium">{ticket.to}</p>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* PNR & Booking ID */}
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-xs text-yellow-700 mb-1">PNR Number</p>
                      <p className="text-xl font-bold text-yellow-900 tracking-wide">{ticket.pnr}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-xs text-blue-700 mb-1">Booking ID</p>
                      <p className="text-lg font-bold text-blue-900">{ticket.bookingId}</p>
                    </div>
                  </div>

                  {/* Passenger Info */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Passenger Name</p>
                        <p className="font-semibold text-gray-900">{ticket.passengerName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Ticket Number</p>
                        <p className="font-semibold text-gray-900">{ticket.ticketNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journey Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Journey Date</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {new Date(ticket.journeyDate || ticket.date).toLocaleDateString('en-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Ticket className="w-4 h-4" />
                      <span className="text-sm">Seat</span>
                    </div>
                    <p className="font-semibold text-gray-900">{ticket.seat}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">Class</span>
                    </div>
                    <p className="font-semibold text-gray-900">{ticket.class}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">Amount</span>
                    </div>
                    <p className="font-bold text-xl text-green-600">৳{(ticket.amount || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => downloadTicket(ticket)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Ticket
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}