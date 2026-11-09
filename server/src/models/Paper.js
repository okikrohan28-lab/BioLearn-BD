const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Paper title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    subject: {
      type: String,
      default: 'Biology',
      trim: true,
    },
    access_level: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

paperSchema.index({ status: 1, access_level: 1 });

module.exports = mongoose.model('Paper', paperSchema);
