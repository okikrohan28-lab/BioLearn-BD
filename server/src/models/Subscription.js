const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      unique: true,
    },
    plan_name: {
      type: String,
      required: [true, 'Plan name is required'],
      default: 'Premium',
    },
    duration_days: {
      type: Number,
      required: [true, 'Duration is required'],
      default: 30,
    },
    fee: {
      type: Number,
      required: [true, 'Fee is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending',
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
