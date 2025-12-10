# Frontend-Backend Integration Guide

This guide explains how to integrate the frontend wedding invitation app with the backend API.

## API Integration Overview

The frontend communicates with the backend through RESTful API calls. All endpoints return JSON responses and use standard HTTP status codes.

## Authentication

### Login/Register Flow

```javascript
// Login
const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};

// Register
const register = async (name, email, password) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

### API Request Helper

```javascript
class API {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new API();
```

## Event Management Integration

### Get Events

```javascript
const getEvents = async () => {
  try {
    const data = await api.get('/events');
    return data.events;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
};
```

### Create Event

```javascript
const createEvent = async (eventData) => {
  try {
    const data = await api.post('/events', eventData);
    return data.event;
  } catch (error) {
    console.error('Failed to create event:', error);
    throw error;
  }
};
```

### Update Event Design

```javascript
const updateEventDesign = async (eventId, design) => {
  try {
    const data = await api.put(`/events/${eventId}/design`, { design });
    return data.event;
  } catch (error) {
    console.error('Failed to update design:', error);
    throw error;
  }
};
```

## Guest Management Integration

### Get Event Guests

```javascript
const getEventGuests = async (eventId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const data = await api.get(`/guests/event/${eventId}?${queryParams}`);
    return data;
  } catch (error) {
    console.error('Failed to fetch guests:', error);
    throw error;
  }
};
```

### Add Guest

```javascript
const addGuest = async (eventId, guestData) => {
  try {
    const data = await api.post(`/guests/event/${eventId}`, guestData);
    return data.guest;
  } catch (error) {
    console.error('Failed to add guest:', error);
    throw error;
  }
};
```

### Update RSVP

```javascript
const updateRSVP = async (guestId, rsvpData) => {
  try {
    const data = await api.put(`/guests/${guestId}/rsvp`, rsvpData);
    return data.guest;
  } catch (error) {
    console.error('Failed to update RSVP:', error);
    throw error;
  }
};
```

## RSVP System Integration (Public)

### Submit RSVP

```javascript
const submitRSVP = async (eventId, guestId, rsvpData) => {
  try {
    const data = await api.post(`/rsvp/submit/${eventId}/${guestId}`, rsvpData);
    return data.guest;
  } catch (error) {
    console.error('Failed to submit RSVP:', error);
    throw error;
  }
};
```

### Get Public Event Data

```javascript
const getPublicEvent = async (eventId) => {
  try {
    const data = await fetch(`/api/share/public/${eventId}`);
    const result = await data.json();
    
    if (!data.ok) {
      throw new Error(result.error);
    }
    
    return result.event;
  } catch (error) {
    console.error('Failed to fetch public event:', error);
    throw error;
  }
};
```

## Design System Integration

### Get Design Templates

```javascript
const getDesignTemplates = async () => {
  try {
    const data = await api.get('/designs/templates');
    return data.templates;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    throw error;
  }
};
```

### Save Custom Design

```javascript
const saveDesign = async (designData) => {
  try {
    const data = await api.post('/designs', designData);
    return data.design;
  } catch (error) {
    console.error('Failed to save design:', error);
    throw error;
  }
};
```

## Sharing Integration

### Generate Shareable Link

```javascript
const generateShareableLink = async (eventId) => {
  try {
    const data = await api.post(`/share/generate-link/${eventId}`);
    return data.link;
  } catch (error) {
    console.error('Failed to generate link:', error);
    throw error;
  }
};
```

### Update Sharing Settings

```javascript
const updateSharingSettings = async (eventId, settings) => {
  try {
    const data = await api.put(`/share/settings/${eventId}`, settings);
    return data.sharing;
  } catch (error) {
    console.error('Failed to update sharing:', error);
    throw error;
  }
};
```

## Export Integration

### Create Export Job

```javascript
const createExport = async (exportData) => {
  try {
    const data = await api.post('/export', exportData);
    return data.export;
  } catch (error) {
    console.error('Failed to create export:', error);
    throw error;
  }
};
```

### Download Export

```javascript
const downloadExport = async (exportId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/export/${exportId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${exportId}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Failed to download export:', error);
    throw error;
  }
};
```

## Notifications Integration

### Get Notifications

```javascript
const getNotifications = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const data = await api.get(`/notifications?${queryParams}`);
    return data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};
```

### Mark Notification as Read

```javascript
const markNotificationAsRead = async (notificationId) => {
  try {
    await api.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};
```

## File Upload Integration

### Upload Images

```javascript
const uploadImage = async (file, type = 'asset') => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`/api/export/upload-assets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }

    return data.files[0];
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
};
```

## Error Handling

### Global Error Handler

```javascript
const handleAPIError = (error, fallbackMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.message === 'Network error') {
    return 'Network connection error. Please check your internet connection.';
  }
  
  if (error.message.includes('401')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return 'Your session has expired. Please log in again.';
  }
  
  return error.message || fallbackMessage;
};
```

## Real-time Updates

### WebSocket Connection (Optional)

```javascript
class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:5000/ws?token=${token}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'notification':
        this.showNotification(data.notification);
        break;
      case 'rsvp_update':
        this.handleRSVPUpdate(data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  showNotification(notification) {
    // Show toast notification or update UI
    console.log('New notification:', notification);
  }

  handleRSVPUpdate(data) {
    // Update guest list or RSVP count
    console.log('RSVP updated:', data);
  }
}

export const wsManager = new WebSocketManager();
```

## Frontend State Management

### Context Provider for API

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const APIContext = createContext();

export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
};

export const APIProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      await fetchEvents();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await api.get('/events');
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const login = async (email, password) => {
    const result = await api.post('/auth/login', { email, password });
    if (result.success) {
      setUser(result.user);
      await fetchEvents();
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setEvents([]);
  };

  const value = {
    user,
    events,
    loading,
    login,
    logout,
    fetchEvents,
    api,
  };

  return (
    <APIContext.Provider value={value}>
      {children}
    </APIContext.Provider>
  );
};
```

## Environment Configuration

### Frontend .env File

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000/ws
REACT_APP_BASE_URL=http://localhost:3000
```

This integration guide provides the foundation for connecting your frontend wedding invitation app with the backend API. Adapt these examples to your specific frontend framework and requirements.