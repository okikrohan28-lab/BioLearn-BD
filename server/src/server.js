const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const seedDatabase = require('./scripts/seed');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();

  // Auto-seed admin and initial syllabus if database is empty
  await seedDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 BioLearn BD API server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`🔗 Health check available at: http://localhost:${env.PORT}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down gracefully...', err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle termination signals
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
