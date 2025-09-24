const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  completedLessons: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    watchTime: {
      type: Number, // in seconds
      default: 0
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100
    },
    quizAttempts: {
      type: Number,
      default: 0
    }
  }],
  currentLesson: {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId
    },
    position: {
      type: Number, // video position in seconds
      default: 0
    }
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalWatchTime: {
    type: Number, // in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: {
    type: Date
  },
  notes: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Number, // video timestamp in seconds
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    aiGenerated: {
      type: Boolean,
      default: false
    }
  }],
  bookmarks: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    timestamp: {
      type: Number, // video timestamp in seconds
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  streakDays: {
    type: Number,
    default: 0
  },
  lastStreakDate: {
    type: Date
  },
  studyGoal: {
    dailyMinutes: {
      type: Number,
      default: 30
    },
    weeklyGoal: {
      type: Number,
      default: 210 // 30 minutes * 7 days
    }
  },
  weeklyStats: [{
    week: {
      type: Date,
      required: true
    },
    minutesStudied: {
      type: Number,
      default: 0
    },
    lessonsCompleted: {
      type: Number,
      default: 0
    },
    goalAchieved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
progressSchema.index({ user: 1, course: 1 }, { unique: true });
progressSchema.index({ user: 1 });
progressSchema.index({ course: 1 });
progressSchema.index({ lastAccessedAt: -1 });

// Calculate overall progress based on completed lessons
progressSchema.methods.calculateProgress = async function() {
  try {
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);
    
    if (!course) return 0;
    
    const totalLessons = course.totalLessons;
    const completedLessons = this.completedLessons.length;
    
    if (totalLessons === 0) return 0;
    
    this.overallProgress = Math.round((completedLessons / totalLessons) * 100);
    
    // Mark as completed if 100% progress
    if (this.overallProgress >= 100 && !this.completedAt) {
      this.completedAt = new Date();
    }
    
    return this.overallProgress;
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 0;
  }
};

// Mark lesson as completed
progressSchema.methods.completeLesson = function(lessonId, sectionId, watchTime = 0, quizScore = null) {
  // Check if lesson is already completed
  const existingCompletion = this.completedLessons.find(
    completion => completion.lessonId.toString() === lessonId.toString()
  );
  
  if (!existingCompletion) {
    this.completedLessons.push({
      lessonId,
      sectionId,
      watchTime,
      quizScore,
      quizAttempts: quizScore !== null ? 1 : 0
    });
  } else if (quizScore !== null && quizScore > (existingCompletion.quizScore || 0)) {
    // Update quiz score if better
    existingCompletion.quizScore = quizScore;
    existingCompletion.quizAttempts += 1;
  }
  
  this.totalWatchTime += watchTime;
  this.lastAccessedAt = new Date();
  
  // Update streak
  this.updateStreak();
};

// Update current lesson position
progressSchema.methods.updateCurrentLesson = function(lessonId, sectionId, position = 0) {
  this.currentLesson = {
    lessonId,
    sectionId,
    position
  };
  this.lastAccessedAt = new Date();
};

// Add note to lesson
progressSchema.methods.addNote = function(lessonId, content, timestamp, aiGenerated = false) {
  this.notes.push({
    lessonId,
    content,
    timestamp,
    aiGenerated
  });
};

// Add bookmark
progressSchema.methods.addBookmark = function(lessonId, title, timestamp) {
  this.bookmarks.push({
    lessonId,
    title,
    timestamp
  });
};

// Update learning streak
progressSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStreakDate = this.lastStreakDate ? new Date(this.lastStreakDate) : null;
  
  if (!lastStreakDate) {
    // First day of streak
    this.streakDays = 1;
    this.lastStreakDate = today;
  } else {
    lastStreakDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastStreakDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.streakDays += 1;
      this.lastStreakDate = today;
    } else if (daysDiff > 1) {
      // Streak broken, restart
      this.streakDays = 1;
      this.lastStreakDate = today;
    }
    // If daysDiff === 0, same day, no change needed
  }
};

// Get weekly stats
progressSchema.methods.getWeeklyStats = function(weekStart) {
  const weekStats = this.weeklyStats.find(
    stat => stat.week.getTime() === weekStart.getTime()
  );
  
  return weekStats || {
    week: weekStart,
    minutesStudied: 0,
    lessonsCompleted: 0,
    goalAchieved: false
  };
};

// Update weekly stats
progressSchema.methods.updateWeeklyStats = function(minutesStudied, lessonsCompleted) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  
  let weekStats = this.weeklyStats.find(
    stat => stat.week.getTime() === weekStart.getTime()
  );
  
  if (!weekStats) {
    weekStats = {
      week: weekStart,
      minutesStudied: 0,
      lessonsCompleted: 0,
      goalAchieved: false
    };
    this.weeklyStats.push(weekStats);
  }
  
  weekStats.minutesStudied += minutesStudied;
  weekStats.lessonsCompleted += lessonsCompleted;
  weekStats.goalAchieved = weekStats.minutesStudied >= this.studyGoal.weeklyGoal;
};

module.exports = mongoose.model('Progress', progressSchema);
