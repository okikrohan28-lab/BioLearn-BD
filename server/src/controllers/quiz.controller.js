const quizService = require('../services/quiz.service');

const getQuizzes = async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(req.role);
    const quizzes = await quizService.getQuizzes(req.query, isAdmin);
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res.status(201).json({ success: true, message: 'Quiz created successfully', data: quiz });
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.updateQuiz(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Quiz updated successfully', data: quiz });
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    await quizService.deleteQuiz(req.params.id);
    res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const startQuiz = async (req, res, next) => {
  try {
    const result = await quizService.startQuiz(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const attempt = await quizService.submitQuiz(req.params.id, req.user._id, answers);
    res.status(200).json({ success: true, message: 'Quiz submitted successfully', data: attempt });
  } catch (error) {
    next(error);
  }
};

const getMyAttemptForQuiz = async (req, res, next) => {
  try {
    const attempt = await quizService.getAttemptByQuizAndStudent(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  submitQuiz,
  getMyAttemptForQuiz,
};
