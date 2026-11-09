const mongoose = require('mongoose');
const env = require('../config/env');

const dbStatusMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getHealth = (req, res) => {
  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = dbStatusMap[dbStateCode] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'BioLearn BD API is operational',
    data: {
      status: 'healthy',
      uptime: `${Math.floor(process.uptime())} seconds`,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: {
        status: dbStatus,
        connected: dbStateCode === 1,
      },
    },
  });
};

module.exports = {
  getHealth,
};
