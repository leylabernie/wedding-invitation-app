// Vercel serverless function entry point
require('dotenv').config();

// Import the backend app
const app = require('../backend/server.js');

// Initialize database for serverless environment
const connectDB = require('../backend/config/database');

let isDbConnected = false;

const ensureDbConnection = async () => {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
      console.log('Database connected for serverless function');
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }
};

// Export the serverless function
module.exports = async (req, res) => {
  // Ensure database is connected
  await ensureDbConnection();
  
  // Handle CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return app(req, res);
};