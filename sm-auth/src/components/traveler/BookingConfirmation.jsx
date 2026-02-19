//BookingConfirmation.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, Calendar, Clock, Users, CreditCard, Plane, Bus, Train, Copy, Check } from 'lucide-react';

export function BookingConfirmation({ booking, ticket, onClose }) {
  const [copied, setCopied] = useState(false);

  // Save tickets to localStorage when booking is confirmed
  useEffect(() => {
    const savedTickets = localStorage.getItem('bhromonbondhu_tickets');
    const existingTickets = savedTickets ? JSON.parse(savedTickets) : [];
    
    // Create ticket entries for each passenger
    const newTickets = booking.tickets.map(t => ({
      bookingId: booking.bookingId,
      pnr: booking.pnr,
      transportType: ticket.transportType,
      provider: ticket.provider,
      from: ticket.from,
      to: ticket.to,
      date: new Date().toISOString().split('T')[0], // Today's date as journey date
      departureTime: ticket.departureTime,
      arrivalTime: ticket.arrivalTime,
      passengerName: t.passengerName,
      seat: t.seat,
      class: t.class || ticket.class,
      amount: ticket.price,
      status: 'upcoming',
      ticketNumber: t.ticketNumber,
      vehicleNumber: ticket.vehicleNumber,
      trainNumber: ticket.trainNumber,
      flightNumber: ticket.flightNumber
    }));

    const updatedTickets = [...newTickets, ...existingTickets];
    localStorage.setItem('bhromonbondhu_tickets', JSON.stringify(updatedTickets));
  }, [booking, ticket]);

  const handleDownloadTicket = () => {
    // In real implementation, this would download the PDF ticket
    window.open(booking.downloadUrl, '_blank');
  };

  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Travel Ticket',
        text: `Booking confirmed! ${ticket.from} to ${ticket.to} - PNR: ${booking.pnr}`,
        url: booking.downloadUrl
      }).catch((error) => {
        console.log('Share failed:', error);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const textToCopy = `Booking ID: ${booking.bookingId}\nPNR: ${booking.pnr}`;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fallback to legacy method
          fallbackCopyToClipboard(textToCopy);
        });
    } else {
      // Use fallback method
      fallbackCopyToClipboard(textToCopy);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert('Booking ID: ' + booking.bookingId + '\nPNR: ' + booking.pnr);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert('Booking ID: ' + booking.bookingId + '\nPNR: ' + booking.pnr);
    }
    
    document.body.removeChild(textArea);
  };

  const getTransportIcon = () => {
    switch (ticket.transportType) {
      case 'flight':
        return <Plane className="w-8 h-8" />;
      case 'train':
        return <Train className="w-8 h-8" />;
      default:
        return <Bus className="w-8 h-8" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl sm:max-w-3xl my-4 sm:my-8">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-t-xl text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-green-100 text-lg">
            Your tickets have been successfully booked
          </p>
        </div>

        <div className="p-4 sm:p-8">
          {/* PNR and Booking ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">Booking ID</p>
              <p className="text-xl font-bold text-blue-900">{booking.bookingId}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-700 mb-1">PNR Number</p>
              <p className="text-xl font-bold text-purple-900">{booking.pnr}</p>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className={`w-full mb-8 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              copied 
                ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Booking Details
              </>
            )}
          </button>

          {/* Journey Details */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                {getTransportIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{ticket.provider}</h3>
                <p className="text-gray-600 text-sm">
                  {ticket.vehicleNumber || ticket.trainNumber || ticket.flightNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">From</span>
                </div>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{ticket.from}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(`2000-01-01T${ticket.departureTime}`).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">To</span>
                </div>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{ticket.to}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(`2000-01-01T${ticket.arrivalTime}`).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
              </div>
            </div>
            
            {/* Journey Date */}
            <div className="flex items-center gap-2 text-gray-600 mt-4 pt-4 border-t border-gray-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Journey Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-lg text-gray-900">Passenger Details</h3>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {booking.tickets.map((passengerTicket, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-3 sm:p-4 rounded-lg gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{passengerTicket.passengerName}</p>
                    <p className="text-sm text-gray-600">Ticket: {passengerTicket.ticketNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">Seat {passengerTicket.seat}</p>
                    <p className="text-sm text-gray-600">{passengerTicket.class}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-lg text-gray-900">Payment Summary</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Total Amount</span>
                <span className="font-semibold">৳{(booking.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Payment Status</span>
                <span className="font-semibold text-green-600">{booking.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Booking Status</span>
                <span className="font-semibold text-green-600 capitalize">{booking.status}</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">Important Information</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Please arrive at the boarding point at least 30 minutes before departure</li>
              <li>• Carry a valid government-issued photo ID along with this ticket</li>
              <li>• Your tickets are now available in "My Tickets" section</li>
              <li>• For any queries, contact customer support with your PNR number</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg"
          >
            View My Tickets
          </button>
        </div>
      </div>
    </div>
  );
}