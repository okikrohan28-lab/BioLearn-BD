const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic ID is required'],
    },
    resource_type: {
      type: String,
      enum: ['note', 'diagram', 'youtube', 'video'],
      required: [true, 'Resource type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    file_url: {
      type: String,
      default: '',
    },
    file_name: {
      type: String,
      default: '',
    },
    file_type: {
      type: String,
      default: '',
    },
    file_size: {
      type: Number,
      default: 0,
    },
    image_url: {
      type: String,
      default: '',
    },
    youtube_url: {
      type: String,
      default: '',
    },
    youtube_video_id: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
