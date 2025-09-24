const express = require('express');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateProgressUpdate, validateNote, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/progress/:courseId
// @desc    Get user progress for a specific course
// @access  Private
router.get('/:courseId', [authenticateToken, validateObjectId('courseId')], async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    }).populate('course', 'title totalLessons totalDuration');

    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found',
        message: 'No progress record found for this course'
      });
    }

    res.json({
      message: 'Progress retrieved successfully',
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      error: 'Failed to get progress',
      message: 'An error occurred while fetching progress'
    });
  }
});

// @route   POST /api/progress/:courseId/lesson-complete
// @desc    Mark lesson as completed
// @access  Private
router.post('/:courseId/lesson-complete', [
  authenticateToken,
  validateObjectId('courseId'),
  validateProgressUpdate
], async (req, res) => {
  try {
    const { lessonId, sectionId, watchTime = 0, quizScore } = req.body;
    
    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      // Create new progress record if doesn't exist
      progress = new Progress({
        user: req.user._id,
        course: req.params.courseId
      });
    }

    // Mark lesson as completed
    progress.completeLesson(lessonId, sectionId, watchTime, quizScore);
    
    // Calculate overall progress
    await progress.calculateProgress();
    
    // Update weekly stats
    progress.updateWeeklyStats(Math.round(watchTime / 60), 1);
    
    await progress.save();

    // Update user's total watch time
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalWatchTime: watchTime }
    });

    // Check for achievements
    await checkAndAwardAchievements(req.user._id, progress);

    res.json({
      message: 'Lesson marked as completed',
      progress: {
        overallProgress: progress.overallProgress,
        completedLessons: progress.completedLessons.length,
        streakDays: progress.streakDays
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      error: 'Failed to mark lesson as completed',
      message: 'An error occurred while updating progress'
    });
  }
});

// @route   POST /api/progress/:courseId/update-position
// @desc    Update current lesson position
// @access  Private
router.post('/:courseId/update-position', [
  authenticateToken,
  validateObjectId('courseId')
], async (req, res) => {
  try {
    const { lessonId, sectionId, position = 0 } = req.body;
    
    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      // Create new progress record if doesn't exist
      progress = new Progress({
        user: req.user._id,
        course: req.params.courseId
      });
    }

    // Update current lesson position
    progress.updateCurrentLesson(lessonId, sectionId, position);
    await progress.save();

    res.json({
      message: 'Position updated successfully',
      currentLesson: progress.currentLesson
    });
  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({
      error: 'Failed to update position',
      message: 'An error occurred while updating lesson position'
    });
  }
});

// @route   POST /api/progress/:courseId/notes
// @desc    Add note to lesson
// @access  Private
router.post('/:courseId/notes', [
  authenticateToken,
  validateObjectId('courseId'),
  validateNote
], async (req, res) => {
  try {
    const { lessonId, content, timestamp, aiGenerated = false } = req.body;
    
    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        course: req.params.courseId
      });
    }

    progress.addNote(lessonId, content, timestamp, aiGenerated);
    await progress.save();

    const newNote = progress.notes[progress.notes.length - 1];

    res.json({
      message: 'Note added successfully',
      note: newNote
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      error: 'Failed to add note',
      message: 'An error occurred while adding the note'
    });
  }
});

// @route   GET /api/progress/:courseId/notes/:lessonId
// @desc    Get notes for a specific lesson
// @access  Private
router.get('/:courseId/notes/:lessonId', [
  authenticateToken,
  validateObjectId('courseId'),
  validateObjectId('lessonId')
], async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      return res.json({
        message: 'No notes found',
        notes: []
      });
    }

    const lessonNotes = progress.notes.filter(
      note => note.lessonId.toString() === req.params.lessonId
    ).sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      message: 'Notes retrieved successfully',
      notes: lessonNotes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      error: 'Failed to get notes',
      message: 'An error occurred while fetching notes'
    });
  }
});

// @route   DELETE /api/progress/:courseId/notes/:noteId
// @desc    Delete a note
// @access  Private
router.delete('/:courseId/notes/:noteId', [
  authenticateToken,
  validateObjectId('courseId'),
  validateObjectId('noteId')
], async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found',
        message: 'No progress record found for this course'
      });
    }

    progress.notes = progress.notes.filter(
      note => note._id.toString() !== req.params.noteId
    );

    await progress.save();

    res.json({
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      error: 'Failed to delete note',
      message: 'An error occurred while deleting the note'
    });
  }
});

// @route   POST /api/progress/:courseId/bookmarks
// @desc    Add bookmark to lesson
// @access  Private
router.post('/:courseId/bookmarks', [authenticateToken, validateObjectId('courseId')], async (req, res) => {
  try {
    const { lessonId, title, timestamp } = req.body;
    
    if (!lessonId || !title || timestamp === undefined) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Lesson ID, title, and timestamp are required'
      });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        course: req.params.courseId
      });
    }

    progress.addBookmark(lessonId, title, timestamp);
    await progress.save();

    const newBookmark = progress.bookmarks[progress.bookmarks.length - 1];

    res.json({
      message: 'Bookmark added successfully',
      bookmark: newBookmark
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      error: 'Failed to add bookmark',
      message: 'An error occurred while adding the bookmark'
    });
  }
});

// @route   GET /api/progress/:courseId/bookmarks
// @desc    Get all bookmarks for a course
// @access  Private
router.get('/:courseId/bookmarks', [
  authenticateToken,
  validateObjectId('courseId')
], async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      return res.json({
        message: 'No bookmarks found',
        bookmarks: []
      });
    }

    const bookmarks = progress.bookmarks.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      message: 'Bookmarks retrieved successfully',
      bookmarks
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      error: 'Failed to get bookmarks',
      message: 'An error occurred while fetching bookmarks'
    });
  }
});

// @route   DELETE /api/progress/:courseId/bookmarks/:bookmarkId
// @desc    Delete a bookmark
// @access  Private
router.delete('/:courseId/bookmarks/:bookmarkId', [
  authenticateToken,
  validateObjectId('courseId'),
  validateObjectId('bookmarkId')
], async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progress) {
      return res.status(404).json({
        error: 'Progress not found',
        message: 'No progress record found for this course'
      });
    }

    progress.bookmarks = progress.bookmarks.filter(
      bookmark => bookmark._id.toString() !== req.params.bookmarkId
    );

    await progress.save();

    res.json({
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({
      error: 'Failed to delete bookmark',
      message: 'An error occurred while deleting the bookmark'
    });
  }
});

// Helper function to check and award achievements
async function checkAndAwardAchievements(userId, progress) {
  try {
    const user = await User.findById(userId);
    
    // First course completion
    if (progress.overallProgress >= 100) {
      const hasFirstCourseAchievement = user.achievements.some(
        achievement => achievement.type === 'first_course'
      );
      
      if (!hasFirstCourseAchievement) {
        user.achievements.push({
          type: 'first_course',
          courseId: progress.course
        });
      }
      
      // Course completed achievement
      const hasCourseCompletedAchievement = user.achievements.some(
        achievement => achievement.type === 'course_completed' && 
        achievement.courseId.toString() === progress.course.toString()
      );
      
      if (!hasCourseCompletedAchievement) {
        user.achievements.push({
          type: 'course_completed',
          courseId: progress.course
        });
      }
    }
    
    // Streak achievements
    if (progress.streakDays >= 7) {
      const hasStreak7Achievement = user.achievements.some(
        achievement => achievement.type === 'streak_7'
      );
      
      if (!hasStreak7Achievement) {
        user.achievements.push({
          type: 'streak_7'
        });
      }
    }
    
    if (progress.streakDays >= 30) {
      const hasStreak30Achievement = user.achievements.some(
        achievement => achievement.type === 'streak_30'
      );
      
      if (!hasStreak30Achievement) {
        user.achievements.push({
          type: 'streak_30'
        });
      }
    }
    
    await user.save();
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

module.exports = router;
