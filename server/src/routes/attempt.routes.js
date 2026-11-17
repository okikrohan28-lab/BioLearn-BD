const express = require('express');
const { getAttemptById, getMyAttempts } = require('../controllers/attempt.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/my', authenticate, authorize('student'), getMyAttempts);
router.get('/:attemptId', authenticate, authorize('student'), getAttemptById);

module.exports = router;
