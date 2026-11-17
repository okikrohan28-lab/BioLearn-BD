const quizService = require('../services/quiz.service');

const getAttemptById = async (req, res, next) => {
  try {
    const { attempt, questions } = await quizService.getAttemptById(req.params.attemptId, req.user._id);
    res.status(200).json({ success: true, data: { attempt, questions } });
  } catch (error) {
    next(error);
  }
};

const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await quizService.getMyAttempts(req.user._id);
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAttemptById, getMyAttempts };
