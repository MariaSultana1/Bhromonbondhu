// @ts-nocheck
//TransportBookingFlow.jsx - UPDATED with Database Integration
import React, { useState } from 'react';
import { BookTickets } from './BookTickets';
import { TicketSearchResults } from './TicketSearchResults';
import { SeatSelection } from './SeatSelection';
import { PassengerDetailsForm } from './PassengerDetailsForm';
import { BookingConfirmation } from './BookingConfirmation';
import { 
  searchTransport,
  bookTransport 
} from '../../services/transportApi.ts';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

export function TransportBookingFlow() {
  const [currentStep, setCurrentStep] = useState('search');
  const [searchParams, setSearchParams] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerInfo, setPassengerInfo] = useState(null);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Search for tickets
  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    setSearchParams(params);
    
    try {
      // Call the API to search for tickets (uses mock data from transportApi.ts)
      const results = await searchTransport(params);
      setTickets(results);
      setCurrentStep('results');
    } catch (error) {
      console.error('Search error:', error);
      // demo tickets ,API kajj na korle mock data generate kore show korbe
      const mockTickets = generateMockTickets(params);
      setTickets(mockTickets);
      setCurrentStep('results');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Select a ticket
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setCurrentStep('seats');
  };

  // Step 3: Confirm seat selection
  const handleSeatsConfirmed = (seats) => {
    setSelectedSeats(seats);
    setCurrentStep('passengers');
  };

  // Step 4: Confirm passenger details and save to database
  const handlePassengersConfirmed = async (
    passengers, 
    contactEmail, 
    contactPhone,
    paymentMethod,
    paymentDetails
  ) => {
    setPassengerInfo({ passengers, contactEmail, contactPhone });
    
    if (!selectedTicket) return;
    
    setLoading(true);
    
    try {
      const bookingDetails = {
        ticketId: selectedTicket.id,
        passengers,
        seats: selectedSeats,
        contactEmail,
        contactPhone
      };

      // Call booking API to get mock confirmation (from transportApi.ts)
      const confirmation = await bookTransport(bookingDetails);
      
      // ===== DATABASE INTEGRATION: Save to backend =====
      const token = getAuthToken();
      if (token) {
        try {
          const saveResponse = await fetch(`${API_URL}/transport-tickets/book`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              bookingId: confirmation.bookingId,
              pnr: confirmation.pnr,
              transportType: selectedTicket.transportType,
              provider: selectedTicket.provider,
              from: selectedTicket.from,
              to: selectedTicket.to,
              journeyDate: searchParams.date,
              departureTime: selectedTicket.departureTime,
              arrivalTime: selectedTicket.arrivalTime,
              duration: selectedTicket.duration,
              vehicleNumber: selectedTicket.vehicleNumber,
              trainNumber: selectedTicket.trainNumber,
              flightNumber: selectedTicket.flightNumber,
              passengers: passengers.map((p, idx) => ({
                firstName: p.firstName,
                lastName: p.lastName,
                age: p.age,
                gender: p.gender,
                nid: p.nid || '',
                passport: p.passport || '',
                seat: selectedSeats[idx],
                ticketNumber: confirmation.tickets[idx].ticketNumber,
                class: confirmation.tickets[idx].class
              })),
              contactEmail: contactEmail,
              contactPhone: contactPhone,
              totalAmount: selectedTicket.price * passengers.length,
              pricePerTicket: selectedTicket.price,
              paymentMethod: paymentMethod,
              paymentDetails: paymentDetails
            })
          });

          const saveData = await saveResponse.json();
          
          if (!saveData.success) {
            console.error('Failed to save booking to database:', saveData.message);
            // Show error but still proceed with booking confirmation
            setError('Booking confirmed but failed to save to your account. Please contact support with booking ID: ' + confirmation.bookingId);
          } else {
            console.log('✅ Booking saved to database:', saveData.booking);
          }
        } catch (dbError) {
          console.error('Database save error:', dbError);
          setError('Booking confirmed but failed to save to your account. Please contact support with booking ID: ' + confirmation.bookingId);
        }
      }
      // ===== END DATABASE INTEGRATION =====
      
      setBookingConfirmation(confirmation);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Booking error:', error);
      // For demo purposes, create mock confirmation
      const mockConfirmation = generateMockConfirmation(
        selectedTicket,
        passengers,
        selectedSeats
      );
      setBookingConfirmation(mockConfirmation);
      setCurrentStep('confirmation');
    } finally {
      setLoading(false);
    }
  };

  // Reset flow
  const handleReset = () => {
    setCurrentStep('search');
    setSearchParams(null);
    setTickets([]);
    setSelectedTicket(null);
    setSelectedSeats([]);
    setPassengerInfo(null);
    setBookingConfirmation(null);
    setError(null);
  };

  // Render current step
  return (
    <div className="min-h-screen">
      {currentStep === 'search' && (
        <BookTickets onSearch={handleSearch} />
      )}

      {currentStep === 'results' && searchParams && (
        <TicketSearchResults
          tickets={tickets}
          loading={loading}
          onSelectTicket={handleSelectTicket}
          searchParams={searchParams}
        />
      )}

      {currentStep === 'seats' && selectedTicket && searchParams && (
        <SeatSelection
          ticket={selectedTicket}
          passengersCount={searchParams.passengers}
          onConfirm={handleSeatsConfirmed}
          onCancel={() => setCurrentStep('results')}
        />
      )}

      {currentStep === 'passengers' && selectedTicket && (
        <PassengerDetailsForm
          ticket={selectedTicket}
          selectedSeats={selectedSeats}
          onConfirm={handlePassengersConfirmed}
          onBack={() => setCurrentStep('seats')}
          onCancel={() => setCurrentStep('results')}
        />
      )}

      {currentStep === 'confirmation' && bookingConfirmation && selectedTicket && (
        <BookingConfirmation
          booking={bookingConfirmation}
          ticket={selectedTicket}
          onClose={handleReset}
        />
      )}

      {loading && currentStep === 'search' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Searching for tickets...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait</p>
          </div>
        </div>
      )}

      {loading && currentStep === 'passengers' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Processing your booking...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your tickets</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 px-6 py-4 rounded-lg shadow-lg max-w-md">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to generate mock tickets when API is not available
function generateMockTickets(params) {
  const providers = {
    bus: ['BRTC', 'Shohagh Paribahan', 'Hanif Enterprise', 'Green Line', 'Ena Transport'],
    train: ['Bangladesh Railway'],
    flight: ['Biman Bangladesh Airlines', 'US-Bangla Airlines', 'Novoair']
  };

  const classes = {
    bus: ['AC', 'Non-AC', 'Sleeper', 'Business Class'],
    train: ['Shovan', 'Shovan Chair', 'Snigdha', 'AC Chair', 'AC Berth'],
    flight: ['Economy', 'Business Class']
  };

  const mockTickets = [];
  const providerList = providers[params.transportType];
  const classList = classes[params.transportType];

  providerList.forEach((provider, index) => {
    classList.forEach((cls, clsIndex) => {
      const basePrice = params.transportType === 'flight' ? 3000 : params.transportType === 'train' ? 500 : 800;
      const classMultiplier = clsIndex + 1;
      
      mockTickets.push({
        id: `${params.transportType}-${index}-${clsIndex}`,
        provider,
        providerLogo: `/images/providers/${provider.toLowerCase().replace(/\s+/g, '-')}-logo.png`,
        transportType: params.transportType,
        from: params.from,
        to: params.to,
        departureTime: `${8 + index * 2}:${(clsIndex * 15) % 60}:00`,
        arrivalTime: `${12 + index * 2}:${(clsIndex * 15) % 60}:00`,
        duration: `${4 + index}h ${(clsIndex * 15) % 60}m`,
        price: basePrice * classMultiplier,
        currency: 'BDT',
        class: cls,
        availableSeats: 20 + Math.floor(Math.random() * 30),
        amenities: ['WiFi', 'AC', 'Charging Point', 'Meal'],
        route: [params.from, 'Comilla', 'Feni', params.to],
        vehicleNumber: params.transportType === 'bus' ? `DM-${1000 + index}` : undefined,
        trainNumber: params.transportType === 'train' ? `${700 + index}` : undefined,
        flightNumber: params.transportType === 'flight' ? `BG${100 + index}` : undefined
      });
    });
  });

  return mockTickets;
}

// Helper function to generate mock booking confirmation
function generateMockConfirmation(
  ticket,
  passengers,
  seats
) {
  return {
    bookingId: `BKG${Date.now()}`,
    pnr: `${ticket.transportType.toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: 'confirmed',
    tickets: passengers.map((passenger, index) => ({
      ticketNumber: `TKT${Date.now()}-${index + 1}`,
      passengerName: `${passenger.firstName} ${passenger.lastName}`,
      seat: seats[index],
      class: ticket.class
    })),
    totalAmount: ticket.price * passengers.length,
    paymentStatus: 'Paid',
    downloadUrl: '#' // In production, this would be a real PDF URL
  };
}