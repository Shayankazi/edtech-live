const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number, // Video timestamp in seconds
    default: 0
  },
  aiSummary: {
    summary: {
      type: String
    },
    keyPoints: [{
      type: String
    }],
    generatedAt: {
      type: Date
    }
  },
  tags: [{
    type: String
  }],
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
noteSchema.index({ user: 1, course: 1 });
noteSchema.index({ user: 1, lesson: 1 });

module.exports = mongoose.model('Note', noteSchema);
