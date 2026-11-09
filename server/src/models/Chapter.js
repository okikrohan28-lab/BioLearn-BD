const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    paper_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      required: [true, 'Associated paper is required'],
      index: true,
    },
    chapter_no: {
      type: Number,
      required: [true, 'Chapter number is required'],
      min: [1, 'Chapter number must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'Chapter title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
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

// Compound unique index ensuring unique chapter numbers per paper
chapterSchema.index({ paper_id: 1, chapter_no: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', chapterSchema);
