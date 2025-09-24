const mongoose = require('mongoose');

const captionSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true
  },
  language: {
    type: String,
    default: 'en',
    required: true
  },
  captions: [{
    start: {
      type: Number,
      required: true // Time in seconds
    },
    end: {
      type: Number,
      required: true // Time in seconds
    },
    text: {
      type: String,
      required: true
    }
  }],
  vttContent: {
    type: String // WebVTT formatted content
  },
  generatedBy: {
    type: String,
    enum: ['manual', 'ai', 'upload'],
    default: 'ai'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient queries
captionSchema.index({ videoId: 1, language: 1 });

module.exports = mongoose.model('Caption', captionSchema);
