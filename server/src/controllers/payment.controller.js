const paymentService = require('../services/payment.service');

const initiatePayment = async (req, res, next) => {
  try {
    const { subscription_id } = req.body;
    if (!subscription_id) {
      return res.status(400).json({ success: false, message: 'subscription_id is required' });
    }
    const payment = await paymentService.initiatePayment(req.user._id, subscription_id);
    res.status(201).json({ success: true, message: 'Payment initiated', data: payment });
  } catch (error) {
    next(error);
  }
};

const confirmDemoPayment = async (req, res, next) => {
  try {
    const { payment, subscription } = await paymentService.confirmDemoPayment(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Payment confirmed and subscription activated',
      data: { payment, subscription },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { initiatePayment, confirmDemoPayment };
