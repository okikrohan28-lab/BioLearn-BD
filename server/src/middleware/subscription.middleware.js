const subscriptionService = require('../services/subscription.service');

const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const isActive = await subscriptionService.checkActiveSubscription(req.user._id);
    if (!isActive) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required. Please subscribe to access this content.',
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireActiveSubscription };
