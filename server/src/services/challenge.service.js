const WeeklyChallenge = require('../models/WeeklyChallenge');
const { checkActiveSubscription } = require('./subscription.service');
const quizService = require('./quiz.service');

const getChallenges = async (isAdmin = false) => {
  const filter = isAdmin ? {} : { status: 'published' };
  return await WeeklyChallenge.find(filter).populate('quiz_id', 'title total_marks time_limit_minutes').sort({ start_date: -1 });
};

const getChallengeById = async (id) => {
  const challenge = await WeeklyChallenge.findById(id).populate('quiz_id', 'title total_marks time_limit_minutes');
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.statusCode = 404;
    throw error;
  }
  return challenge;
};

const createChallenge = async (data) => {
  return await WeeklyChallenge.create(data);
};

const updateChallenge = async (id, data) => {
  const challenge = await WeeklyChallenge.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.statusCode = 404;
    throw error;
  }
  return challenge;
};

const deleteChallenge = async (id) => {
  const challenge = await WeeklyChallenge.findByIdAndDelete(id);
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.statusCode = 404;
    throw error;
  }
  return challenge;
};

const startChallenge = async (challengeId, studentId) => {
  const challenge = await WeeklyChallenge.findById(challengeId).populate('quiz_id');
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.statusCode = 404;
    throw error;
  }
  if (challenge.status !== 'published') {
    const error = new Error('This challenge is not available');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  if (now < challenge.start_date) {
    const error = new Error('This challenge has not started yet');
    error.statusCode = 400;
    throw error;
  }
  if (now > challenge.end_date) {
    const error = new Error('This challenge has ended');
    error.statusCode = 400;
    throw error;
  }

  if (challenge.is_premium_only) {
    const hasActive = await checkActiveSubscription(studentId);
    if (!hasActive) {
      const error = new Error('This challenge requires an active premium subscription');
      error.statusCode = 403;
      throw error;
    }
  }

  // Delegate to quiz start logic using quiz_id
  return await quizService.startQuiz(challenge.quiz_id._id.toString(), studentId);
};

const submitChallenge = async (challengeId, studentId, answers) => {
  const challenge = await WeeklyChallenge.findById(challengeId);
  if (!challenge) {
    const error = new Error('Challenge not found');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  if (now > challenge.end_date) {
    const error = new Error('This challenge has ended and can no longer be submitted');
    error.statusCode = 400;
    throw error;
  }

  return await quizService.submitQuiz(challenge.quiz_id.toString(), studentId, answers);
};

module.exports = {
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  startChallenge,
  submitChallenge,
};
