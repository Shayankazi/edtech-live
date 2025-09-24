const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Course = require('../models/Course');
const aiService = require('../services/aiService');
const { authenticateToken, requireInstructor } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Configure multer for video uploads
const upload = multer({
  dest: path.join(__dirname, '../temp/'),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and audio files are allowed'));
    }
  }
});

// @route   POST /api/ai/transcribe
// @desc    Transcribe video/audio file
// @access  Private (Instructor)
router.post('/transcribe', [
  authenticateToken,
  requireInstructor,
  upload.single('media')
], async (req, res) => {
  let tempFiles = [];
  
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a video or audio file'
      });
    }

    const { language = 'en', courseId, lessonId } = req.body;
    const mediaPath = req.file.path;
    tempFiles.push(mediaPath);

    // Extract audio if video file
    let audioPath = mediaPath;
    if (req.file.mimetype.startsWith('video/')) {
      console.log('Extracting audio from video...');
      audioPath = await aiService.extractAudioFromVideo(mediaPath);
      tempFiles.push(audioPath);
    }

    // Transcribe audio
    console.log('Transcribing audio...');
    const transcription = await aiService.transcribeAudio(audioPath, language);

    // Generate SRT captions
    const srtContent = aiService.generateSRTCaptions(transcription.segments);

    // Save SRT file if needed
    let srtFilePath = null;
    if (courseId && lessonId) {
      const srtFileName = `${courseId}_${lessonId}_${language}.srt`;
      srtFilePath = path.join(__dirname, '../uploads/captions', srtFileName);
      
      // Ensure captions directory exists
      await fs.mkdir(path.dirname(srtFilePath), { recursive: true });
      await fs.writeFile(srtFilePath, srtContent);
    }

    // Update course lesson if provided
    if (courseId && lessonId) {
      try {
        const course = await Course.findById(courseId);
        if (course && course.instructor.toString() === req.user._id.toString()) {
          // Find and update the lesson
          for (const section of course.sections) {
            const lesson = section.lessons.id(lessonId);
            if (lesson) {
              lesson.transcript = transcription.text;
              
              // Update or add caption
              const existingCaption = lesson.captions.find(cap => cap.language === language);
              if (existingCaption) {
                existingCaption.content = srtContent;
                existingCaption.srtFile = srtFilePath ? `/uploads/captions/${path.basename(srtFilePath)}` : '';
              } else {
                lesson.captions.push({
                  language,
                  content: srtContent,
                  srtFile: srtFilePath ? `/uploads/captions/${path.basename(srtFilePath)}` : ''
                });
              }
              
              await course.save();
              break;
            }
          }
        }
      } catch (updateError) {
        console.error('Error updating course with transcription:', updateError);
      }
    }

    res.json({
      message: 'Transcription completed successfully',
      transcription: {
        text: transcription.text,
        language: transcription.language,
        segments: transcription.segments,
        wordCount: transcription.text.split(' ').length,
        duration: transcription.segments.length > 0 
          ? transcription.segments[transcription.segments.length - 1].end 
          : 0
      },
      captions: {
        srt: srtContent,
        filePath: srtFilePath ? `/uploads/captions/${path.basename(srtFilePath)}` : null
      }
    });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: 'Transcription failed',
      message: error.message || 'An error occurred during transcription'
    });
  } finally {
    // Cleanup temporary files
    if (tempFiles.length > 0) {
      aiService.cleanupFiles(tempFiles).catch(console.error);
    }
  }
});

// @route   POST /api/ai/translate
// @desc    Translate captions to different language
// @access  Private (Instructor)
router.post('/translate', [authenticateToken, requireInstructor], async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Text and target language are required'
      });
    }

    const translatedText = await aiService.translateText(text, targetLanguage, sourceLanguage);

    res.json({
      message: 'Translation completed successfully',
      translation: {
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage
      }
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message || 'An error occurred during translation'
    });
  }
});

// @route   POST /api/ai/summarize
// @desc    Generate lecture summary from transcript
// @access  Private (Instructor)
router.post('/summarize', [authenticateToken, requireInstructor], async (req, res) => {
  try {
    const { transcript, lessonTitle, courseId, lessonId } = req.body;

    if (!transcript) {
      return res.status(400).json({
        error: 'Missing transcript',
        message: 'Transcript text is required'
      });
    }

    const summary = await aiService.generateLectureSummary(transcript, lessonTitle);

    // Update course lesson if provided
    if (courseId && lessonId) {
      try {
        const course = await Course.findById(courseId);
        if (course && course.instructor.toString() === req.user._id.toString()) {
          // Find and update the lesson
          for (const section of course.sections) {
            const lesson = section.lessons.id(lessonId);
            if (lesson) {
              lesson.aiSummary = {
                summary: summary.summary,
                keyPoints: summary.keyPoints,
                generatedAt: new Date()
              };
              await course.save();
              break;
            }
          }
        }
      } catch (updateError) {
        console.error('Error updating course with summary:', updateError);
      }
    }

    res.json({
      message: 'Summary generated successfully',
      summary
    });

  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      error: 'Summarization failed',
      message: error.message || 'An error occurred during summarization'
    });
  }
});

// @route   POST /api/ai/generate-quiz
// @desc    Generate quiz questions from transcript
// @access  Private (Instructor)
router.post('/generate-quiz', [authenticateToken, requireInstructor], async (req, res) => {
  try {
    const { transcript, questionCount = 5, courseId, lessonId } = req.body;

    if (!transcript) {
      return res.status(400).json({
        error: 'Missing transcript',
        message: 'Transcript text is required'
      });
    }

    const questions = await aiService.generateQuizQuestions(transcript, parseInt(questionCount));

    // Update course lesson quiz if provided
    if (courseId && lessonId && questions.length > 0) {
      try {
        const course = await Course.findById(courseId);
        if (course && course.instructor.toString() === req.user._id.toString()) {
          // Find and update the lesson
          for (const section of course.sections) {
            const lesson = section.lessons.id(lessonId);
            if (lesson) {
              lesson.quiz = {
                questions: questions.map(q => ({
                  question: q.question,
                  type: 'multiple_choice',
                  options: q.options.map(opt => ({
                    text: opt,
                    isCorrect: opt.startsWith(q.correctAnswer)
                  })),
                  explanation: q.explanation,
                  points: 1
                })),
                passingScore: 70,
                timeLimit: Math.max(questionCount * 2, 10) // 2 minutes per question, min 10
              };
              await course.save();
              break;
            }
          }
        }
      } catch (updateError) {
        console.error('Error updating course with quiz:', updateError);
      }
    }

    res.json({
      message: 'Quiz generated successfully',
      quiz: {
        questionCount: questions.length,
        questions
      }
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      error: 'Quiz generation failed',
      message: error.message || 'An error occurred during quiz generation'
    });
  }
});

// @route   POST /api/ai/analyze-performance
// @desc    Analyze student performance and provide insights
// @access  Private
router.post('/analyze-performance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Gather student data
    const user = await User.findById(userId)
      .populate('enrolledCourses.course', 'title category');
    
    const progressRecords = await Progress.find({ user: userId })
      .populate('course', 'title category');

    // Calculate performance metrics
    const totalWatchTime = Math.round(user.totalWatchTime / 60); // Convert to minutes
    const coursesEnrolled = user.enrolledCourses.length;
    const completedCourses = user.enrolledCourses.filter(enrollment => enrollment.completed).length;
    const completionRate = coursesEnrolled > 0 ? Math.round((completedCourses / coursesEnrolled) * 100) : 0;
    
    // Calculate average quiz score
    let totalQuizScore = 0;
    let quizCount = 0;
    progressRecords.forEach(progress => {
      progress.completedLessons.forEach(lesson => {
        if (lesson.quizScore !== undefined) {
          totalQuizScore += lesson.quizScore;
          quizCount++;
        }
      });
    });
    const averageQuizScore = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;

    // Get current streak
    const currentStreak = Math.max(...progressRecords.map(p => p.streakDays), 0);

    // Identify weak areas (categories with low performance)
    const categoryPerformance = {};
    progressRecords.forEach(progress => {
      const category = progress.course.category;
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { total: 0, completed: 0 };
      }
      categoryPerformance[category].total++;
      if (progress.overallProgress >= 100) {
        categoryPerformance[category].completed++;
      }
    });

    const weakAreas = Object.entries(categoryPerformance)
      .filter(([category, data]) => data.total > 0 && (data.completed / data.total) < 0.5)
      .map(([category]) => category);

    const studentData = {
      totalWatchTime,
      coursesEnrolled,
      averageQuizScore,
      completionRate,
      streakDays: currentStreak,
      weakAreas
    };

    const insights = await aiService.analyzeStudentPerformance(studentData);

    res.json({
      message: 'Performance analysis completed',
      metrics: studentData,
      insights
    });

  } catch (error) {
    console.error('Performance analysis error:', error);
    res.status(500).json({
      error: 'Performance analysis failed',
      message: error.message || 'An error occurred during performance analysis'
    });
  }
});

// @route   GET /api/ai/supported-languages
// @desc    Get list of supported languages for transcription and translation
// @access  Public
router.get('/supported-languages', (req, res) => {
  const supportedLanguages = {
    transcription: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' }
    ],
    translation: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'sv', name: 'Swedish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'da', name: 'Danish' },
      { code: 'fi', name: 'Finnish' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' }
    ]
  };

  res.json({
    message: 'Supported languages retrieved successfully',
    languages: supportedLanguages
  });
});

module.exports = router;
