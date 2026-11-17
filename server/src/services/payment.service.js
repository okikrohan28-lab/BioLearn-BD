const PaymentTransaction = require('../models/PaymentTransaction');
const Subscription = require('../models/Subscription');
const subscriptionService = require('./subscription.service');

const generateReferenceId = () => {
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `BIO-${Date.now()}-${random}`;
};

const initiatePayment = async (studentId, subscriptionId) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    const error = new Error('Subscription not found');
    error.statusCode = 404;
    throw error;
  }
  if (subscription.student_id.toString() !== studentId.toString()) {
    const error = new Error('Access denied: not your subscription');
    error.statusCode = 403;
    throw error;
  }
  if (subscription.status === 'active') {
    const error = new Error('Subscription is already active');
    error.statusCode = 409;
    throw error;
  }

  const payment = await PaymentTransaction.create({
    student_id: studentId,
    subscription_id: subscriptionId,
    amount: subscription.fee,
    payment_method: 'bkash_demo',
    status: 'pending',
    is_demo: true,
  });

  return payment;
};

const confirmDemoPayment = async (paymentId, studentId) => {
  const payment = await PaymentTransaction.findById(paymentId);
  if (!payment) {
    const error = new Error('Payment not found');
    error.statusCode = 404;
    throw error;
  }
  if (payment.student_id.toString() !== studentId.toString()) {
    const error = new Error('Access denied: not your payment');
    error.statusCode = 403;
    throw error;
  }
  if (payment.status === 'successful') {
    const error = new Error('Payment has already been confirmed');
    error.statusCode = 409;
    throw error;
  }
  if (payment.status === 'failed') {
    const error = new Error('Cannot confirm a failed payment');
    error.statusCode = 400;
    throw error;
  }

  // Mark payment as successful
  payment.status = 'successful';
  payment.reference_id = generateReferenceId();
  payment.confirmed_at = new Date();
  await payment.save();

  // Activate the subscription
  const subscription = await subscriptionService.activateSubscription(payment.subscription_id.toString());

  return { payment, subscription };
};

module.exports = {
  initiatePayment,
  confirmDemoPayment,
};
