const express = require('express');
const {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  submitQuiz,
  getMyAttemptForQuiz,
} = require('../controllers/quiz.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', optionalAuth, getQuizzes);
router.post('/', authenticate, authorize('admin'), createQuiz);
router.put('/:id', authenticate, authorize('admin'), updateQuiz);
router.delete('/:id', authenticate, authorize('admin'), deleteQuiz);

// Student endpoints
router.get('/:id/start', authenticate, authorize('student'), startQuiz);
router.post('/:id/submit', authenticate, authorize('student'), submitQuiz);
router.get('/:id/attempts', authenticate, authorize('student'), getMyAttemptForQuiz);

module.exports = router;
