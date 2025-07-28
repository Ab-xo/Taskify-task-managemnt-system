const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Custom validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// MongoDB ObjectId validation
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Validation rules
const authValidation = {
  signup: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email address')
      .isLength({ max: 100 })
      .withMessage('Email cannot exceed 100 characters'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    handleValidationErrors
  ]
};

const taskValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Task name must be between 1 and 200 characters')
      .escape(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters')
      .escape(),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be low, medium, high, or urgent'),
    
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
    
    handleValidationErrors
  ],

  update: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid task ID'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Status must be pending, in-progress, completed, or cancelled'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be low, medium, high, or urgent'),
    
    handleValidationErrors
  ],

  delete: [
    param('id')
      .custom(isValidObjectId)
      .withMessage('Invalid task ID'),
    
    handleValidationErrors
  ],

  get: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search query cannot exceed 100 characters')
      .escape(),
    
    query('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Status must be pending, in-progress, completed, or cancelled'),
    
    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be low, medium, high, or urgent'),
    
    handleValidationErrors
  ]
};

module.exports = {
  authValidation,
  taskValidation,
  handleValidationErrors,
  isValidObjectId
};