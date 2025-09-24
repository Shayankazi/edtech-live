const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  /**
   * Summarize notes using Gemini AI
   */
  async summarizeNotes(notes, context = {}) {
    if (!this.apiKey || !this.model) {
      console.log('Gemini API not configured, using mock summary');
      return this.generateMockSummary(notes);
    }

    try {
      const notesText = Array.isArray(notes) 
        ? notes.map(n => `[${n.timestamp || 'Note'}]: ${n.content}`).join('\n')
        : notes;

      const prompt = `You are an educational AI assistant. Summarize the following study notes concisely and effectively.

Course: ${context.courseTitle || 'Educational Content'}
Lesson: ${context.lessonTitle || 'Video Lesson'}

Student Notes:
${notesText}

Please provide:
1. A brief summary (2-3 sentences)
2. Key points (bullet list)
3. Action items or areas to review

Format the response in a clear, student-friendly manner.`;

      console.log('Calling Gemini API for note summarization...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      console.log('Gemini API response received');
      return {
        summary,
        keyPoints: this.extractKeyPoints(summary),
        generatedAt: new Date(),
        model: 'gemini-1.5-flash',
        confidence: 0.95
      };
    } catch (error) {
      console.error('Gemini summarization error:', error.message);
      console.error('Full error:', error);
      return this.generateMockSummary(notes);
    }
  }

  /**
   * Generate performance insights using Gemini AI
   */
  async generatePerformanceInsights(analyticsData) {
    if (!this.apiKey || !this.model) {
      return this.generateMockInsights(analyticsData);
    }

    try {
      const prompt = `
        Analyze the following student performance data and provide personalized insights:
        
        Performance Metrics:
        - Total Sessions: ${analyticsData.totalSessions || 0}
        - Average Engagement: ${analyticsData.averageEngagement || 0}%
        - Completion Rate: ${analyticsData.completionRate || 0}%
        - Total Watch Time: ${analyticsData.totalWatchTime || 0} minutes
        - Quiz Scores: ${JSON.stringify(analyticsData.quizScores || [])}
        - Topics Covered: ${JSON.stringify(analyticsData.topics || [])}
        - Interaction Patterns: ${JSON.stringify(analyticsData.patterns || [])}
        
        Please provide:
        1. Strengths (2-3 specific areas where the student excels)
        2. Areas for Improvement (2-3 specific topics that need more practice)
        3. Personalized Recommendations (3-4 actionable study tips)
        4. Learning Pattern Analysis (brief insight into their learning style)
        
        Make the feedback encouraging, specific, and actionable. Use a supportive tone.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const insights = response.text();

      // Parse the insights into structured format
      return this.parseInsights(insights);
    } catch (error) {
      console.error('Gemini insights error:', error);
      return this.generateMockInsights(analyticsData);
    }
  }

  /**
   * Generate quiz feedback using Gemini AI
   */
  async generateQuizFeedback(quizData) {
    if (!this.apiKey || !this.model) {
      return this.generateMockQuizFeedback(quizData);
    }

    try {
      const prompt = `
        Analyze this quiz performance and provide constructive feedback:
        
        Quiz: ${quizData.title}
        Score: ${quizData.score}/${quizData.totalQuestions}
        Time Taken: ${quizData.timeTaken} minutes
        
        Questions Analysis:
        ${quizData.questions.map(q => `
          Q: ${q.question}
          Student Answer: ${q.studentAnswer}
          Correct Answer: ${q.correctAnswer}
          Result: ${q.isCorrect ? '✓' : '✗'}
        `).join('\n')}
        
        Provide:
        1. Overall performance summary
        2. Specific feedback for incorrect answers
        3. Study recommendations
        4. Encouragement and next steps
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        feedback: response.text(),
        generatedAt: new Date(),
        model: 'gemini-pro'
      };
    } catch (error) {
      console.error('Gemini quiz feedback error:', error);
      return this.generateMockQuizFeedback(quizData);
    }
  }

  /**
   * Parse Gemini insights into structured format
   */
  parseInsights(insightsText) {
    // Simple parsing - in production, use more sophisticated NLP
    const lines = insightsText.split('\n').filter(line => line.trim());
    
    const strengths = [];
    const improvements = [];
    const recommendations = [];
    let learningPattern = '';
    
    let currentSection = '';
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('strength')) {
        currentSection = 'strengths';
      } else if (lowerLine.includes('improvement') || lowerLine.includes('area')) {
        currentSection = 'improvements';
      } else if (lowerLine.includes('recommendation')) {
        currentSection = 'recommendations';
      } else if (lowerLine.includes('pattern') || lowerLine.includes('style')) {
        currentSection = 'pattern';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const item = line.replace(/^[-•]\s*/, '').trim();
        
        switch (currentSection) {
          case 'strengths':
            strengths.push(item);
            break;
          case 'improvements':
            improvements.push(item);
            break;
          case 'recommendations':
            recommendations.push(item);
            break;
        }
      } else if (currentSection === 'pattern' && line.trim()) {
        learningPattern += line + ' ';
      }
    }
    
    return {
      strengths: strengths.length ? strengths : ['Consistent engagement', 'Good video completion rate'],
      improvements: improvements.length ? improvements : ['Practice more complex topics', 'Review fundamentals'],
      recommendations: recommendations.length ? recommendations : [
        'Set daily learning goals',
        'Take notes during videos',
        'Complete practice quizzes'
      ],
      learningPattern: learningPattern.trim() || 'Visual learner with good retention',
      generatedAt: new Date(),
      model: 'gemini-pro'
    };
  }

  /**
   * Extract key points from summary text
   */
  extractKeyPoints(summaryText) {
    const lines = summaryText.split('\n');
    const keyPoints = [];
    
    for (const line of lines) {
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        keyPoints.push(line.trim().replace(/^[•\-*]\s*/, ''));
      }
    }
    
    return keyPoints.length > 0 ? keyPoints : [
      'Review main concepts covered',
      'Practice key techniques',
      'Focus on understanding fundamentals'
    ];
  }

  /**
   * Generate mock summary for testing
   */
  generateMockSummary(notes) {
    const noteCount = Array.isArray(notes) ? notes.length : 1;
    
    return {
      summary: `This lesson covered ${noteCount} key concepts. The main focus was on understanding fundamental principles and their practical applications. Students should review the highlighted sections and practice the demonstrated techniques.`,
      keyPoints: [
        'Understanding fundamental principles',
        'Practical applications of concepts',
        'Review highlighted sections',
        'Practice demonstrated techniques'
      ],
      generatedAt: new Date(),
      model: 'mock',
      confidence: 0.85
    };
  }

  /**
   * Generate mock insights for testing
   */
  generateMockInsights(analyticsData) {
    const engagement = analyticsData.averageEngagement || 75;
    const completion = analyticsData.completionRate || 80;
    
    const strengths = [];
    const improvements = [];
    
    if (engagement > 70) {
      strengths.push('Excellent engagement with course materials');
      strengths.push('Consistent learning habits');
    }
    if (completion > 75) {
      strengths.push('Strong course completion rate');
    }
    
    if (engagement < 80) {
      improvements.push('Increase interaction with video controls and features');
    }
    if (completion < 90) {
      improvements.push('Complete all lesson materials for better understanding');
    }
    
    return {
      strengths: strengths.length ? strengths : ['Good progress overall'],
      improvements: improvements.length ? improvements : ['Continue current learning pace'],
      recommendations: [
        'Review notes after each session',
        'Practice with quiz questions',
        'Join study groups for discussion',
        'Set specific learning goals'
      ],
      learningPattern: 'Balanced learner with steady progress',
      generatedAt: new Date(),
      model: 'mock'
    };
  }

  /**
   * Generate mock quiz feedback
   */
  generateMockQuizFeedback(quizData) {
    const percentage = (quizData.score / quizData.totalQuestions) * 100;
    let feedback = '';
    
    if (percentage >= 90) {
      feedback = 'Excellent work! You have a strong grasp of the material.';
    } else if (percentage >= 70) {
      feedback = 'Good job! Review the incorrect answers to strengthen your understanding.';
    } else if (percentage >= 50) {
      feedback = 'Keep practicing! Focus on the topics you found challenging.';
    } else {
      feedback = 'This is a learning opportunity. Review the material and try again.';
    }
    
    return {
      feedback: `${feedback} You scored ${quizData.score} out of ${quizData.totalQuestions}. ${
        quizData.timeTaken < 10 
          ? 'Great time management!' 
          : 'Take your time to read questions carefully.'
      }`,
      generatedAt: new Date(),
      model: 'mock'
    };
  }
}

module.exports = new GeminiService();
