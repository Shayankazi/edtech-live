const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  constructor() {
    this.geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Extract audio from video file using FFmpeg
   * @param {string} videoPath - Path to video file
   * @returns {Promise<string>} - Path to extracted audio file
   */
  async extractAudioFromVideo(videoPath) {
    return new Promise((resolve, reject) => {
      const audioPath = videoPath.replace(path.extname(videoPath), '.wav');
      
      ffmpeg(videoPath)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => {
          console.log('Audio extraction completed');
          resolve(audioPath);
        })
        .on('error', (err) => {
          console.error('Audio extraction error:', err);
          reject(err);
        })
        .save(audioPath);
    });
  }

  /**
   * Transcribe audio using OpenAI Whisper
   * @param {string} audioPath - Path to audio file
   * @param {string} language - Language code (optional)
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribeAudio(audioPath, language = 'en') {
    try {
      const audioFile = await fs.readFile(audioPath);
      
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioFile], path.basename(audioPath), { type: 'audio/wav' }),
        model: 'whisper-1',
        language: language,
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment']
      });

      return {
        text: transcription.text,
        segments: transcription.segments || [],
        words: transcription.words || [],
        language: transcription.language || language
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Generate SRT captions from transcription segments
   * @param {Array} segments - Transcription segments with timestamps
   * @returns {string} - SRT formatted captions
   */
  generateSRTCaptions(segments) {
    let srtContent = '';
    
    segments.forEach((segment, index) => {
      const startTime = this.formatSRTTime(segment.start);
      const endTime = this.formatSRTTime(segment.end);
      
      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${segment.text.trim()}\n\n`;
    });
    
    return srtContent;
  }

  /**
   * Format time for SRT captions
   * @param {number} seconds - Time in seconds
   * @returns {string} - Formatted time (HH:MM:SS,mmm)
   */
  formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
  }

  /**
   * Translate text using LibreTranslate (free alternative)
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code
   * @param {string} sourceLanguage - Source language code
   * @returns {Promise<string>} - Translated text
   */
  async translateText(text, targetLanguage, sourceLanguage = 'en') {
    try {
      // Using LibreTranslate API (free and open source)
      const response = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback to Google Translate API if available
      try {
        return await this.translateWithGoogle(text, targetLanguage, sourceLanguage);
      } catch (googleError) {
        console.error('Google Translate fallback error:', googleError);
        throw new Error(`Failed to translate text: ${error.message}`);
      }
    }
  }

  /**
   * Translate using Google Translate API (fallback)
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code
   * @param {string} sourceLanguage - Source language code
   * @returns {Promise<string>} - Translated text
   */
  async translateWithGoogle(text, targetLanguage, sourceLanguage = 'en') {
    // This would require Google Translate API setup
    // For now, return original text as fallback
    console.warn('Google Translate API not configured, returning original text');
    return text;
  }

  /**
   * Generate lecture summary using Gemini AI
   * @param {string} transcript - Full transcript text
   * @param {string} lessonTitle - Title of the lesson
   * @returns {Promise<Object>} - Summary and key points
   */
  async generateLectureSummary(transcript, lessonTitle = '') {
    try {
      const prompt = `
        Please analyze this lecture transcript and provide:
        1. A concise summary (2-3 paragraphs)
        2. Key learning points (5-7 bullet points)
        3. Important concepts or terms mentioned
        4. Suggested follow-up questions for students

        Lesson Title: ${lessonTitle}
        
        Transcript:
        ${transcript}

        Please format your response as JSON with the following structure:
        {
          "summary": "...",
          "keyPoints": ["point 1", "point 2", ...],
          "concepts": ["concept 1", "concept 2", ...],
          "followUpQuestions": ["question 1", "question 2", ...]
        }
      `;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON response, using fallback format');
      }

      // Fallback: extract information manually
      return {
        summary: this.extractSection(text, 'summary') || text.substring(0, 500),
        keyPoints: this.extractListItems(text, 'key points') || [],
        concepts: this.extractListItems(text, 'concepts') || [],
        followUpQuestions: this.extractListItems(text, 'questions') || []
      };
    } catch (error) {
      console.error('Summary generation error:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Generate quiz questions from transcript
   * @param {string} transcript - Lecture transcript
   * @param {number} questionCount - Number of questions to generate
   * @returns {Promise<Array>} - Array of quiz questions
   */
  async generateQuizQuestions(transcript, questionCount = 5) {
    try {
      const prompt = `
        Based on this lecture transcript, generate ${questionCount} multiple-choice questions to test student understanding.
        
        For each question, provide:
        - A clear question
        - 4 answer options (A, B, C, D)
        - The correct answer
        - A brief explanation
        
        Transcript:
        ${transcript}
        
        Format as JSON array:
        [
          {
            "question": "...",
            "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
            "correctAnswer": "A",
            "explanation": "..."
          }
        ]
      `;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse quiz JSON, returning empty array');
      }

      return [];
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  /**
   * Analyze student performance and provide insights
   * @param {Object} studentData - Student progress and quiz data
   * @returns {Promise<Object>} - Performance insights
   */
  async analyzeStudentPerformance(studentData) {
    try {
      const prompt = `
        Analyze this student's learning performance and provide insights:
        
        Student Data:
        - Total watch time: ${studentData.totalWatchTime} minutes
        - Courses enrolled: ${studentData.coursesEnrolled}
        - Average quiz score: ${studentData.averageQuizScore}%
        - Completion rate: ${studentData.completionRate}%
        - Streak days: ${studentData.streakDays}
        - Weak areas: ${studentData.weakAreas?.join(', ') || 'None identified'}
        
        Provide:
        1. Overall performance assessment
        2. Strengths and areas for improvement
        3. Personalized recommendations
        4. Study plan suggestions
        
        Format as JSON:
        {
          "overallAssessment": "...",
          "strengths": ["..."],
          "improvements": ["..."],
          "recommendations": ["..."],
          "studyPlan": "..."
        }
      `;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse performance analysis JSON');
      }

      return {
        overallAssessment: "Performance analysis completed",
        strengths: [],
        improvements: [],
        recommendations: [],
        studyPlan: "Continue with current learning pace"
      };
    } catch (error) {
      console.error('Performance analysis error:', error);
      throw new Error(`Failed to analyze performance: ${error.message}`);
    }
  }

  /**
   * Helper method to extract sections from text
   * @param {string} text - Text to search
   * @param {string} sectionName - Section name to find
   * @returns {string|null} - Extracted section content
   */
  extractSection(text, sectionName) {
    const regex = new RegExp(`${sectionName}[:\\s]*(.*?)(?=\\n\\n|$)`, 'is');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Helper method to extract list items from text
   * @param {string} text - Text to search
   * @param {string} listName - List name to find
   * @returns {Array} - Extracted list items
   */
  extractListItems(text, listName) {
    const regex = new RegExp(`${listName}[:\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
    const match = text.match(regex);
    
    if (!match) return [];
    
    const listText = match[1];
    const items = listText
      .split(/[\n•\-\*]/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && !item.match(/^\d+[\.\)]/));
    
    return items.slice(0, 10); // Limit to 10 items
  }

  /**
   * Clean up temporary files
   * @param {Array} filePaths - Array of file paths to delete
   */
  async cleanupFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      } catch (error) {
        console.warn(`Failed to cleanup file ${filePath}:`, error.message);
      }
    }
  }
}

module.exports = new AIService();
