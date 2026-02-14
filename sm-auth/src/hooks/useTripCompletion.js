import { useState, useEffect } from 'react';
import axios from 'axios';

export function useTripCompletion(tripId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch completion status
  const fetchCompletionStatus = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/trips/${tripId}/completion-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStatus(response.data);
      }
    } catch (err) {
      console.error('Error fetching completion status:', err);
      setError(err.response?.data?.message || 'Failed to fetch trip status');
    } finally {
      setLoading(false);
    }
  };

  // Complete the trip
  const completeTrip = async (rating = null, review = null, photos = []) => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/trips/${tripId}/complete`,
        {
          rating,
          review,
          photos
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStatus(prev => ({
          ...prev,
          status: 'completed',
          completedAt: new Date().toISOString()
        }));
        return response.data;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to complete trip';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Check if trip can be completed
  const canComplete = () => {
    return status?.canComplete === true;
  };

  // Check if trip is already completed
  const isCompleted = () => {
    return status?.status === 'completed';
  };

  // Get trip review if exists
  const getReview = () => {
    return status?.tripReview || null;
  };

  useEffect(() => {
    fetchCompletionStatus();
  }, [tripId]);

  return {
    status,
    loading,
    error,
    fetchCompletionStatus,
    completeTrip,
    canComplete,
    isCompleted,
    getReview
  };
}
