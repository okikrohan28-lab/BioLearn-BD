const subscriptionService = require('../services/subscription.service');

const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getMySubscription(req.user._id);
    res.status(200).json({ success: true, data: subscription || null });
  } catch (error) {
    next(error);
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const { plan_name, duration_days, fee } = req.body;
    const subscription = await subscriptionService.createSubscription(req.user._id, { plan_name, duration_days, fee });
    res.status(201).json({ success: true, message: 'Subscription created successfully', data: subscription });
  } catch (error) {
    next(error);
  }
};

const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMySubscription, createSubscription, getAllSubscriptions };
