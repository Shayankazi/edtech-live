const express = require('express');
const { optionalAuth, requireInstructor } = require('../middleware/auth');
const reportGenerator = require('../services/reportGenerator');
const performanceAnalytics = require('../services/performanceAnalytics');
const path = require('path');

const router = express.Router();

// @route   GET /api/reports/performance/pdf
// @desc    Generate and download PDF performance report
// @access  Private
router.get('/performance/pdf', optionalAuth, async (req, res) => {
  try {
    const { courseId, timeframe = '30d' } = req.query;
    const userId = req.user?._id || '507f1f77bcf86cd799439011';

    const report = await reportGenerator.generatePDFReport(userId, courseId, timeframe);
    
    res.json({
      message: 'PDF report generated successfully',
      url: report.url,
      fileName: report.fileName
    });
  } catch (error) {
    console.error('Generate PDF report error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF report',
      message: 'An error occurred while generating the PDF report'
    });
  }
});

// @route   GET /api/reports/performance/csv
// @desc    Generate and download CSV performance report
// @access  Private
router.get('/performance/csv', optionalAuth, async (req, res) => {
  try {
    const { courseId, timeframe = '30d' } = req.query;
    const userId = req.user?._id || '507f1f77bcf86cd799439011';

    const report = await reportGenerator.generateCSVReport(userId, courseId, timeframe);
    
    res.json({
      message: 'CSV report generated successfully',
      url: report.url,
      fileName: report.fileName
    });
  } catch (error) {
    console.error('Generate CSV report error:', error);
    res.status(500).json({
      error: 'Failed to generate CSV report',
      message: 'An error occurred while generating the CSV report'
    });
  }
});

// @route   GET /api/reports/download/:fileName
// @desc    Download a generated report
// @access  Private
router.get('/download/:fileName', optionalAuth, (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../../reports', fileName);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(404).json({
          error: 'File not found',
          message: 'The requested report file was not found'
        });
      }
    });
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      error: 'Failed to download report',
      message: 'An error occurred while downloading the report'
    });
  }
});

module.exports = router;
