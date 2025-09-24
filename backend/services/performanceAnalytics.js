const Analytics = require('../models/Analytics');
const geminiService = require('./geminiService');

class PerformanceAnalyticsService {
  /**
   * Calculate comprehensive performance metrics
   */
  async calculatePerformanceMetrics(userId, courseId, timeframe = '7d') {
    const dateFilter = this.getDateFilter(timeframe);
    
    const analytics = await Analytics.find({
      user: userId,
      ...(courseId && { course: courseId }),
      createdAt: { $gte: dateFilter }
    });

    if (!analytics.length) {
      return this.getDefaultMetrics();
    }

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(analytics);
    
    // Calculate completion rate
    const completionRate = this.calculateCompletionRate(analytics);
    
    // Calculate average watch time
    const averageWatchTime = this.calculateAverageWatchTime(analytics);
    
    // Track quiz performance
    const quizPerformance = await this.getQuizPerformance(userId, courseId, dateFilter);
    
    // Identify learning patterns
    const learningPatterns = this.identifyLearningPatterns(analytics);
    
    // Topic-wise performance
    const topicPerformance = await this.getTopicPerformance(analytics);

    return {
      engagementScore,
      completionRate,
      averageWatchTime,
      quizPerformance,
      learningPatterns,
      topicPerformance,
      totalSessions: analytics.length,
      timeframe,
      calculatedAt: new Date()
    };
  }

  /**
   * Generate AI-powered performance report
   */
  async generatePerformanceReport(userId, courseId, timeframe = '30d') {
    const metrics = await this.calculatePerformanceMetrics(userId, courseId, timeframe);
    
    // Get AI insights from Gemini
    const insights = await geminiService.generatePerformanceInsights({
      totalSessions: metrics.totalSessions,
      averageEngagement: metrics.engagementScore,
      completionRate: metrics.completionRate,
      totalWatchTime: metrics.averageWatchTime,
      quizScores: metrics.quizPerformance.scores,
      topics: metrics.topicPerformance.topics,
      patterns: metrics.learningPatterns
    });

    return {
      metrics,
      insights,
      summary: {
        totalSessions: metrics.totalSessions,
        averageEngagement: `${metrics.engagementScore}%`,
        averageCompletion: `${metrics.completionRate}%`,
        totalWatchTime: `${Math.round(metrics.averageWatchTime / 60)}h ${metrics.averageWatchTime % 60}m`
      },
      strengths: insights.strengths,
      improvements: insights.improvements,
      recommendations: insights.recommendations,
      learningPattern: insights.learningPattern,
      generatedAt: new Date()
    };
  }

  /**
   * Calculate engagement score based on interactions
   */
  calculateEngagementScore(analytics) {
    if (!analytics.length) return 0;

    const scores = analytics.map(session => {
      const interactions = session.sessionData?.interactions || [];
      const duration = session.sessionData?.duration || 0;
      
      // Points for different interactions
      const interactionPoints = interactions.reduce((total, interaction) => {
        switch (interaction.type) {
          case 'video_play': return total + 10;
          case 'video_pause': return total + 5;
          case 'video_seek': return total + 3;
          case 'note_created': return total + 15;
          case 'quiz_completed': return total + 20;
          case 'fullscreen_toggle': return total + 5;
          default: return total + 2;
        }
      }, 0);

      // Normalize by duration (interactions per minute)
      const normalizedScore = duration > 0 
        ? (interactionPoints / (duration / 60)) * 10
        : interactionPoints;

      return Math.min(100, normalizedScore);
    });

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * Calculate completion rate
   */
  calculateCompletionRate(analytics) {
    if (!analytics.length) return 0;

    const completedSessions = analytics.filter(session => {
      const progress = session.sessionData?.videoProgress || 0;
      return progress >= 90; // Consider 90% as completed
    });

    return Math.round((completedSessions.length / analytics.length) * 100);
  }

  /**
   * Calculate average watch time in minutes
   */
  calculateAverageWatchTime(analytics) {
    if (!analytics.length) return 0;

    const totalTime = analytics.reduce((total, session) => {
      const duration = session.sessionData?.duration || 0;
      return total + duration;
    }, 0);

    return Math.round(totalTime / analytics.length / 60); // Convert to minutes
  }

  /**
   * Get quiz performance data
   */
  async getQuizPerformance(userId, courseId, dateFilter) {
    // In a real implementation, this would query a Quiz model
    // For now, return mock data
    return {
      totalQuizzes: 5,
      averageScore: 82,
      scores: [75, 88, 90, 78, 85],
      strongTopics: ['Algorithms', 'Data Structures'],
      weakTopics: ['Graph Theory', 'Dynamic Programming']
    };
  }

  /**
   * Identify learning patterns
   */
  identifyLearningPatterns(analytics) {
    const patterns = {
      preferredTime: this.getPreferredStudyTime(analytics),
      sessionLength: this.getAverageSessionLength(analytics),
      interactionStyle: this.getInteractionStyle(analytics),
      consistency: this.getStudyConsistency(analytics)
    };

    return patterns;
  }

  /**
   * Get topic-wise performance
   */
  async getTopicPerformance(analytics) {
    // Group by course/lesson and calculate performance
    const topicMap = new Map();

    for (const session of analytics) {
      const topic = session.lesson?.toString() || 'General';
      
      if (!topicMap.has(topic)) {
        topicMap.set(topic, {
          sessions: 0,
          totalTime: 0,
          engagement: 0
        });
      }

      const topicData = topicMap.get(topic);
      topicData.sessions += 1;
      topicData.totalTime += session.sessionData?.duration || 0;
      topicData.engagement += session.performance?.engagementScore || 0;
    }

    const topics = Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      sessions: data.sessions,
      averageTime: Math.round(data.totalTime / data.sessions / 60),
      averageEngagement: Math.round(data.engagement / data.sessions)
    }));

    return {
      topics,
      strongestTopic: topics.sort((a, b) => b.averageEngagement - a.averageEngagement)[0],
      needsImprovement: topics.sort((a, b) => a.averageEngagement - b.averageEngagement)[0]
    };
  }

  /**
   * Get preferred study time
   */
  getPreferredStudyTime(analytics) {
    const hourCounts = new Array(24).fill(0);

    analytics.forEach(session => {
      const hour = new Date(session.createdAt).getHours();
      hourCounts[hour]++;
    });

    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    if (maxHour < 6) return 'Early Morning (12 AM - 6 AM)';
    if (maxHour < 12) return 'Morning (6 AM - 12 PM)';
    if (maxHour < 18) return 'Afternoon (12 PM - 6 PM)';
    return 'Evening (6 PM - 12 AM)';
  }

  /**
   * Get average session length
   */
  getAverageSessionLength(analytics) {
    if (!analytics.length) return 'No data';

    const avgMinutes = this.calculateAverageWatchTime(analytics);
    
    if (avgMinutes < 15) return 'Short (< 15 min)';
    if (avgMinutes < 30) return 'Medium (15-30 min)';
    if (avgMinutes < 60) return 'Long (30-60 min)';
    return 'Extended (> 60 min)';
  }

  /**
   * Get interaction style
   */
  getInteractionStyle(analytics) {
    let totalInteractions = 0;
    let noteCount = 0;
    let seekCount = 0;

    analytics.forEach(session => {
      const interactions = session.sessionData?.interactions || [];
      totalInteractions += interactions.length;
      noteCount += interactions.filter(i => i.type === 'note_created').length;
      seekCount += interactions.filter(i => i.type === 'video_seek').length;
    });

    if (noteCount > totalInteractions * 0.3) return 'Note-taker';
    if (seekCount > totalInteractions * 0.3) return 'Explorer';
    if (totalInteractions / analytics.length > 10) return 'Active';
    return 'Passive';
  }

  /**
   * Get study consistency
   */
  getStudyConsistency(analytics) {
    if (analytics.length < 2) return 'New learner';

    const dates = analytics.map(s => new Date(s.createdAt).toDateString());
    const uniqueDates = new Set(dates).size;
    const daySpan = Math.ceil(
      (new Date(analytics[analytics.length - 1].createdAt) - new Date(analytics[0].createdAt)) 
      / (1000 * 60 * 60 * 24)
    );

    const consistency = uniqueDates / Math.max(daySpan, 1);

    if (consistency > 0.8) return 'Very consistent';
    if (consistency > 0.5) return 'Consistent';
    if (consistency > 0.3) return 'Somewhat consistent';
    return 'Irregular';
  }

  /**
   * Get date filter based on timeframe
   */
  getDateFilter(timeframe) {
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  }

  /**
   * Get default metrics when no data available
   */
  getDefaultMetrics() {
    return {
      engagementScore: 0,
      completionRate: 0,
      averageWatchTime: 0,
      quizPerformance: {
        totalQuizzes: 0,
        averageScore: 0,
        scores: [],
        strongTopics: [],
        weakTopics: []
      },
      learningPatterns: {
        preferredTime: 'No data',
        sessionLength: 'No data',
        interactionStyle: 'No data',
        consistency: 'New learner'
      },
      topicPerformance: {
        topics: [],
        strongestTopic: null,
        needsImprovement: null
      },
      totalSessions: 0
    };
  }
}

module.exports = new PerformanceAnalyticsService();
