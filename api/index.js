// Vercel serverless function entry point
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Create a minimal Express app for serverless
const app = express();

// Basic middleware for serverless
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'serverless'
  });
});

// Mock API endpoints for testing
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth endpoint working' });
});

app.get('/api/events/test', (req, res) => {
  res.json({ message: 'Events endpoint working' });
});

// Catch all other API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl 
  });
});

// Export the serverless function handler
module.exports = (req, res) => {
  console.log(`🚀 Serverless function called: ${req.method} ${req.url}`);
  
  // Handle CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};