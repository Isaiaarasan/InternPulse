import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  goal: {
    type: mongoose.Schema.ObjectId,
    ref: 'Goal',
    required: true,
  },
  // Main progress section (required)
  content: {
    type: String,
    required: [true, 'Please add report content'],
  },
  // Optional structured sections
  highlights:   { type: String, default: '' },
  blockers:     { type: String, default: '' },
  nextWeekPlan: { type: String, default: '' },
  attachments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Attachment'
  }],

  aiSummary: String,
  status: {
    type: String,
    enum: ['Submitted', 'Approved', 'Revision-Required'],
    default: 'Submitted',
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  managerFeedback: String,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: Date,
}, { timestamps: true });

// Prevent re-submission if already approved
reportSchema.index({ intern: 1, goal: 1 });

export default mongoose.model('Report', reportSchema);
