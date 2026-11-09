const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not configured. Database connection skipped.');
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected.');
});

module.exports = connectDB;
