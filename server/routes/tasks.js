const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { logger } = require('../config/database');

const router = express.Router();

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, priority, dueDate, tags, estimatedHours } = req.body;

    const task = new Task({
      name: name || 'Untitled Task',
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
      estimatedHours,
      user: req.user._id
    });

    await task.save();
    
    logger.info(`Task created: ${task._id} by user: ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Task creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating task' 
    });
  }
});

// @route   GET /api/tasks
// @desc    Get user's tasks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search || '';
    const status = req.query.status;
    const priority = req.query.priority;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const includeArchived = req.query.includeArchived === 'true';

    // Build query
    const query = { 
      user: req.user._id,
      isArchived: includeArchived ? { $in: [true, false] } : false
    };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add priority filter
    if (priority) {
      query.priority = priority;
    }

    // Add date filters
    if (req.query.dueBefore) {
      query.dueDate = { ...query.dueDate, $lte: new Date(req.query.dueBefore) };
    }
    
    if (req.query.dueAfter) {
      query.dueDate = { ...query.dueDate, $gte: new Date(req.query.dueAfter) };
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Get tasks with pagination
    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Task.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get task statistics
    const statsAgg = await Task.aggregate([
      { $match: { user: req.user._id, isArchived: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = statsAgg.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Get overdue count
    const overdueCount = await Task.countDocuments({
      user: req.user._id,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
      isArchived: false
    });

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages,
          totalTasks: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        },
        stats,
        overdueCount
      }
    });
  } catch (error) {
    logger.error('Tasks fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching tasks' 
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    logger.error('Task fetch error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid task ID' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error fetching task' 
    });
  }
});

// @route   PATCH /api/tasks/:id
// @desc    Update task
// @access  Private
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'name', 'description', 'status', 'priority', 
      'dueDate', 'tags', 'estimatedHours', 'actualHours'
    ];
    
    // Filter allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Convert dueDate to Date object if provided
    if (filteredUpdates.dueDate) {
      filteredUpdates.dueDate = new Date(filteredUpdates.dueDate);
    }

    // Set completedAt when status changes to completed
    if (filteredUpdates.status === 'completed') {
      filteredUpdates.completedAt = new Date();
    } else if (filteredUpdates.status && filteredUpdates.status !== 'completed') {
      filteredUpdates.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }

    logger.info(`Task updated: ${task._id} by user: ${req.user._id}`);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Task update error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid task ID' 
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error updating task' 
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    logger.info(`Task deleted: ${task._id} by user: ${req.user._id}`);

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Task deletion error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid task ID' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error deleting task' 
    });
  }
});

// @route   GET /api/tasks/stats/overview
// @desc    Get task statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get basic stats
    const statsAgg = await Task.aggregate([
      { $match: { user: userId, isArchived: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = statsAgg.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    // Get overdue count
    const overdueCount = await Task.countDocuments({
      user: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
      isArchived: false
    });
    
    // Get completion rate for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTasks = await Task.find({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo },
      isArchived: false
    });
    
    const completedRecent = recentTasks.filter(task => task.status === 'completed').length;
    const completionRate = recentTasks.length > 0 ? (completedRecent / recentTasks.length) * 100 : 0;
    
    // Get productivity trends
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const productivityData = await Task.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
          completedAt: { $gte: sevenDaysAgo },
          isArchived: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        taskStats: stats,
        overdueCount,
        completionRate: Math.round(completionRate),
        productivityTrend: productivityData,
        totalTasks: recentTasks.length
      }
    });
  } catch (error) {
    logger.error('Stats fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics' 
    });
  }
});

module.exports = router;