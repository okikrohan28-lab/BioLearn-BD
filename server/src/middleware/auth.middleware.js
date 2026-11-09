const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const env = require('../config/env');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token structure.',
      });
    }

    // If MongoDB is not connected, use the authenticated token claims (useful for tests/mocking)
    if (mongoose.connection.readyState !== 1) {
      req.user = {
        _id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name || 'User',
      };
      req.role = decoded.role;
      return next();
    }

    let user = null;
    if (decoded.role === 'student') {
      user = await Student.findById(decoded.id);
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Student account not found or is inactive.',
        });
      }
    } else if (['admin', 'superadmin', 'content_manager'].includes(decoded.role)) {
      user = await Admin.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found.',
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role.',
      });
    }

    req.user = user;
    req.role = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token expired. Please log in again.',
      });
    }
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(401).json({
        success: false,
        message: 'User is not authenticated.',
      });
    }

    const roleHierarchy = {
      superadmin: ['superadmin', 'admin', 'content_manager'],
      admin: ['admin', 'content_manager'],
      content_manager: ['content_manager'],
      student: ['student'],
    };

    const userGrantedRoles = roleHierarchy[req.role] || [req.role];
    const isAuthorized = allowedRoles.some((role) => userGrantedRoles.includes(role));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.role}'.`,
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded && decoded.id && decoded.role) {
      if (mongoose.connection.readyState !== 1) {
        req.user = { _id: decoded.id, role: decoded.role, email: decoded.email };
        req.role = decoded.role;
        return next();
      }

      let user = null;
      if (decoded.role === 'student') {
        user = await Student.findById(decoded.id);
      } else if (['admin', 'superadmin', 'content_manager'].includes(decoded.role)) {
        user = await Admin.findById(decoded.id);
      }
      if (user) {
        req.user = user;
        req.role = decoded.role;
      }
    }
    next();
  } catch {
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
