// PaymentSimulation.jsx - UPDATED to return payment details
import React, { useState } from 'react';
import { CreditCard, Smartphone, X, Lock, CheckCircle } from 'lucide-react';

export function PaymentSimulation({ totalAmount, onPaymentSuccess, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Card payment form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // bKash payment form
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashPin, setBkashPin] = useState('');

  const handlePayment = (e) => {
    e.preventDefault();
    
    // Validation
    if (paymentMethod === 'card') {
      // Validate card number (16 digits)
      const cleanedCard = cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(cleanedCard)) {
        alert('Card number must be exactly 16 digits');
        return;
      }

      // Validate cardholder name
      if (!cardName.trim()) {
        alert('Please enter cardholder name');
        return;
      }

      // Validate expiry date (MM/YY format)
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        alert('Expiry date must be in MM/YY format');
        return;
      }

      // Check if card is expired
      const [month, year] = expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        alert('Card has expired');
        return;
      }

      // Validate CVV (3 digits)
      if (!/^\d{3}$/.test(cvv)) {
        alert('CVV must be exactly 3 digits');
        return;
      }
    } else if (paymentMethod === 'bkash') {
      // Validate bKash number (11 digits starting with 01)
      if (!/^01[3-9]\d{8}$/.test(bkashNumber)) {
        alert('bKash number must be 11 digits starting with 01');
        return;
      }

      // Validate PIN (5 digits)
      if (!/^\d{5}$/.test(bkashPin)) {
        alert('bKash PIN must be exactly 5 digits');
        return;
      }
    }
    
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      // Wait a bit to show success message
      setTimeout(() => {
        // Return payment details to parent
        const paymentDetails = {};
        if (paymentMethod === 'card') {
          paymentDetails.cardNumber = cardNumber;
          paymentDetails.cardholderName = cardName;
          paymentDetails.expiryDate = expiryDate;
          // Note: CVV is validated but NOT passed to backend for security
        } else if (paymentMethod === 'bkash') {
          paymentDetails.bkashNumber = bkashNumber;
          // Note: PIN is validated but NOT passed to backend for security
        }
        
        onPaymentSuccess(paymentMethod, paymentDetails);
      }, 1500);
    }, 2000);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">৳{totalAmount.toLocaleString()} paid via {paymentMethod === 'card' ? 'Card' : 'bKash'}</p>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we process your payment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-xl flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold mb-1">Complete Payment</h2>
            <p className="text-blue-100">Total Amount: ৳{totalAmount.toLocaleString()}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Method Selector */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className={`font-medium text-sm ${paymentMethod === 'card' ? 'text-blue-900' : 'text-gray-700'}`}>
                Card Payment
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bkash')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'bkash'
                  ? 'border-pink-600 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'bkash' ? 'text-pink-600' : 'text-gray-400'}`} />
              <p className={`font-medium text-sm ${paymentMethod === 'bkash' ? 'text-pink-900' : 'text-gray-700'}`}>
                bKash
              </p>
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handlePayment} className="space-y-4">
            {paymentMethod === 'card' ? (
              <>
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                      setCardNumber(formatted);
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be 16 digits</p>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
                        setExpiryDate(formatted);
                      }}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: MM/YY</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">3 digits</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* bKash Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    bKash Account Number *
                  </label>
                  <input
                    type="tel"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                    maxLength="11"
                  />
                  <p className="text-xs text-gray-500 mt-1">11 digits starting with 01</p>
                </div>

                {/* bKash PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    bKash PIN *
                  </label>
                  <input
                    type="password"
                    value={bkashPin}
                    onChange={(e) => setBkashPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Enter your PIN"
                    maxLength={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">5 digits</p>
                </div>

                {/* bKash Info */}
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl">
                  <p className="text-sm text-pink-900">
                    <strong>Note:</strong> This is a demo payment. In production, you'll be redirected to bKash's secure payment gateway.
                  </p>
                </div>
              </>
            )}

            {/* Security Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">Secure Payment</p>
                <p className="text-xs text-gray-600">
                  Your payment information is encrypted and secure. Only last 4 digits of card will be stored.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-6 bg-white rounded-b-xl flex-shrink-0">
          <button
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Lock className="w-5 h-5" />
            Pay ৳{totalAmount.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}