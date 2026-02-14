//SeatSelection.jsx
import React, { useState } from 'react';
import { X, Check, User } from 'lucide-react';

export function SeatSelection({ ticket, passengersCount, onConfirm, onCancel }) {
  // Generate seat layout based on transport type
  const generateSeats = () => {
    if (ticket.transportType === 'bus') {
      // Standard bus layout: 2-2 configuration with 40 seats
      const seats = [];
      const rows = 10;
      const randomlyBookSeats = () => Math.random() > 0.7;
      
      for (let row = 0; row < rows; row++) {
        const rowSeats = [];
        // Left side
        rowSeats.push({
          number: `A${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `B${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        
        // Aisle (empty space)
        
        // Right side
        rowSeats.push({
          number: `C${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `D${row + 1}`,
          status: row < 2 ? 'female-reserved' : (randomlyBookSeats() ? 'booked' : 'available')
        });
        
        seats.push(rowSeats);
      }
      return seats;
    } else if (ticket.transportType === 'train') {
      // Train layout: 3-2 configuration with 50 seats
      const seats = [];
      const rows = 10;
      const randomlyBookSeats = () => Math.random() > 0.6;
      
      for (let row = 0; row < rows; row++) {
        const rowSeats = [];
        // Left side (3 seats)
        rowSeats.push({
          number: `A${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `B${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `C${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        
        // Right side (2 seats)
        rowSeats.push({
          number: `D${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `E${row + 1}`,
          status: row < 2 ? 'female-reserved' : (randomlyBookSeats() ? 'booked' : 'available')
        });
        
        seats.push(rowSeats);
      }
      return seats;
    } else {
      // Flight layout: 3-3 configuration with 60 seats
      const seats = [];
      const rows = 10;
      const randomlyBookSeats = () => Math.random() > 0.5;
      
      for (let row = 0; row < rows; row++) {
        const rowSeats = [];
        // Left side (3 seats)
        rowSeats.push({
          number: `A${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `B${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `C${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        
        // Right side (3 seats)
        rowSeats.push({
          number: `D${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `E${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        rowSeats.push({
          number: `F${row + 1}`,
          status: randomlyBookSeats() ? 'booked' : 'available'
        });
        
        seats.push(rowSeats);
      }
      return seats;
    }
  };

  const [seats, setSeats] = useState(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatClick = (rowIndex, seatIndex) => {
    const seat = seats[rowIndex][seatIndex];
    
    if (seat.status === 'booked') return;
    if (seat.status === 'female-reserved') {
      alert('This seat is reserved for female passengers');
      return;
    }

    const seatNumber = seat.number;
    
    if (selectedSeats.includes(seatNumber)) {
      // Deselect seat
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      const newSeats = [...seats];
      newSeats[rowIndex][seatIndex].status = 'available';
      setSeats(newSeats);
    } else {
      // Select seat
      if (selectedSeats.length >= passengersCount) {
        alert(`You can only select ${passengersCount} seat(s)`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
      const newSeats = [...seats];
      newSeats[rowIndex][seatIndex].status = 'selected';
      setSeats(newSeats);
    }
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300 cursor-pointer';
      case 'selected':
        return 'bg-blue-600 text-white border-blue-700 cursor-pointer';
      case 'booked':
        return 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed';
      case 'female-reserved':
        return 'bg-pink-100 text-pink-700 border-pink-300 cursor-pointer';
      default:
        return 'bg-gray-100';
    }
  };

  const totalPrice = selectedSeats.length * (ticket.price || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Seats</h2>
            <p className="text-gray-600 mt-1">
              {ticket.provider} • {ticket.from} → {ticket.to}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Selection Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 font-medium">
              Please select {passengersCount} seat{passengersCount > 1 ? 's' : ''} for your journey
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Selected: {selectedSeats.length} / {passengersCount}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 border-2 border-blue-700 rounded"></div>
              <span className="text-sm text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 border-2 border-gray-400 rounded"></div>
              <span className="text-sm text-gray-700">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-100 border-2 border-pink-300 rounded"></div>
              <span className="text-sm text-gray-700">Female Reserved</span>
            </div>
          </div>

          {/* Seat Layout */}
          <div className="mb-6">
            {/* Driver/Cockpit indicator */}
            <div className="flex justify-center mb-4">
              <div className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium">
                {ticket.transportType === 'flight' ? '✈️ Cockpit' : 
                 ticket.transportType === 'train' ? '🚂 Engine' : '🚌 Driver'}
              </div>
            </div>

            {/* Seats Grid */}
            <div className="bg-gray-50 rounded-lg p-6 inline-block mx-auto">
              <div className="space-y-3">
                {seats.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8">{rowIndex + 1}</span>
                    
                    <div className="flex gap-2">
                      {row.slice(0, ticket.transportType === 'flight' ? 3 : ticket.transportType === 'train' ? 3 : 2).map((seat, seatIndex) => (
                        <button
                          key={seat.number}
                          onClick={() => handleSeatClick(rowIndex, seatIndex)}
                          disabled={seat.status === 'booked'}
                          className={`w-12 h-12 rounded-lg border-2 font-medium text-sm transition-all ${getSeatColor(seat.status)} ${
                            seat.status === 'selected' ? 'scale-110 shadow-lg' : ''
                          }`}
                          title={seat.number}
                        >
                          {seat.status === 'selected' ? <Check className="w-5 h-5 mx-auto" /> : 
                           seat.status === 'booked' ? <X className="w-5 h-5 mx-auto" /> :
                           seat.status === 'female-reserved' ? <User className="w-5 h-5 mx-auto" /> :
                           seat.number.charAt(0)}
                        </button>
                      ))}
                    </div>

                    {/* Aisle */}
                    <div className="w-8"></div>

                    <div className="flex gap-2">
                      {row.slice(ticket.transportType === 'flight' ? 3 : ticket.transportType === 'train' ? 3 : 2).map((seat, seatIndex) => {
                        const actualIndex = seatIndex + (ticket.transportType === 'flight' ? 3 : ticket.transportType === 'train' ? 3 : 2);
                        return (
                          <button
                            key={seat.number}
                            onClick={() => handleSeatClick(rowIndex, actualIndex)}
                            disabled={seat.status === 'booked'}
                            className={`w-12 h-12 rounded-lg border-2 font-medium text-sm transition-all ${getSeatColor(seat.status)} ${
                              seat.status === 'selected' ? 'scale-110 shadow-lg' : ''
                            }`}
                            title={seat.number}
                          >
                            {seat.status === 'selected' ? <Check className="w-5 h-5 mx-auto" /> : 
                             seat.status === 'booked' ? <X className="w-5 h-5 mx-auto" /> :
                             seat.status === 'female-reserved' ? <User className="w-5 h-5 mx-auto" /> :
                             seat.number.charAt(0)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Seats Summary */}
          {selectedSeats.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Selected Seats</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(seat => (
                  <div key={seat} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {seat}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">Seat Price (×{selectedSeats.length})</span>
              <span className="text-xl font-bold text-gray-900">৳{(totalPrice || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedSeats.length !== passengersCount) {
                    alert(`Please select exactly ${passengersCount} seat(s)`);
                    return;
                  }
                  onConfirm(selectedSeats);
                }}
                disabled={selectedSeats.length !== passengersCount}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue to Passenger Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}