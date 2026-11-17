const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');

const getQuizzes = async (query, isAdmin = false) => {
  const filter = {};
  if (query.topicId) filter.topic_id = query.topicId;
  if (query.chapterId) filter.chapter_id = query.chapterId;
  if (!isAdmin) filter.status = 'published';
  return await Quiz.find(filter).sort({ createdAt: -1 });
};

const getQuizById = async (id) => {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const error = new Error('Quiz not found');
    error.statusCode = 404;
    throw error;
  }
  return quiz;
};

const createQuiz = async (data) => {
  const quiz = new Quiz(data);
  return await quiz.save();
};

const updateQuiz = async (id, data) => {
  // Need to run pre-save validation; use findById + save
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const error = new Error('Quiz not found');
    error.statusCode = 404;
    throw error;
  }
  Object.assign(quiz, data);
  return await quiz.save();
};

const deleteQuiz = async (id) => {
  const quiz = await Quiz.findByIdAndDelete(id);
  if (!quiz) {
    const error = new Error('Quiz not found');
    error.statusCode = 404;
    throw error;
  }
  // Also delete associated questions and attempts
  await Question.deleteMany({ quiz_id: id });
  await QuizAttempt.deleteMany({ quiz_id: id });
  return quiz;
};

// Start a quiz: return questions WITHOUT correct_answer
const startQuiz = async (quizId, studentId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const error = new Error('Quiz not found');
    error.statusCode = 404;
    throw error;
  }
  if (quiz.status !== 'published') {
    const error = new Error('This quiz is not available');
    error.statusCode = 400;
    throw error;
  }

  // Check if student already submitted
  const existingAttempt = await QuizAttempt.findOne({ student_id: studentId, quiz_id: quizId, status: 'submitted' });
  if (existingAttempt) {
    const error = new Error('You have already submitted this quiz');
    error.statusCode = 409;
    throw error;
  }

  // Questions WITHOUT correct_answer
  const questions = await Question.find({ quiz_id: quizId }).sort({ order: 1, createdAt: 1 }).select('-correct_answer');

  // Create or return existing in_progress attempt
  let attempt = await QuizAttempt.findOne({ student_id: studentId, quiz_id: quizId, status: 'in_progress' });
  if (!attempt) {
    attempt = await QuizAttempt.create({
      student_id: studentId,
      quiz_id: quizId,
      total_marks: quiz.total_marks,
      status: 'in_progress',
    });
  }

  return { quiz, questions, attempt_id: attempt._id };
};

// Submit quiz: calculate score server-side
const submitQuiz = async (quizId, studentId, answers) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const error = new Error('Quiz not found');
    error.statusCode = 404;
    throw error;
  }

  const attempt = await QuizAttempt.findOne({ student_id: studentId, quiz_id: quizId });
  if (!attempt) {
    const error = new Error('No active attempt found. Please start the quiz first.');
    error.statusCode = 400;
    throw error;
  }
  if (attempt.status === 'submitted') {
    const error = new Error('Quiz already submitted');
    error.statusCode = 409;
    throw error;
  }

  // Fetch questions WITH correct_answer for server-side scoring
  const questions = await Question.find({ quiz_id: quizId }).select('+correct_answer');

  let obtained_marks = 0;
  let correct_count = 0;
  let incorrect_count = 0;
  let unanswered_count = 0;

  const answerMap = {};
  if (Array.isArray(answers)) {
    answers.forEach((a) => {
      answerMap[a.question_id ? a.question_id.toString() : ''] = a.selected_option;
    });
  }

  questions.forEach((q) => {
    const selected = answerMap[q._id.toString()];
    if (!selected) {
      unanswered_count++;
    } else if (selected === q.correct_answer) {
      correct_count++;
      obtained_marks += q.positive_marks;
    } else {
      incorrect_count++;
    }
  });

  const total_marks = quiz.total_marks;
  const score = total_marks > 0 ? Math.round((obtained_marks / total_marks) * 100) : 0;

  attempt.answers = answers || [];
  attempt.score = score;
  attempt.total_marks = total_marks;
  attempt.obtained_marks = obtained_marks;
  attempt.correct_count = correct_count;
  attempt.incorrect_count = incorrect_count;
  attempt.unanswered_count = unanswered_count;
  attempt.status = 'submitted';
  attempt.submitted_at = new Date();
  await attempt.save();

  return attempt;
};

// Get a student's attempt for a quiz
const getAttemptByQuizAndStudent = async (quizId, studentId) => {
  const attempt = await QuizAttempt.findOne({ student_id: studentId, quiz_id: quizId });
  if (!attempt) {
    const error = new Error('No attempt found for this quiz');
    error.statusCode = 404;
    throw error;
  }
  return attempt;
};

// Get a specific attempt with answer review (correct_answer only after submission)
const getAttemptById = async (attemptId, studentId) => {
  const attempt = await QuizAttempt.findById(attemptId).populate('quiz_id');
  if (!attempt) {
    const error = new Error('Attempt not found');
    error.statusCode = 404;
    throw error;
  }
  if (attempt.student_id.toString() !== studentId.toString()) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    throw error;
  }

  let questions = null;
  if (attempt.status === 'submitted') {
    // Return with correct_answer for review
    questions = await Question.find({ quiz_id: attempt.quiz_id }).select('+correct_answer').sort({ order: 1 });
  }

  return { attempt, questions };
};

// Get all attempts for a student
const getMyAttempts = async (studentId) => {
  return await QuizAttempt.find({ student_id: studentId })
    .populate('quiz_id', 'title quiz_type total_marks status')
    .sort({ createdAt: -1 });
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  submitQuiz,
  getAttemptByQuizAndStudent,
  getAttemptById,
  getMyAttempts,
};
