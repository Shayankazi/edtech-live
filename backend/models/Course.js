const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  transcript: {
    type: String,
    default: ''
  },
  captions: [{
    language: {
      type: String,
      default: 'en'
    },
    content: {
      type: String,
      default: ''
    },
    srtFile: {
      type: String,
      default: ''
    }
  }],
  aiSummary: {
    summary: {
      type: String,
      default: ''
    },
    keyPoints: [{
      type: String
    }],
    generatedAt: {
      type: Date
    }
  },
  resources: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'link', 'code', 'image'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number // in bytes
    }
  }],
  quiz: {
    questions: [{
      question: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'short_answer'],
        default: 'multiple_choice'
      },
      options: [{
        text: String,
        isCorrect: Boolean
      }],
      correctAnswer: String,
      explanation: String,
      points: {
        type: Number,
        default: 1
      }
    }],
    passingScore: {
      type: Number,
      default: 70
    },
    timeLimit: {
      type: Number, // in minutes
      default: 30
    }
  },
  isPreview: {
    type: Boolean,
    default: false
  }
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 500
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'programming', 'design', 'business', 'marketing', 
      'data_science', 'ai_ml', 'web_development', 'mobile_development',
      'devops', 'cybersecurity', 'photography', 'music',
      'language', 'health', 'fitness', 'cooking', 'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  thumbnail: {
    type: String,
    required: true
  },
  previewVideo: {
    type: String
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  sections: [sectionSchema],
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true
  }],
  targetAudience: [{
    type: String,
    trim: true
  }],
  totalDuration: {
    type: Number, // in seconds
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    helpful: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  certificate: {
    enabled: {
      type: Boolean,
      default: true
    },
    template: {
      type: String,
      default: 'default'
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageWatchTime: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ enrollmentCount: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Calculate total duration and lessons before saving
courseSchema.pre('save', function(next) {
  let totalDuration = 0;
  let totalLessons = 0;
  
  this.sections.forEach(section => {
    section.lessons.forEach(lesson => {
      totalDuration += lesson.duration;
      totalLessons += 1;
    });
  });
  
  this.totalDuration = totalDuration;
  this.totalLessons = totalLessons;
  this.lastUpdated = new Date();
  
  next();
});

// Update rating when reviews change
courseSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

// Get course progress for a specific user
courseSchema.methods.getProgressForUser = function(userId) {
  // This would typically be calculated based on user's lesson completion
  // For now, return 0 as placeholder
  return 0;
};

// Check if user has access to course
courseSchema.methods.hasUserAccess = function(userId) {
  // Check if user is enrolled or if course is free
  return this.price === 0 || this.enrollmentCount > 0;
};

module.exports = mongoose.model('Course', courseSchema);
