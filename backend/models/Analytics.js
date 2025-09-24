const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
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
  sessionData: {
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number // Duration in seconds
    },
    videoProgress: {
      type: Number, // Percentage completed (0-100)
      default: 0
    },
    interactions: [{
      type: {
        type: String,
        enum: ['play', 'pause', 'seek', 'note_taken', 'quiz_attempt', 'caption_toggle', 'video_play', 'video_pause', 'video_seek', 'note_created', 'quiz_completed', 'fullscreen_toggle', 'volume_change', 'video_closed', 'video_ended', 'video_loaded']
      },
      timestamp: {
        type: Number // Video timestamp in seconds
      },
      data: {
        type: mongoose.Schema.Types.Mixed // Additional interaction data
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  performance: {
    comprehensionScore: {
      type: Number, // 0-100
      default: 0
    },
    engagementScore: {
      type: Number, // 0-100
      default: 0
    },
    completionRate: {
      type: Number, // 0-100
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
analyticsSchema.index({ user: 1, course: 1 });
analyticsSchema.index({ user: 1, createdAt: -1 });
analyticsSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
