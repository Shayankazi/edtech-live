const express = require('express');
const Caption = require('../models/Caption');
const { authenticateToken, optionalAuth, requireInstructor } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const speechToTextService = require('../services/speechToText');
const path = require('path');

const router = express.Router();

// @route   GET /api/captions/:videoId
// @desc    Get captions for a video
// @access  Public
router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { language = 'en' } = req.query;

    let captions = await Caption.findOne({ 
      videoId, 
      language,
      status: 'completed' 
    });

    if (!captions) {
      // Auto-generate captions if they don't exist
      try {
        const videoPath = path.join(__dirname, '../../videos', `${videoId}.mp4`);
        const fs = require('fs');
        
        if (fs.existsSync(videoPath)) {
          // Generate captions using speech-to-text
          const captionData = await speechToTextService.generateMockCaptions(120); // Mock for now
          
          // Save to database
          captions = new Caption({
            videoId,
            language,
            captions: captionData.captions,
            webvtt: captionData.webvtt,
            status: 'completed',
            generatedBy: 'auto',
            confidence: captionData.confidence
          });
          
          await captions.save();
          
          return res.json({ captions: captionData.captions });
        } else {
          // Generate mock captions for testing
          const mockCaptions = speechToTextService.generateMockCaptions(120);
          return res.json({ captions: mockCaptions.captions });
        }
      } catch (genError) {
        console.error('Caption generation error:', genError);
        // Return mock captions as fallback
        const mockCaptions = speechToTextService.generateMockCaptions(120);
        return res.json({ captions: mockCaptions.captions });
      }
    }

    res.json({ captions: captions.captions });
  } catch (error) {
    console.error('Get captions error:', error);
    res.status(500).json({
      error: 'Failed to fetch captions',
      message: 'An error occurred while fetching captions'
    });
  }
});

// @route   POST /api/captions/generate
// @desc    Generate captions for a video using AI
// @access  Private (Instructor)
router.post('/generate', [authenticateToken, requireInstructor], async (req, res) => {
  try {
    const { videoId, language = 'en' } = req.body;

    if (!videoId) {
      return res.status(400).json({
        error: 'Video ID required',
        message: 'Please provide a video ID'
      });
    }

    // Check if captions already exist
    let caption = await Caption.findOne({ videoId, language });
    
    if (caption && caption.status === 'completed') {
      return res.json({
        message: 'Captions already exist',
        caption
      });
    }

    // Create or update caption record
    if (!caption) {
      caption = new Caption({
        videoId,
        language,
        status: 'processing',
        generatedBy: 'ai'
      });
    } else {
      caption.status = 'processing';
    }

    await caption.save();

    // TODO: Integrate with speech-to-text service (OpenAI Whisper, Google Speech-to-Text, etc.)
    // For now, we'll simulate the process
    setTimeout(async () => {
      try {
        // Simulate AI caption generation
        const mockCaptions = [
          { start: 0, end: 3, text: "Welcome to this lesson." },
          { start: 3, end: 7, text: "Today we'll be learning about important concepts." },
          { start: 7, end: 12, text: "Let's start with the fundamentals." }
        ];

        // Generate WebVTT content
        const vttContent = generateWebVTT(mockCaptions);

        caption.captions = mockCaptions;
        caption.vttContent = vttContent;
        caption.status = 'completed';
        await caption.save();

        console.log(`Captions generated for video: ${videoId}`);
      } catch (error) {
        console.error('Caption generation failed:', error);
        caption.status = 'failed';
        await caption.save();
      }
    }, 5000); // Simulate 5 second processing time

    res.json({
      message: 'Caption generation started',
      captionId: caption._id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Generate captions error:', error);
    res.status(500).json({
      error: 'Failed to generate captions',
      message: 'An error occurred while generating captions'
    });
  }
});

// @route   GET /api/captions/status/:captionId
// @desc    Get caption generation status
// @access  Private
router.get('/status/:captionId', [authenticateToken, validateObjectId('captionId')], async (req, res) => {
  try {
    const caption = await Caption.findById(req.params.captionId);

    if (!caption) {
      return res.status(404).json({
        error: 'Caption not found',
        message: 'Caption record not found'
      });
    }

    res.json({
      status: caption.status,
      progress: caption.status === 'completed' ? 100 : 
                caption.status === 'processing' ? 50 : 0
    });
  } catch (error) {
    console.error('Get caption status error:', error);
    res.status(500).json({
      error: 'Failed to get caption status',
      message: 'An error occurred while checking caption status'
    });
  }
});

// Helper function to generate WebVTT content
function generateWebVTT(captions) {
  let vtt = 'WEBVTT\n\n';
  
  captions.forEach((caption, index) => {
    const startTime = formatTime(caption.start);
    const endTime = formatTime(caption.end);
    
    vtt += `${index + 1}\n`;
    vtt += `${startTime} --> ${endTime}\n`;
    vtt += `${caption.text}\n\n`;
  });
  
  return vtt;
}

// Helper function to format time for WebVTT
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

module.exports = router;
