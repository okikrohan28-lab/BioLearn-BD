const mongoose = require('mongoose');

const weeklyChallengeSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    start_date: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    end_date: {
      type: Date,
      required: [true, 'End date is required'],
    },
    is_premium_only: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeeklyChallenge', weeklyChallengeSchema);
