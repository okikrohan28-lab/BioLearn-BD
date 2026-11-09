require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'default_dev_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Validate critical variables in production
if (env.NODE_ENV === 'production' && !env.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI is not defined in production environment.');
  process.exit(1);
}

module.exports = env;
