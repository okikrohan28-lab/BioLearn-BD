const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

const getQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.query;
    if (!quizId) {
      return res.status(400).json({ success: false, message: 'quizId query parameter is required' });
    }
    // Admin gets correct_answer
    const questions = await Question.find({ quiz_id: quizId }).select('+correct_answer').sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const { quiz_id, question_text, options, correct_answer, positive_marks, explanation, order } = req.body;

    // Validate quiz exists
    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const question = await Question.create({
      quiz_id, question_text, options, correct_answer, positive_marks,
      explanation: explanation || '',
      order: order || 0,
    });

    // Update quiz total_marks
    const allQuestions = await Question.find({ quiz_id });
    const total = allQuestions.reduce((sum, q) => sum + (q.positive_marks || 0), 0);
    await Quiz.findByIdAndUpdate(quiz_id, { total_marks: total });

    // Return without correct_answer
    const { correct_answer: _removed, ...safeQuestion } = question.toObject();
    res.status(201).json({ success: true, message: 'Question created successfully', data: safeQuestion });
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('+correct_answer');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Recalculate quiz total_marks
    if (req.body.positive_marks !== undefined) {
      const allQuestions = await Question.find({ quiz_id: question.quiz_id });
      const total = allQuestions.reduce((sum, q) => sum + (q.positive_marks || 0), 0);
      await Quiz.findByIdAndUpdate(question.quiz_id, { total_marks: total });
    }

    res.status(200).json({ success: true, message: 'Question updated successfully', data: question });
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Recalculate total_marks
    const allQuestions = await Question.find({ quiz_id: question.quiz_id });
    const total = allQuestions.reduce((sum, q) => sum + (q.positive_marks || 0), 0);
    await Quiz.findByIdAndUpdate(question.quiz_id, { total_marks: total });

    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const createBulkQuestions = async (req, res, next) => {
  try {
    const { quiz_id, questions } = req.body;

    if (!quiz_id) {
      return res.status(400).json({ success: false, message: 'quiz_id is required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'questions array is required and must contain at least one question' });
    }

    const quiz = await Quiz.findById(quiz_id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Validate each question in the batch
    const existingCount = await Question.countDocuments({ quiz_id });
    const validatedQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = i + 1;

      if (!q.question_text || !q.question_text.trim()) {
        return res.status(400).json({ success: false, message: `Question #${qNum}: Question text is required.` });
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ success: false, message: `Question #${qNum}: At least 2 options are required.` });
      }

      for (const opt of q.options) {
        if (!opt.option_text || !opt.option_text.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question #${qNum}: Option ${opt.option_label || ''} text cannot be empty.`,
          });
        }
      }

      const validOptionLabels = q.options.map((o) => o.option_label);
      if (!q.correct_answer || !validOptionLabels.includes(q.correct_answer)) {
        return res.status(400).json({
          success: false,
          message: `Question #${qNum}: Valid correct answer must match one of the option labels (${validOptionLabels.join(', ')}).`,
        });
      }

      const positive_marks = q.positive_marks !== undefined ? Number(q.positive_marks) : 1;
      if (isNaN(positive_marks) || positive_marks < 0) {
        return res.status(400).json({
          success: false,
          message: `Question #${qNum}: Positive marks must be a non-negative number.`,
        });
      }

      validatedQuestions.push({
        quiz_id,
        question_text: q.question_text.trim(),
        options: q.options.map((o) => ({
          option_label: o.option_label,
          option_text: o.option_text.trim(),
        })),
        correct_answer: q.correct_answer,
        positive_marks,
        explanation: q.explanation ? q.explanation.trim() : '',
        order: q.order !== undefined ? Number(q.order) : existingCount + i + 1,
      });
    }

    // Insert all validated questions
    const inserted = await Question.insertMany(validatedQuestions);

    // Recalculate total_marks for the quiz
    const allQuizQuestions = await Question.find({ quiz_id });
    const total = allQuizQuestions.reduce((sum, q) => sum + (q.positive_marks || 0), 0);
    await Quiz.findByIdAndUpdate(quiz_id, { total_marks: total });

    // Never expose correct_answer in standard response
    const safeCreated = inserted.map((doc) => {
      const obj = doc.toObject();
      delete obj.correct_answer;
      return obj;
    });

    res.status(201).json({
      success: true,
      message: `${inserted.length} questions created successfully`,
      count: inserted.length,
      data: safeCreated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuestions, createQuestion, updateQuestion, deleteQuestion, createBulkQuestions };
