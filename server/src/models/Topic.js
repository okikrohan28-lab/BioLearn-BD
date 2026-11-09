const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    chapter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Associated chapter is required'],
      index: true,
    },
    topic_no: {
      type: Number,
      required: [true, 'Topic number is required'],
      min: [1, 'Topic number must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound unique index ensuring unique topic numbers per chapter
topicSchema.index({ chapter_id: 1, topic_no: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
