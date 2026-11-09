const express = require('express');
const {
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
} = require('../controllers/chapter.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { chapterSchema } = require('../utils/validators');

const router = express.Router();

// Public / Student
router.get('/', optionalAuth, getChapters);
router.get('/:id', optionalAuth, getChapterById);

// Admin only routes
router.post('/', authenticate, authorize('admin'), validate(chapterSchema), createChapter);
router.put('/:id', authenticate, authorize('admin'), updateChapter);
router.delete('/:id', authenticate, authorize('admin'), deleteChapter);

module.exports = router;
