const challengeService = require('../services/challenge.service');

const getChallenges = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const challenges = await challengeService.getChallenges(isAdmin);
    res.status(200).json({ success: true, data: challenges });
  } catch (error) {
    next(error);
  }
};

const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await challengeService.getChallengeById(req.params.id);
    res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
};

const createChallenge = async (req, res, next) => {
  try {
    const challenge = await challengeService.createChallenge(req.body);
    res.status(201).json({ success: true, message: 'Challenge created successfully', data: challenge });
  } catch (error) {
    next(error);
  }
};

const updateChallenge = async (req, res, next) => {
  try {
    const challenge = await challengeService.updateChallenge(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Challenge updated successfully', data: challenge });
  } catch (error) {
    next(error);
  }
};

const deleteChallenge = async (req, res, next) => {
  try {
    await challengeService.deleteChallenge(req.params.id);
    res.status(200).json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const startChallenge = async (req, res, next) => {
  try {
    const result = await challengeService.startChallenge(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const submitChallenge = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const attempt = await challengeService.submitChallenge(req.params.id, req.user._id, answers);
    res.status(200).json({ success: true, message: 'Challenge submitted successfully', data: attempt });
  } catch (error) {
    next(error);
  }
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
