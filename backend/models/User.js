const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google OAuth user
    },
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  interests: [{
    type: String,
    trim: true
  }],
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    certificateIssued: {
      type: Boolean,
      default: false
    }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  totalWatchTime: {
    type: Number,
    default: 0 // in minutes
  },
  achievements: [{
    type: {
      type: String,
      enum: ['first_course', 'course_completed', 'streak_7', 'streak_30', 'top_performer']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  }],
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    autoGenerateNotes: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'enrolledCourses.course': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user's enrolled course progress
userSchema.methods.getCourseProgress = function(courseId) {
  const enrollment = this.enrolledCourses.find(
    enrollment => enrollment.course.toString() === courseId.toString()
  );
  return enrollment ? enrollment.progress : 0;
};

// Add course to enrolled courses
userSchema.methods.enrollInCourse = function(courseId) {
  const alreadyEnrolled = this.enrolledCourses.some(
    enrollment => enrollment.course.toString() === courseId.toString()
  );
  
  if (!alreadyEnrolled) {
    this.enrolledCourses.push({ course: courseId });
  }
};

// Update course progress
userSchema.methods.updateCourseProgress = function(courseId, progress) {
  const enrollment = this.enrolledCourses.find(
    enrollment => enrollment.course.toString() === courseId.toString()
  );
  
  if (enrollment) {
    enrollment.progress = Math.max(enrollment.progress, progress);
    if (progress >= 100) {
      enrollment.completed = true;
    }
  }
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
