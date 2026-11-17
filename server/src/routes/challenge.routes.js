const express = require('express');
const {
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  startChallenge,
  submitChallenge,
} = require('../controllers/challenge.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', optionalAuth, getChallenges);
router.get('/:id', optionalAuth, getChallengeById);
router.post('/', authenticate, authorize('admin'), createChallenge);
router.put('/:id', authenticate, authorize('admin'), updateChallenge);
router.delete('/:id', authenticate, authorize('admin'), deleteChallenge);

// Student endpoints
router.get('/:id/start', authenticate, authorize('student'), startChallenge);
router.post('/:id/submit', authenticate, authorize('student'), submitChallenge);

module.exports = router;
