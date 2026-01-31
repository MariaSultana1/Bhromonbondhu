// hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem('token');

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/conversations/${conversationId}`);
      if (response.data.success) {
        setMessages(response.data.messages);
        // Mark as read
        await api.put(`/messages/read/${conversationId}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const sendMessage = useCallback(async (conversationId, content) => {
    try {
      const response = await api.post('/messages/send', {
        conversationId,
        content,
        type: 'text'
      });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [api]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    messages,
    selectedConversation,
    loading,
    error,
    setSelectedConversation,
    fetchMessages,
    sendMessage,
    fetchConversations
  };
};