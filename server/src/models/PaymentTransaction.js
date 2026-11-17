const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: [true, 'Subscription ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    payment_method: {
      type: String,
      default: 'bkash_demo',
    },
    reference_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'pending',
    },
    is_demo: {
      type: Boolean,
      default: true,
    },
    confirmed_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
