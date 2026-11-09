const express = require('express');
const {
  registerStudent,
  loginStudent,
  loginAdmin,
  getProfile,
  updateProfile,
} = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
} = require('../utils/validators');

const router = express.Router();

// Public auth endpoints
router.post('/register', validate(registerSchema), registerStudent);
router.post('/login', validate(loginSchema), loginStudent);
router.post('/admin/login', validate(loginSchema), loginAdmin);

// Protected student profile endpoints (role: 'student')
router.get('/profile', authenticate, authorize('student'), getProfile);
router.put('/profile', authenticate, authorize('student'), validate(profileUpdateSchema), updateProfile);

module.exports = router;
