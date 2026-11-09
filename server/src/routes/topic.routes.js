const express = require('express');
const {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} = require('../controllers/topic.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { topicSchema } = require('../utils/validators');

const router = express.Router();

// Public / Student
router.get('/', optionalAuth, getTopics);
router.get('/:id', optionalAuth, getTopicById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), validate(topicSchema), createTopic);
router.put('/:id', authenticate, authorize('admin'), updateTopic);
router.delete('/:id', authenticate, authorize('admin'), deleteTopic);

module.exports = router;
