const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const env = require('./config/env');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const paperRoutes = require('./routes/paper.routes');
const chapterRoutes = require('./routes/chapter.routes');
const topicRoutes = require('./routes/topic.routes');
const catalogueRoutes = require('./routes/catalogue.routes');
const resourceRoutes = require('./routes/resource.routes');
const quizRoutes = require('./routes/quiz.routes');
const questionRoutes = require('./routes/question.routes');
const challengeRoutes = require('./routes/challenge.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const paymentRoutes = require('./routes/payment.routes');
const attemptRoutes = require('./routes/attempt.routes');

const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploaded resources: PDFs, Word documents, Diagrams)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/catalogue', catalogueRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attempts', attemptRoutes);

// Route Aliases (in case client baseURL is missing the /api prefix)
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/papers', paperRoutes);
app.use('/chapters', chapterRoutes);
app.use('/topics', topicRoutes);
app.use('/catalogue', catalogueRoutes);
app.use('/resources', resourceRoutes);
app.use('/quizzes', quizRoutes);
app.use('/questions', questionRoutes);
app.use('/challenges', challengeRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/payments', paymentRoutes);
app.use('/attempts', attemptRoutes);

// Root path informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'BioLearn BD API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      papers: '/api/papers',
      chapters: '/api/chapters',
      topics: '/api/topics',
      catalogue: '/api/catalogue',
    },
  });
});

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
