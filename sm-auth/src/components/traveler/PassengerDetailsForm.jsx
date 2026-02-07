// @ts-nocheck
//PassengerDetailsForm.jsx - UPDATED to pass payment details
import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard, Calendar, X } from 'lucide-react';
import { PaymentSimulation } from './PaymentSimulation';

export function PassengerDetailsForm({ 
  ticket, 
  selectedSeats, 
  onConfirm, 
  onBack,
  onCancel 
}) {
  const [passengers, setPassengers] = useState(
    selectedSeats.map((seat, index) => ({
      firstName: '',
      lastName: '',
      age: 25,
      gender: 'male',
      nid: '',
      passport: ''
    }))
  );

  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = {
      ...newPassengers[index],
      [field]: value
    };
    setPassengers(newPassengers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      if (!passenger.firstName || !passenger.lastName) {
        alert(`Please fill in all details for passenger ${i + 1}`);
        return;
      }
      
      // For flights, passport is required for international routes
      if (ticket.transportType === 'flight' && !passenger.nid && !passenger.passport) {
        alert(`Please provide NID or Passport for passenger ${i + 1}`);
        return;
      }
    }

    if (!contactEmail || !contactPhone) {
      alert('Please provide contact email and phone number');
      return;
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(contactEmail)) {
      alert('Please provide a valid email address');
      return;
    }

    // Validate phone format (11 digits starting with 01)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(contactPhone)) {
      alert('Please provide a valid 11-digit phone number starting with 01');
      return;
    }

    // Show payment modal
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentMethod, paymentDetails) => {
    setShowPayment(false);
    // Pass payment details to parent along with passenger info
    onConfirm(passengers, contactEmail, contactPhone, paymentMethod, paymentDetails);
  };

  const totalAmount = ticket.price * passengers.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed at top */}
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Passenger Details</h2>
            <p className="text-gray-600 mt-1">
              {ticket.provider} • {ticket.from} → {ticket.to}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close form"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Selected Seats Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Selected Seats</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(seat => (
                  <div key={seat} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {seat}
                  </div>
                ))}
              </div>
            </div>

            {/* Passenger Forms */}
            <div className="space-y-6 mb-6">
              {passengers.map((passenger, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg text-gray-900">
                      Passenger {index + 1} - Seat {selectedSeats[index]}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor={`firstName-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        id={`firstName-${index}`}
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor={`lastName-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        id={`lastName-${index}`}
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter last name"
                        required
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label htmlFor={`age-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Age *
                      </label>
                      <input
                        id={`age-${index}`}
                        type="number"
                        min="0"
                        max="120"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label htmlFor={`gender-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        id={`gender-${index}`}
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* NID */}
                    <div>
                      <label htmlFor={`nid-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                        NID Number {ticket.transportType === 'flight' ? '(if no passport) *' : '(10/13/17 digits)'}
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id={`nid-${index}`}
                          type="text"
                          value={passenger.nid}
                          onChange={(e) => handlePassengerChange(index, 'nid', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter NID number"
                          maxLength="17"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Must be 10, 13, or 17 digits</p>
                    </div>

                    {/* Passport (for flights) */}
                    {ticket.transportType === 'flight' && (
                      <div>
                        <label htmlFor={`passport-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Passport Number (if no NID) *
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            id={`passport-${index}`}
                            type="text"
                            value={passenger.passport}
                            onChange={(e) => handlePassengerChange(index, 'passport', e.target.value.toUpperCase())}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                            placeholder="AB1234567"
                            maxLength="9"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Format: 2 letters + 7 digits (e.g., AB1234567)</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Contact Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                We'll send booking confirmation and ticket details to these contacts
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="contact-phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="01XXXXXXXXX"
                      required
                      maxLength="11"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">11 digits starting with 01</p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">Important Notice</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Please ensure all passenger details match their government-issued ID</li>
                <li>• Incorrect information may result in boarding denial</li>
                <li>• {ticket.transportType === 'flight' ? 'Passport required for international flights' : 'NID card must be carried during travel'}</li>
                <li>• Phone number must be 11 digits starting with 01</li>
                <li>• NID must be 10, 13, or 17 digits</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="border-t border-gray-200 p-6 bg-white rounded-b-xl flex-shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Seat Selection
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showPayment && (
        <PaymentSimulation
          totalAmount={totalAmount}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}