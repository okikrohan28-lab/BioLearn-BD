const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    quiz_type: {
      type: String,
      enum: ['topic', 'chapter', 'weekly'],
      required: [true, 'Quiz type is required'],
    },
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
    },
    chapter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    time_limit_minutes: {
      type: Number,
      default: null,
    },
    total_marks: {
      type: Number,
      default: 0,
    },
    pass_marks: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

// Pre-save validation: topic quiz requires topic_id, chapter quiz requires chapter_id
quizSchema.pre('save', function () {
  if (this.quiz_type === 'topic' && !this.topic_id) {
    const error = new Error('A topic quiz must have a topic_id');
    error.statusCode = 400;
    throw error;
  }
  if (this.quiz_type === 'chapter' && !this.chapter_id) {
    const error = new Error('A chapter quiz must have a chapter_id');
    error.statusCode = 400;
    throw error;
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
