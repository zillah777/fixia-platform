const logger = require('../utils/logger');

// Try to require Bull queue, gracefully handle if not available
let Bull;
try {
  Bull = require('bull');
} catch (error) {
  logger.warn('Bull queue not available, using fallback processing:', error.message);
  Bull = null;
}

/**
 * Background Job Processing System
 * Conservative implementation with graceful fallbacks
 */

// Job types
const JOB_TYPES = {
  EMAIL_NOTIFICATION: 'email_notification',
  IMAGE_PROCESSING: 'image_processing',
  CACHE_WARMING: 'cache_warming',
  ANALYTICS_PROCESSING: 'analytics_processing',
  DATABASE_CLEANUP: 'database_cleanup',
  REPORT_GENERATION: 'report_generation'
};

// Job priorities
const JOB_PRIORITIES = {
  CRITICAL: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  BACKGROUND: 5
};

// Queue configurations
const queueConfigs = {
  default: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_QUEUE_DB || 1 // Separate DB for queues
    },
    defaultJobOptions: {
      removeOnComplete: 10, // Keep last 10 completed jobs
      removeOnFail: 50, // Keep last 50 failed jobs
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    }
  }
};

// Initialize queues
let queues = {};
let isQueueSystemAvailable = false;

const initializeQueues = () => {
  if (!Bull) {
    logger.warn('Queue system unavailable, jobs will run synchronously');
    return false;
  }

  try {
    // Create different queues for different types of jobs
    queues.emails = new Bull('email processing', queueConfigs.default);
    queues.images = new Bull('image processing', queueConfigs.default);
    queues.analytics = new Bull('analytics processing', queueConfigs.default);
    queues.maintenance = new Bull('maintenance tasks', queueConfigs.default);

    // Set up queue event handlers
    Object.values(queues).forEach(queue => {
      queue.on('completed', (job) => {
        logger.info('Job completed', {
          id: job.id,
          type: job.name,
          duration: Date.now() - job.timestamp
        });
      });

      queue.on('failed', (job, err) => {
        logger.error('Job failed', err, {
          id: job.id,
          type: job.name,
          attempts: job.attemptsMade,
          data: job.data
        });
      });

      queue.on('stalled', (job) => {
        logger.warn('Job stalled', {
          id: job.id,
          type: job.name
        });
      });
    });

    isQueueSystemAvailable = true;
    logger.info('Background job queue system initialized');
    return true;

  } catch (error) {
    logger.error('Failed to initialize queue system', error);
    isQueueSystemAvailable = false;
    return false;
  }
};

// Job processors - Conservative implementations

// Email notification processor
const processEmailJob = async (job) => {
  const { type, recipient, data } = job.data;
  
  logger.info('Processing email job', {
    type,
    recipient: recipient.substring(0, 3) + '***', // Privacy
    jobId: job.id
  });

  // Simulate email processing (replace with actual email service)
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return { sent: true, timestamp: new Date().toISOString() };
};

// Image processing job
const processImageJob = async (job) => {
  const { imagePath, operations } = job.data;
  
  logger.info('Processing image job', {
    path: imagePath,
    operations: operations.length,
    jobId: job.id
  });

  // Simulate image processing (replace with actual Sharp processing)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { processed: true, operations: operations.length };
};

// Analytics processing job
const processAnalyticsJob = async (job) => {
  const { event, data } = job.data;
  
  logger.info('Processing analytics job', {
    event,
    dataSize: Object.keys(data || {}).length,
    jobId: job.id
  });

  // Simulate analytics processing
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return { processed: true, event };
};

// Maintenance job processor
const processMaintenanceJob = async (job) => {
  const { task, parameters } = job.data;
  
  logger.info('Processing maintenance job', {
    task,
    jobId: job.id
  });

  switch (task) {
    case 'cache_cleanup':
      // Simulate cache cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      return { cleaned: true, type: 'cache' };
      
    case 'log_rotation':
      // Simulate log rotation
      await new Promise(resolve => setTimeout(resolve, 100));
      return { rotated: true, type: 'logs' };
      
    default:
      logger.warn('Unknown maintenance task', { task });
      return { error: 'Unknown task' };
  }
};

// Register job processors
const registerProcessors = () => {
  if (!isQueueSystemAvailable) return;

  try {
    queues.emails.process('email_notification', 5, processEmailJob); // 5 concurrent
    queues.images.process('image_processing', 2, processImageJob); // 2 concurrent
    queues.analytics.process('analytics_processing', 10, processAnalyticsJob); // 10 concurrent
    queues.maintenance.process('maintenance_task', 1, processMaintenanceJob); // 1 concurrent

    logger.info('Job processors registered');
  } catch (error) {
    logger.error('Failed to register job processors', error);
  }
};

// Public API - With fallbacks

const addJob = async (queueName, jobType, data, options = {}) => {
  const jobData = {
    type: jobType,
    data,
    timestamp: Date.now()
  };

  const jobOptions = {
    priority: options.priority || JOB_PRIORITIES.NORMAL,
    delay: options.delay || 0,
    ...queueConfigs.default.defaultJobOptions,
    ...options
  };

  if (isQueueSystemAvailable && queues[queueName]) {
    try {
      const job = await queues[queueName].add(jobType, jobData, jobOptions);
      logger.debug('Job added to queue', {
        id: job.id,
        queue: queueName,
        type: jobType
      });
      return job;
    } catch (error) {
      logger.error('Failed to add job to queue, falling back to sync', error);
      // Fall through to synchronous processing
    }
  }

  // Fallback: Execute synchronously
  logger.debug('Executing job synchronously', { type: jobType });
  try {
    let result;
    switch (queueName) {
      case 'emails':
        result = await processEmailJob({ id: 'sync', data: jobData });
        break;
      case 'images':
        result = await processImageJob({ id: 'sync', data: jobData });
        break;
      case 'analytics':
        result = await processAnalyticsJob({ id: 'sync', data: jobData });
        break;
      case 'maintenance':
        result = await processMaintenanceJob({ id: 'sync', data: jobData });
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
    return { id: 'sync', result };
  } catch (error) {
    logger.error('Synchronous job execution failed', error);
    throw error;
  }
};

// Convenience methods
const addEmailJob = (data, options) => addJob('emails', JOB_TYPES.EMAIL_NOTIFICATION, data, options);
const addImageJob = (data, options) => addJob('images', JOB_TYPES.IMAGE_PROCESSING, data, options);
const addAnalyticsJob = (data, options) => addJob('analytics', JOB_TYPES.ANALYTICS_PROCESSING, data, options);
const addMaintenanceJob = (data, options) => addJob('maintenance', 'maintenance_task', data, options);

// Queue status and health
const getQueueStatus = () => {
  if (!isQueueSystemAvailable) {
    return {
      available: false,
      mode: 'synchronous',
      message: 'Queue system unavailable, jobs run synchronously'
    };
  }

  const status = {
    available: true,
    mode: 'asynchronous',
    queues: {}
  };

  Object.entries(queues).forEach(([name, queue]) => {
    status.queues[name] = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0
    };
    
    // Note: Getting actual counts requires async operations
    // For now, just mark as available
  });

  return status;
};

// Graceful shutdown
const closeQueues = async () => {
  if (!isQueueSystemAvailable) return;

  logger.info('Closing job queues...');
  
  try {
    await Promise.all(
      Object.values(queues).map(queue => queue.close())
    );
    logger.info('All job queues closed');
  } catch (error) {
    logger.error('Error closing job queues', error);
  }
};

// Initialize the system
const initialize = () => {
  const initialized = initializeQueues();
  if (initialized) {
    registerProcessors();
  }
  return initialized;
};

module.exports = {
  JOB_TYPES,
  JOB_PRIORITIES,
  initialize,
  addJob,
  addEmailJob,
  addImageJob,
  addAnalyticsJob,
  addMaintenanceJob,
  getQueueStatus,
  closeQueues,
  isAvailable: () => isQueueSystemAvailable
};