const express = require('express');
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createBulkQuestions,
} = require('../controllers/question.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All question management is admin-only
router.get('/', authenticate, authorize('admin'), getQuestions);
router.post('/bulk', authenticate, authorize('admin'), createBulkQuestions);
router.post('/', authenticate, authorize('admin'), createQuestion);
router.put('/:id', authenticate, authorize('admin'), updateQuestion);
router.delete('/:id', authenticate, authorize('admin'), deleteQuestion);

module.exports = router;
