import { useState } from 'react';
import { CreditCard, Smartphone, Lock, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export function PaymentModal({ booking, onClose, onPaymentComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    bkashNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // 16 digits + 3 spaces
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    // Format bKash number
    if (name === 'bkashNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 11);
    }

    setFormData({ ...formData, [name]: formattedValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      // Card number validation (16 digits)
      const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardNumberClean)) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      // Cardholder name validation
      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }

      // Expiry date validation
      if (!formData.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
      } else {
        const [month, year] = formData.expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const today = new Date();
        if (expiry < today) {
          newErrors.expiryDate = 'Card has expired';
        }
      }

      // CVV validation
      if (!/^\d{3}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be 3 digits';
      }
    } else {
      // bKash validation
      if (!/^01[3-9]\d{8}$/.test(formData.bkashNumber)) {
        newErrors.bkashNumber = 'Invalid bKash number (must be 11 digits starting with 01)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      const paymentDetails = paymentMethod === 'card' ? {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardholderName: formData.cardholderName
      } : {
        bkashNumber: formData.bkashNumber
      };

      const response = await fetch(`${API_URL}/payments/process/${booking._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod,
          paymentDetails
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      if (data.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          onPaymentComplete(data);
          onClose();
        }, 2000);
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const calculateNights = () => {
    if (!booking.checkIn || !booking.checkOut) return 0;
    return Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Complete Payment</h3>
            <p className="text-green-100 text-sm">Your host has accepted your booking request</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {paymentSuccess ? (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h4 className="text-2xl font-bold mb-2">Payment Successful!</h4>
              <p className="text-gray-600">Your booking is now confirmed. Redirecting...</p>
            </div>
          ) : (
            <>
              {/* Booking Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host</span>
                    <span className="font-medium">{booking.hostId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{booking.hostId?.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-medium">{booking.guests}</span>
                  </div>
                  <div className="border-t border-blue-200 my-2 pt-2">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">৳{booking.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Platform fee</span>
                      <span className="text-gray-700">+ ৳{booking.platformFee?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-blue-200">
                      <span>Total</span>
                      <span className="text-green-600">৳{booking.grandTotal?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className={paymentMethod === 'card' ? 'text-green-700' : 'text-gray-600'}>Card</span>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('bkash')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'bkash' 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Smartphone className={`w-5 h-5 ${paymentMethod === 'bkash' ? 'text-pink-600' : 'text-gray-500'}`} />
                    <span className={paymentMethod === 'bkash' ? 'text-pink-700' : 'text-gray-600'}>bKash</span>
                  </div>
                </button>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {paymentMethod === 'card' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.cardNumber ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        placeholder="JOHN DOE"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.cardholderName ? 'border-red-300' : 'border-gray-200'
                        }`}
                      />
                      {errors.cardholderName && (
                        <p className="mt-1 text-xs text-red-600">{errors.cardholderName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.expiryDate ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.cvv ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">bKash Number</label>
                    <input
                      type="tel"
                      name="bkashNumber"
                      value={formData.bkashNumber}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.bkashNumber ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.bkashNumber && (
                      <p className="mt-1 text-xs text-red-600">{errors.bkashNumber}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      You'll receive a payment request on your bKash app
                    </p>
                  </div>
                )}

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                )}

                {/* Security Note */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay ৳{booking.grandTotal?.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}