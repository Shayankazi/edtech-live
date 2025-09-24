const express = require('express');
const Note = require('../models/Note');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/notes
// @desc    Get user's notes for a course or lesson
// @access  Private
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { course, lesson } = req.query;
    
    // For testing, use a default user ID if no user is authenticated
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    const filter = { user: userId };
    
    // Validate ObjectIds if provided
    const mongoose = require('mongoose');
    if (course && mongoose.Types.ObjectId.isValid(course)) {
      filter.course = course;
    }
    if (lesson && mongoose.Types.ObjectId.isValid(lesson)) {
      filter.lesson = lesson;
    }

    const notes = await Note.find(filter)
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      error: 'Failed to fetch notes',
      message: 'An error occurred while fetching notes'
    });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { course, lesson, content, timestamp, tags } = req.body;

    if (!course || !lesson || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Course, lesson, and content are required'
      });
    }

    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    
    const note = new Note({
      user: userId,
      course,
      lesson,
      content,
      timestamp: timestamp || 0,
      tags: tags || [],
      isPrivate: req.body.isPrivate || false
    });

    await note.save();
    await note.populate('course', 'title');

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      error: 'Failed to create note',
      message: 'An error occurred while creating the note'
    });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { content, tags } = req.body;
    
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        message: 'Note not found or access denied'
      });
    }

    if (content) note.content = content;
    if (tags) note.tags = tags;

    await note.save();
    await note.populate('course', 'title');

    res.json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      error: 'Failed to update note',
      message: 'An error occurred while updating the note'
    });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        message: 'Note not found or access denied'
      });
    }

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

const geminiService = require('../services/geminiService');

// @route   POST /api/notes/:id/summarize
// @desc    Generate AI summary for a note
// @access  Private
router.post('/:id/summarize', [optionalAuth, validateObjectId('id')], async (req, res) => {
  try {
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    
    const note = await Note.findOne({
      _id: req.params.id,
      user: userId
    }).populate('course', 'title').populate('lesson', 'title');

    if (!note) {
      return res.status(404).json({
        error: 'Note not found',
        message: 'Note not found or access denied'
      });
    }

    // Use Gemini AI for summarization
    const summaryData = await geminiService.summarizeNotes(note.content, {
      courseTitle: note.course?.title,
      lessonTitle: note.lesson?.title
    });
    
    note.aiSummary = {
      summary: summaryData.summary,
      keyPoints: summaryData.keyPoints || [],
      generatedAt: new Date()
    };

    await note.save();

    res.json({
      message: 'Summary generated successfully',
      summary: note.aiSummary
    });
  } catch (error) {
    console.error('Summarize note error:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      message: 'An error occurred while generating the summary'
    });
  }
});

// @route   POST /api/notes/batch-summarize
// @desc    Generate AI summaries for multiple notes
// @access  Private
router.post('/batch-summarize', authenticateToken, async (req, res) => {
  try {
    const { course, lesson } = req.body;
    const filter = { user: req.user._id };
    
    if (course) filter.course = course;
    if (lesson) filter.lesson = lesson;

    const notes = await Note.find(filter);
    
    if (notes.length === 0) {
      return res.status(404).json({
        error: 'No notes found',
        message: 'No notes found for the specified criteria'
      });
    }

    // Combine all note content
    const combinedContent = notes.map(note => note.content).join('\n\n');
    
    // TODO: Integrate with AI service for batch summarization
    const mockSummary = generateMockSummary(combinedContent);
    
    res.json({
      message: 'Batch summary generated successfully',
      summary: mockSummary,
      noteCount: notes.length
    });
  } catch (error) {
    console.error('Batch summarize error:', error);
    res.status(500).json({
      error: 'Failed to generate batch summary',
      message: 'An error occurred while generating the batch summary'
    });
  }
});

// Helper function to generate mock AI summary
function generateMockSummary(content) {
  const sentences = content.split('.').filter(s => s.trim().length > 0);
  const wordCount = content.split(' ').length;
  
  return {
    summary: `This note contains ${wordCount} words covering key concepts. ${sentences[0]?.trim() || 'Main topics discussed'}.`,
    keyPoints: [
      'Key concept 1 from the content',
      'Important point 2 mentioned',
      'Critical insight 3 highlighted'
    ].slice(0, Math.min(3, Math.ceil(sentences.length / 3)))
  };
}

module.exports = router;
