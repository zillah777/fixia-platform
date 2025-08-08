// Mock logger for testing
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  
  // Business metrics
  logBusinessEvent: jest.fn(),
  logPerformance: jest.fn(),
  logSecurity: jest.fn(),
  logAudit: jest.fn(),
  
  // Error logging with context
  logError: jest.fn(),
  logWarning: jest.fn(),
  logInfo: jest.fn(),
  
  // Express middleware logger
  requestLogger: jest.fn((req, res, next) => next()),
  errorLogger: jest.fn((err, req, res, next) => next(err))
};

module.exports = mockLogger;