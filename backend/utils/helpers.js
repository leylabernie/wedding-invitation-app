const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique ID
 */
const generateId = () => uuidv4();

/**
 * Generate a shareable link for an event
 */
const generateShareableLink = (eventId) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const token = crypto.randomBytes(16).toString('hex');
  return `${baseUrl}/event/${eventId}?token=${token}`;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Generate random password
 */
const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Calculate event statistics
 */
const calculateEventStats = (guests) => {
  const stats = {
    total: guests.length,
    pending: 0,
    accepted: 0,
    declined: 0,
    maybe: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    plusOnes: 0,
    categories: {}
  };

  guests.forEach(guest => {
    stats.totalGuests += guest.partySize;
    
    switch (guest.rsvp.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'accepted':
        stats.accepted++;
        stats.confirmedGuests += guest.rsvp.actualGuestCount || guest.partySize;
        stats.plusOnes += (guest.rsvp.actualGuestCount || guest.partySize) - 1;
        break;
      case 'declined':
        stats.declined++;
        break;
      case 'maybe':
        stats.maybe++;
        break;
    }

    if (!stats.categories[guest.category]) {
      stats.categories[guest.category] = { total: 0, confirmed: 0 };
    }
    stats.categories[guest.category].total++;
    if (guest.rsvp.status === 'accepted') {
      stats.categories[guest.category].confirmed++;
    }
  });

  return stats;
};

/**
 * Format date for display
 */
const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    case 'time':
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    default:
      return d.toLocaleDateString();
  }
};

/**
 * Calculate time difference
 */
const getTimeDifference = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return 'Today';
  }
};

/**
 * Generate color palette variations
 */
const generateColorVariations = (baseColor) => {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return {
    lighter: `#${[r, g, b].map(x => Math.min(255, Math.floor(x * 1.2)).toString(16).padStart(2, '0')).join('')}`,
    darker: `#${[r, g, b].map(x => Math.max(0, Math.floor(x * 0.8)).toString(16).padStart(2, '0')).join('')}`,
    complementary: `#${[255 - r, 255 - g, 255 - b].map(x => x.toString(16).padStart(2, '0')).join('')}`
  };
};

module.exports = {
  generateId,
  generateShareableLink,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  generatePassword,
  calculateEventStats,
  formatDate,
  getTimeDifference,
  generateColorVariations
};