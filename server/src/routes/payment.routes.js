const express = require('express');
const { initiatePayment, confirmDemoPayment } = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, authorize('student'), initiatePayment);
router.post('/:id/confirm-demo', authenticate, authorize('student'), confirmDemoPayment);

module.exports = router;
