const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ error: message });
    }
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests, please try again later'
);

const taskLimiter = createRateLimit(
  1 * 60 * 1000, // 1 minute
  30, // limit each IP to 30 task operations per minute
  'Too many task operations, please slow down'
);

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5000", "https://jazzy-pavlova-fc5ab2.netlify.app"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// IP whitelist middleware (for admin operations)
const ipWhitelist = (allowedIPs) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.includes(clientIP) || process.env.NODE_ENV === 'development') {
      next();
    } else {
      logger.warn(`Unauthorized IP access attempt: ${clientIP}`);
      res.status(403).json({ error: 'Access denied from this IP address' });
    }
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

module.exports = {
  authLimiter,
  generalLimiter,
  taskLimiter,
  securityHeaders,
  ipWhitelist,
  requestLogger
};