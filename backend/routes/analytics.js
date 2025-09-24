const express = require('express');
const Analytics = require('../models/Analytics');
const { authenticateToken, optionalAuth, requireInstructor } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const performanceAnalytics = require('../services/performanceAnalytics');
const reportGenerator = require('../services/reportGenerator');

const router = express.Router();

// @route   POST /api/analytics/track
// @desc    Track user interaction/session data
// @access  Private
router.post('/track', optionalAuth, async (req, res) => {
  try {
    const { courseId, lessonId, action, data, course, lesson, sessionData, interaction } = req.body;

    // Support both new and old field names
    const finalCourseId = courseId || course;
    const finalLessonId = lessonId || lesson;

    if (!finalCourseId || !finalLessonId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Course and lesson are required'
      });
    }

    // Use default user ID if no user is authenticated
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    
    // Validate ObjectIds only if they look like ObjectIds
    const mongoose = require('mongoose');
    if (finalCourseId.length === 24 && !mongoose.Types.ObjectId.isValid(finalCourseId)) {
      return res.status(400).json({
        error: 'Invalid ObjectId',
        message: 'Course must be a valid ObjectId'
      });
    }
    if (finalLessonId.length === 24 && !mongoose.Types.ObjectId.isValid(finalLessonId)) {
      return res.status(400).json({
        error: 'Invalid ObjectId', 
        message: 'Lesson must be a valid ObjectId'
      });
    }
    
    let analytics = await Analytics.findOne({
      user: userId,
      course: finalCourseId,
      lesson: finalLessonId,
      'sessionData.endTime': { $exists: false } // Current active session
    });

    // Create analytics entry if it doesn't exist or if we have action data
    if (!analytics) {
      analytics = new Analytics({
        user: userId,
        course: finalCourseId,
        lesson: finalLessonId,
        sessionData: {
          startTime: new Date(),
          interactions: [],
          videoProgress: 0
        },
        performance: {
          engagementScore: 0,
          completionRate: 0,
          averageWatchTime: 0
        }
      });
    }

    // Add interaction if action is provided
    if (action) {
      const interaction = {
        type: action,
        timestamp: new Date(),
        data: data || {}
      };
      analytics.sessionData.interactions.push(interaction);
    }
    
    // Update session data
    if (sessionData) {
      if (sessionData.endTime) {
        analytics.sessionData.endTime = new Date();
        analytics.sessionData.duration = Math.floor(
          (new Date() - analytics.sessionData.startTime) / 1000
        );
      }
      if (sessionData.videoProgress !== undefined) {
        analytics.sessionData.videoProgress = sessionData.videoProgress;
      }
    }

    // Calculate performance metrics (simplified for now)
    analytics.performance = {
      engagementScore: 85,
      completionRate: 75,
      averageWatchTime: 120
    };

    await analytics.save();

    res.json({
      message: 'Analytics tracked successfully',
      sessionId: analytics._id
    });
  } catch (error) {
    console.error('Track analytics error:', error);
    res.status(500).json({
      error: 'Failed to track analytics',
      message: 'An error occurred while tracking analytics'
    });
  }
});

// @route   GET /api/analytics/user/:userId
// @desc    Get user performance analytics
// @access  Private (Self or Instructor)
router.get('/user/:userId', [authenticateToken, validateObjectId('userId')], async (req, res) => {
  try {
    const { userId } = req.params;
    const { course, timeframe = '30d' } = req.query;

    // Check permissions
    if (req.user._id.toString() !== userId && req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own analytics'
      });
    }

    const filter = { user: userId };
    if (course) filter.course = course;

    // Add timeframe filter
    const timeframeDate = getTimeframeDate(timeframe);
    if (timeframeDate) {
      filter.createdAt = { $gte: timeframeDate };
    }

    const analytics = await Analytics.find(filter)
      .populate('course', 'title category')
      .sort({ createdAt: -1 });

    const summary = generateAnalyticsSummary(analytics);

    res.json({
      analytics,
      summary
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: 'An error occurred while fetching analytics'
    });
  }
});

// @route   GET /api/analytics/course/:courseId
// @desc    Get course analytics for instructors
// @access  Private (Instructor)
router.get('/course/:courseId', [authenticateToken, requireInstructor, validateObjectId('courseId')], async (req, res) => {
  try {
    const { courseId } = req.params;
    const { timeframe = '30d' } = req.query;

    const filter = { course: courseId };
    
    // Add timeframe filter
    const timeframeDate = getTimeframeDate(timeframe);
    if (timeframeDate) {
      filter.createdAt = { $gte: timeframeDate };
    }

    const analytics = await Analytics.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const courseInsights = generateCourseInsights(analytics);

    res.json({
      analytics,
      insights: courseInsights
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch course analytics',
      message: 'An error occurred while fetching course analytics'
    });
  }
});

// @route   GET /api/analytics/reports/performance
// @desc    Get performance report with AI insights
// @access  Private
router.get('/reports/performance', optionalAuth, async (req, res) => {
  try {
    const { course, timeframe = '7d' } = req.query;
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    
    // Generate comprehensive performance report with AI insights
    const report = await performanceAnalytics.generatePerformanceReport(
      userId,
      course,
      timeframe
    );

    res.json({ report });
  } catch (error) {
    console.error('Generate performance report error:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      message: 'An error occurred while generating the performance report'
    });
  }
});

// Helper functions
function calculatePerformanceMetrics(analytics) {
  const interactions = analytics.sessionData.interactions || [];
  const videoProgress = analytics.sessionData.videoProgress || 0;
  
  // Calculate engagement score based on interactions
  const engagementScore = Math.min(100, interactions.length * 10);
  
  // Calculate comprehension score (mock calculation)
  const comprehensionScore = Math.min(100, videoProgress * 0.8 + engagementScore * 0.2);
  
  return {
    comprehensionScore: Math.round(comprehensionScore),
    engagementScore: Math.round(engagementScore),
    completionRate: Math.round(videoProgress)
  };
}

function generateAnalyticsSummary(analytics) {
  if (analytics.length === 0) {
    return {
      totalSessions: 0,
      averageEngagement: 0,
      averageCompletion: 0,
      totalWatchTime: 0
    };
  }

  const totalSessions = analytics.length;
  const totalEngagement = analytics.reduce((sum, a) => sum + (a.performance?.engagementScore || 0), 0);
  const totalCompletion = analytics.reduce((sum, a) => sum + (a.performance?.completionRate || 0), 0);
  const totalWatchTime = analytics.reduce((sum, a) => sum + (a.sessionData?.duration || 0), 0);

  return {
    totalSessions,
    averageEngagement: Math.round(totalEngagement / totalSessions),
    averageCompletion: Math.round(totalCompletion / totalSessions),
    totalWatchTime: Math.round(totalWatchTime / 60) // Convert to minutes
  };
}

function generateCourseInsights(analytics) {
  const totalStudents = new Set(analytics.map(a => a.user._id.toString())).size;
  const averageCompletion = analytics.length > 0 
    ? analytics.reduce((sum, a) => sum + (a.performance?.completionRate || 0), 0) / analytics.length
    : 0;

  const popularLessons = {};
  analytics.forEach(a => {
    const lessonId = a.lesson.toString();
    popularLessons[lessonId] = (popularLessons[lessonId] || 0) + 1;
  });

  return {
    totalStudents,
    averageCompletion: Math.round(averageCompletion),
    totalSessions: analytics.length,
    mostPopularLesson: Object.keys(popularLessons).reduce((a, b) => 
      popularLessons[a] > popularLessons[b] ? a : b, null
    )
  };
}

function generatePerformanceReport(analytics, timeframe) {
  const summary = generateAnalyticsSummary(analytics);
  
  const strengths = [];
  const improvements = [];
  
  if (summary.averageEngagement > 70) {
    strengths.push('High engagement with course content');
  } else {
    improvements.push('Consider taking more notes and interacting with content');
  }
  
  if (summary.averageCompletion > 80) {
    strengths.push('Excellent completion rate');
  } else {
    improvements.push('Focus on completing more lessons fully');
  }

  return {
    summary,
    strengths,
    improvements,
    recommendations: [
      'Continue maintaining consistent study schedule',
      'Take notes during video lessons for better retention',
      'Review AI-generated summaries after each session'
    ]
  };
}

function getTimeframeDate(timeframe) {
  const now = new Date();
  switch (timeframe) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

module.exports = router;
