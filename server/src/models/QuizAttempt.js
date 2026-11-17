const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selected_option: { type: String },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required'],
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
    },
    total_marks: {
      type: Number,
    },
    obtained_marks: {
      type: Number,
    },
    correct_count: {
      type: Number,
    },
    incorrect_count: {
      type: Number,
    },
    unanswered_count: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted'],
      default: 'in_progress',
    },
    submitted_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate submitted attempts
quizAttemptSchema.index(
  { student_id: 1, quiz_id: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'submitted' },
  }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
