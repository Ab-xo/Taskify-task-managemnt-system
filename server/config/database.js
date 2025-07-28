const mongoose = require('mongoose');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const connectDB = async () => {
  try {
    logger.info('Attempting to connect to MongoDB...');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server not found
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: false // Disable mongoose buffering
      // ❌ bufferMaxEntries: 0  ← REMOVE this line
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);

    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected');
    });

    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, logger };
