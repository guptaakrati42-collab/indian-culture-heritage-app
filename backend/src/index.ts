import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { db } from './config/database';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { languageMiddleware } from './middleware/languageMiddleware';
import { corsOptions } from './config/cors';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Language middleware - extract and validate language from request
app.use(languageMiddleware);

// Request logging middleware
app.use((req, _res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    language: req.language,
    ip: req.ip,
  });
  next();
});

// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbHealthy = db.isHealthy();
  const poolStats = db.getPoolStats();
  
  res.json({ 
    status: dbHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbHealthy,
      pool: poolStats,
    },
  });
});

// API routes
import cityRoutes from './routes/cityRoutes';
import heritageRoutes from './routes/heritageRoutes';

app.get('/api/v1', (_req, res) => {
  res.json({ message: 'Indian Culture App API v1' });
});

app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/heritage', heritageRoutes);
app.use('/api/v1', heritageRoutes); // For /api/v1/languages endpoint

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    logger.info('Initializing database connection...');
    await db.initialize();
    logger.info('Database connection established');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await db.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
