const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['student', 'instructor'])
    .withMessage('Role must be either student or instructor'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// Course validation rules
const validateCourseCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Course title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Course description must be between 20 and 2000 characters'),
  
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Short description must be less than 500 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Please select a category'),
  
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be 2-5 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  
  body('whatYouWillLearn')
    .optional()
    .isArray()
    .withMessage('Learning outcomes must be an array'),
  
  handleValidationErrors
];

const validateCourseUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Course title must be between 5 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Course description must be between 50 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  
  handleValidationErrors
];

// Lesson validation rules
const validateLessonCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Lesson title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Lesson description must be less than 1000 characters'),
  
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (seconds)'),
  
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  handleValidationErrors
];

// Review validation rules
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  
  handleValidationErrors
];

// Progress validation rules
const validateProgressUpdate = [
  body('lessonId')
    .isMongoId()
    .withMessage('Invalid lesson ID'),
  
  body('sectionId')
    .isMongoId()
    .withMessage('Invalid section ID'),
  
  body('watchTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Watch time must be a positive integer'),
  
  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Position must be a positive integer'),
  
  handleValidationErrors
];

// Note validation rules
const validateNote = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Note content must be between 1 and 2000 characters'),
  
  body('timestamp')
    .isInt({ min: 0 })
    .withMessage('Timestamp must be a positive integer'),
  
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateCourseFilters = [
  query('category')
    .optional()
    .custom((value) => {
      if (!value || value === '') return true; // Allow empty values
      return [
        'programming', 'design', 'business', 'marketing', 
        'data_science', 'ai_ml', 'web_development', 'mobile_development',
        'devops', 'cybersecurity', 'photography', 'music',
        'language', 'health', 'fitness', 'cooking', 'other'
      ].includes(value);
    })
    .withMessage('Invalid category'),
  
  query('level')
    .optional()
    .custom((value) => {
      if (!value || value === '') return true; // Allow empty values
      return ['beginner', 'intermediate', 'advanced'].includes(value);
    })
    .withMessage('Level must be beginner, intermediate, or advanced'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('sortBy')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'rating', 'price_low', 'price_high'])
    .withMessage('Invalid sort option'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCourseCreation,
  validateCourseUpdate,
  validateLessonCreation,
  validateReview,
  validateProgressUpdate,
  validateNote,
  validateObjectId,
  validatePagination,
  validateCourseFilters
};
