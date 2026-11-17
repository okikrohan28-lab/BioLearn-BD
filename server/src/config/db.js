const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected.');
});

module.exports = connectDB;
