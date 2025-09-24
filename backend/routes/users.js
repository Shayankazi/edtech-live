const express = require('express');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validateUserUpdate, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.course', 'title thumbnail instructor')
      .populate('wishlist', 'title thumbnail price instructor')
      .populate('createdCourses', 'title thumbnail enrollmentCount rating');

    res.json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'An error occurred while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [authenticateToken, validateUserUpdate], async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user._id);

    // Update allowed fields
    const allowedUpdates = ['name', 'bio', 'interests', 'preferences'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile'
    });
  }
});

// @route   POST /api/users/wishlist/:courseId
// @desc    Add course to wishlist
// @access  Private
router.post('/wishlist/:courseId', [authenticateToken, validateObjectId('courseId')], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const courseId = req.params.courseId;

    // Check if already in wishlist
    if (user.wishlist.includes(courseId)) {
      return res.status(400).json({
        error: 'Already in wishlist',
        message: 'Course is already in your wishlist'
      });
    }

    // Check if already enrolled
    const isEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === courseId
    );

    if (isEnrolled) {
      return res.status(400).json({
        error: 'Already enrolled',
        message: 'You are already enrolled in this course'
      });
    }

    user.wishlist.push(courseId);
    await user.save();

    res.json({
      message: 'Course added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      error: 'Failed to add to wishlist',
      message: 'An error occurred while adding course to wishlist'
    });
  }
});

// @route   DELETE /api/users/wishlist/:courseId
// @desc    Remove course from wishlist
// @access  Private
router.delete('/wishlist/:courseId', [authenticateToken, validateObjectId('courseId')], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const courseId = req.params.courseId;

    user.wishlist = user.wishlist.filter(id => id.toString() !== courseId);
    await user.save();

    res.json({
      message: 'Course removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      error: 'Failed to remove from wishlist',
      message: 'An error occurred while removing course from wishlist'
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.course', 'title thumbnail instructor totalDuration');

    const progressRecords = await Progress.find({ user: req.user._id })
      .populate('course', 'title thumbnail')
      .sort({ lastAccessedAt: -1 })
      .limit(5);

    // Calculate dashboard metrics
    const totalCourses = user.enrolledCourses.length;
    const completedCourses = user.enrolledCourses.filter(enrollment => enrollment.completed).length;
    const inProgressCourses = totalCourses - completedCourses;
    const totalWatchTime = Math.round(user.totalWatchTime / 60); // Convert to minutes

    // Get current streak
    const currentStreak = Math.max(...progressRecords.map(p => p.streakDays), 0);

    // Get recent activity
    const recentActivity = progressRecords.map(progress => ({
      course: progress.course,
      progress: progress.overallProgress,
      lastAccessed: progress.lastAccessedAt,
      currentLesson: progress.currentLesson
    }));

    // Get achievements
    const achievements = user.achievements.sort((a, b) => b.earnedAt - a.earnedAt).slice(0, 5);

    res.json({
      message: 'Dashboard data retrieved successfully',
      dashboard: {
        metrics: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalWatchTime,
          currentStreak
        },
        recentActivity,
        achievements,
        user: {
          name: user.name,
          avatar: user.avatar,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get dashboard',
      message: 'An error occurred while fetching dashboard data'
    });
  }
});

// @route   GET /api/users/learning-stats
// @desc    Get detailed learning statistics
// @access  Private
router.get('/learning-stats', authenticateToken, async (req, res) => {
  try {
    const progressRecords = await Progress.find({ user: req.user._id })
      .populate('course', 'title category');

    // Calculate category-wise progress
    const categoryStats = {};
    progressRecords.forEach(progress => {
      const category = progress.course.category;
      if (!categoryStats[category]) {
        categoryStats[category] = {
          totalCourses: 0,
          completedCourses: 0,
          totalWatchTime: 0,
          averageProgress: 0
        };
      }
      
      categoryStats[category].totalCourses++;
      categoryStats[category].totalWatchTime += progress.totalWatchTime;
      categoryStats[category].averageProgress += progress.overallProgress;
      
      if (progress.overallProgress >= 100) {
        categoryStats[category].completedCourses++;
      }
    });

    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.averageProgress = Math.round(stats.averageProgress / stats.totalCourses);
      stats.totalWatchTime = Math.round(stats.totalWatchTime / 60); // Convert to minutes
    });

    // Get weekly progress for the last 8 weeks
    const weeklyStats = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      let weeklyMinutes = 0;
      let weeklyLessons = 0;
      
      progressRecords.forEach(progress => {
        const weekStats = progress.getWeeklyStats(weekStart);
        weeklyMinutes += weekStats.minutesStudied;
        weeklyLessons += weekStats.lessonsCompleted;
      });
      
      weeklyStats.push({
        week: weekStart,
        minutesStudied: weeklyMinutes,
        lessonsCompleted: weeklyLessons
      });
    }

    res.json({
      message: 'Learning statistics retrieved successfully',
      stats: {
        categoryStats,
        weeklyStats,
        totalProgressRecords: progressRecords.length
      }
    });
  } catch (error) {
    console.error('Get learning stats error:', error);
    res.status(500).json({
      error: 'Failed to get learning statistics',
      message: 'An error occurred while fetching learning statistics'
    });
  }
});

module.exports = router;
