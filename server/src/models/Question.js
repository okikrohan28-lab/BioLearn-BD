const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    option_label: { type: String },
    option_text: { type: String },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required'],
    },
    question_text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: [optionSchema],
    correct_answer: {
      type: String,
      required: [true, 'Correct answer is required'],
      select: false,
    },
    positive_marks: {
      type: Number,
      required: [true, 'Positive marks are required'],
      min: [0, 'Marks cannot be negative'],
    },
    explanation: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
