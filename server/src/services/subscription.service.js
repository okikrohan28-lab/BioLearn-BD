const Subscription = require('../models/Subscription');
const PaymentTransaction = require('../models/PaymentTransaction');

const checkActiveSubscription = async (studentId) => {
  const sub = await Subscription.findOne({ student_id: studentId, status: 'active' });
  if (!sub) return false;
  if (sub.end_date && new Date() > sub.end_date) {
    // Mark as expired
    sub.status = 'expired';
    await sub.save();
    return false;
  }
  return true;
};

const getMySubscription = async (studentId) => {
  return await Subscription.findOne({ student_id: studentId });
};

const createSubscription = async (studentId, { plan_name, duration_days, fee }) => {
  // Check if student already has a subscription
  const existing = await Subscription.findOne({ student_id: studentId });
  if (existing) {
    // If active, cannot create another
    if (existing.status === 'active') {
      const error = new Error('You already have an active subscription');
      error.statusCode = 409;
      throw error;
    }
    // Update the existing pending/expired/cancelled one
    existing.plan_name = plan_name || 'Premium';
    existing.duration_days = duration_days || 30;
    existing.fee = fee;
    existing.status = 'pending';
    existing.start_date = undefined;
    existing.end_date = undefined;
    return await existing.save();
  }

  return await Subscription.create({
    student_id: studentId,
    plan_name: plan_name || 'Premium',
    duration_days: duration_days || 30,
    fee,
    status: 'pending',
  });
};

const getAllSubscriptions = async () => {
  const subscriptions = await Subscription.find()
    .populate('student_id', 'name email phone')
    .sort({ createdAt: -1 });

  const subIds = subscriptions.map((s) => s._id);
  const payments = await PaymentTransaction.find({ subscription_id: { $in: subIds } }).sort({ createdAt: -1 });

  const paymentMap = {};
  payments.forEach((p) => {
    const sid = p.subscription_id.toString();
    if (!paymentMap[sid] || p.status === 'successful') {
      paymentMap[sid] = p;
    }
  });

  return subscriptions.map((sub) => {
    const subObj = sub.toObject();
    const payment = paymentMap[sub._id.toString()];
    return {
      ...subObj,
      payment: payment
        ? {
            _id: payment._id,
            reference_id: payment.reference_id,
            amount: payment.amount,
            status: payment.status,
            payment_method: payment.payment_method,
            confirmed_at: payment.confirmed_at,
          }
        : null,
      payment_amount: payment?.amount || sub.fee,
      reference_id: payment?.reference_id || null,
    };
  });
};

const activateSubscription = async (subscriptionId) => {
  const sub = await Subscription.findById(subscriptionId);
  if (!sub) {
    const error = new Error('Subscription not found');
    error.statusCode = 404;
    throw error;
  }
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + sub.duration_days);
  sub.status = 'active';
  sub.start_date = startDate;
  sub.end_date = endDate;
  return await sub.save();
};

module.exports = {
  checkActiveSubscription,
  getMySubscription,
  createSubscription,
  getAllSubscriptions,
  activateSubscription,
};
