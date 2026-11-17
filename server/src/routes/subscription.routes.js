const express = require('express');
const { getMySubscription, createSubscription, getAllSubscriptions } = require('../controllers/subscription.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/my', authenticate, authorize('student'), getMySubscription);
router.post('/', authenticate, authorize('student'), createSubscription);
router.get('/', authenticate, authorize('admin'), getAllSubscriptions);

module.exports = router;
