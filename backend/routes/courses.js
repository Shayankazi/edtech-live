const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { 
  authenticateToken, 
  requireInstructor, 
  optionalAuth 
} = require('../middleware/auth');
const { 
  validateCourseCreation,
  validateCourseUpdate,
  validateLessonCreation,
  validateReview,
  validateObjectId,
  validatePagination,
  validateCourseFilters
} = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath;
    
    if (file.fieldname === 'video') {
      // Save videos to the videos folder
      uploadPath = path.join(__dirname, '../../videos');
    } else {
      // Save other files (thumbnails, etc.) to uploads
      uploadPath = path.join(__dirname, '../uploads');
    }
    
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      // Accept video files
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for video uploads'));
      }
    } else if (file.fieldname === 'thumbnail') {
      // Accept image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for thumbnails'));
      }
    } else {
      // Accept other document types
      cb(null, true);
    }
  }
});

// @route   GET /api/courses
// @desc    Get all courses with filtering and pagination
// @access  Public
router.get('/', [validatePagination, validateCourseFilters], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      level,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      instructor
    } = req.query;
    
    // Build filter object - remove status filter to show all courses
    const filter = {};
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (instructor) filter.instructor = instructor;
    
    // Price filtering
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Text search
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { enrollmentCount: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'price_low':
        sort = { price: 1 };
        break;
      case 'price_high':
        sort = { price: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name avatar')
        .select('-sections.lessons.transcript -sections.lessons.captions')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(filter)
    ]);
    
    console.log('Courses API - Filter used:', filter);
    console.log('Courses API - Found courses:', courses?.length || 0);
    console.log('Courses API - Total count:', total);
    
    res.json({
      courses,
      total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + courses.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    console.log('Filter used:', filter);
    console.log('Courses found:', courses?.length || 0);
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: 'An error occurred while fetching courses'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('reviews.user', 'name avatar');
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }
    
    // Check if user has access to full content
    let hasAccess = false;
    let userProgress = null;
    
    if (req.user) {
      // Check if user is enrolled or is the instructor
      const isInstructor = course.instructor._id.toString() === req.user._id.toString();
      const isEnrolled = req.user.enrolledCourses.some(
        enrollment => enrollment.course.toString() === course._id.toString()
      );
      
      hasAccess = isInstructor || isEnrolled || course.price === 0;
      
      if (isEnrolled) {
        userProgress = await Progress.findOne({
          user: req.user._id,
          course: course._id
        });
      }
    }
    
    // Filter content based on access
    const courseData = course.toObject();
    
    if (!hasAccess) {
      // Only show preview lessons and basic info
      courseData.sections = courseData.sections.map(section => ({
        ...section,
        lessons: section.lessons.filter(lesson => lesson.isPreview)
      }));
    }
    
    res.json(courseData);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      error: 'Failed to fetch course',
      message: 'An error occurred while fetching the course'
    });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Instructor)
router.post('/', [authenticateToken, requireInstructor], async (req, res) => {
  try {
    console.log('Course creation request body:', req.body);
    console.log('User:', req.user);
    
    const courseData = {
      ...req.body,
      instructor: req.user._id
    };
    
    const course = new Course(courseData);
    await course.save();
    
    // Add course to instructor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id }
    });
    
    await course.populate('instructor', 'name avatar');
    
    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      error: 'Failed to create course',
      message: 'An error occurred while creating the course'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Instructor/Owner)
router.put('/:id', [
  authenticateToken, 
  requireInstructor, 
  validateObjectId('id'), 
  validateCourseUpdate
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }
    
    // Check if user owns the course or is admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own courses'
      });
    }
    
    // Update course
    Object.assign(course, req.body);
    
    // Set published date if publishing for first time
    if (req.body.status === 'published' && !course.publishedAt) {
      course.publishedAt = new Date();
    }
    
    await course.save();
    await course.populate('instructor', 'name avatar');
    
    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      error: 'Failed to update course',
      message: 'An error occurred while updating the course'
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Instructor/Owner)
router.delete('/:id', [
  authenticateToken, 
  requireInstructor, 
  validateObjectId('id')
], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }
    
    // Check if user owns the course or is admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own courses'
      });
    }
    
    // Check if course has enrollments
    if (course.enrollmentCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete course',
        message: 'Cannot delete a course with active enrollments'
      });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    
    // Remove from instructor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdCourses: req.params.id }
    });
    
    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      error: 'Failed to delete course',
      message: 'An error occurred while deleting the course'
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:id/enroll', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }
    
    if (course.status !== 'published') {
      return res.status(400).json({
        error: 'Course not available',
        message: 'This course is not currently available for enrollment'
      });
    }
    
    // Check if already enrolled
    const alreadyEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === course._id.toString()
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({
        error: 'Already enrolled',
        message: 'You are already enrolled in this course'
      });
    }
    
    // For paid courses, you would implement payment processing here
    if (course.price > 0) {
      // TODO: Implement payment processing
      return res.status(400).json({
        error: 'Payment required',
        message: 'Payment processing not implemented yet'
      });
    }
    
    // Enroll user
    req.user.enrollInCourse(course._id);
    await req.user.save();
    
    // Create progress tracking
    const progress = new Progress({
      user: req.user._id,
      course: course._id
    });
    await progress.save();
    
    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();
    
    res.json({
      message: 'Successfully enrolled in course',
      course: {
        id: course._id,
        title: course.title,
        thumbnail: course.thumbnail
      }
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      error: 'Failed to enroll',
      message: 'An error occurred while enrolling in the course'
    });
  }
});

// @route   POST /api/courses/:id/reviews
// @desc    Add course review
// @access  Private
router.post('/:id/reviews', [
  authenticateToken, 
  validateObjectId('id'), 
  validateReview
], async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }
    
    // Check if user is enrolled
    const isEnrolled = req.user.enrolledCourses.some(
      enrollment => enrollment.course.toString() === course._id.toString()
    );
    
    if (!isEnrolled) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be enrolled to review this course'
      });
    }
    
    // Check if user already reviewed
    const existingReview = course.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // Add new review
      course.reviews.push({
        user: req.user._id,
        rating,
        comment
      });
    }
    
    // Update course rating
    course.updateRating();
    await course.save();
    
    await course.populate('reviews.user', 'name avatar');
    
    res.json({
      message: existingReview ? 'Review updated successfully' : 'Review added successfully',
      review: course.reviews[course.reviews.length - 1]
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      error: 'Failed to add review',
      message: 'An error occurred while adding the review'
    });
  }
});

// @route   POST /api/courses/upload-video
// @desc    Upload video for course lesson (general endpoint)
// @access  Private (Instructor)
router.post('/upload-video', [
  authenticateToken,
  requireInstructor
], upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a video file to upload'
      });
    }
    
    const videoUrl = `/videos/${req.file.filename}`;
    
    res.json({
      message: 'Video uploaded successfully',
      videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      uploadId: req.file.filename
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      error: 'Failed to upload video',
      message: 'An error occurred while uploading the video'
    });
  }
});

// @route   GET /api/courses/upload-status/:uploadId
// @desc    Get upload status
// @access  Private (Instructor)
router.get('/upload-status/:uploadId', [authenticateToken, requireInstructor], async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // Check if file exists
    const videoPath = path.join(__dirname, '../../videos', uploadId);
    
    try {
      await fs.access(videoPath);
      res.json({
        status: 'completed',
        videoUrl: `/videos/${uploadId}`,
        stage: 'Processing complete'
      });
    } catch (error) {
      res.json({
        status: 'error',
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Upload status error:', error);
    res.status(500).json({
      error: 'Failed to get upload status',
      message: 'An error occurred while checking upload status'
    });
  }
});

// @route   POST /api/courses/:id/upload-video
// @desc    Upload video for specific course lesson
// @access  Private (Instructor)
router.post('/:id/upload-video', [
  authenticateToken,
  requireInstructor,
  validateObjectId('id')
], upload.single('video'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }
    
    // Check if user owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only upload videos to your own courses'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a video file to upload'
      });
    }
    
    const videoUrl = `/videos/${req.file.filename}`;
    
    res.json({
      message: 'Video uploaded successfully',
      videoUrl,
      filename: req.file.filename,
      size: req.file.size,
      uploadId: req.file.filename // For tracking upload status
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({
      error: 'Failed to upload video',
      message: 'An error occurred while uploading the video'
    });
  }
});

module.exports = router;
