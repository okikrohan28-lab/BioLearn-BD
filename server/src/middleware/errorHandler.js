const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode;
  if (statusCode === 200 || !statusCode) {
    statusCode = 500;
  }

  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    const issues = err.issues || err.errors || [];
    errors = issues.map((e) => ({
      field: e.path.slice(1).join('.') || e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. It must be unique.`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
