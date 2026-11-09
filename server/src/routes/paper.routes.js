const express = require('express');
const {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
} = require('../controllers/paper.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { paperSchema } = require('../utils/validators');

const router = express.Router();

// Public / Student (optional auth to show drafts to admins)
router.get('/', optionalAuth, getPapers);
router.get('/:id', optionalAuth, getPaperById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), validate(paperSchema), createPaper);
router.put('/:id', authenticate, authorize('admin'), updatePaper);
router.delete('/:id', authenticate, authorize('admin'), deletePaper);

module.exports = router;
