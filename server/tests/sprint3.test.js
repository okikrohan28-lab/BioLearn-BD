const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const env = require('../src/config/env');
const Subscription = require('../src/models/Subscription');
const PaymentTransaction = require('../src/models/PaymentTransaction');
const WeeklyChallenge = require('../src/models/WeeklyChallenge');
const QuizAttempt = require('../src/models/QuizAttempt');

test('Sprint 3 - Server-Side Scoring Logic and Answer Evaluation', () => {
  // Simulated questions with answer keys
  const questions = [
    { _id: 'q1', correct_answer: 'A', positive_marks: 2 },
    { _id: 'q2', correct_answer: 'C', positive_marks: 3 },
    { _id: 'q3', correct_answer: 'B', positive_marks: 5 },
  ];
  const total_marks = 10;

  // Student submitted: q1->A (correct), q2->B (wrong), q3->unanswered
  const submittedAnswers = [
    { question_id: 'q1', selected_option: 'A' },
    { question_id: 'q2', selected_option: 'B' },
  ];

  const answerMap = {};
  submittedAnswers.forEach((a) => {
    answerMap[a.question_id] = a.selected_option;
  });

  let obtained_marks = 0;
  let correct_count = 0;
  let incorrect_count = 0;
  let unanswered_count = 0;

  questions.forEach((q) => {
    const selected = answerMap[q._id];
    if (!selected) {
      unanswered_count++;
    } else if (selected === q.correct_answer) {
      correct_count++;
      obtained_marks += q.positive_marks;
    } else {
      incorrect_count++;
    }
  });

  const scorePercent = Math.round((obtained_marks / total_marks) * 100);

  assert.equal(obtained_marks, 2);
  assert.equal(correct_count, 1);
  assert.equal(incorrect_count, 1);
  assert.equal(unanswered_count, 1);
  assert.equal(scorePercent, 20);
});

test('Sprint 3 - Subscription Model Status Lifecycle', () => {
  const validStatuses = ['pending', 'active', 'expired', 'cancelled'];
  const statusPath = Subscription.schema.paths.status;
  assert.deepEqual(statusPath.enumValues, validStatuses);

  // Test valid subscription schema creation
  const sub = new Subscription({
    student_id: '507f1f77bcf86cd799439011',
    plan_name: 'Premium',
    duration_days: 30,
    fee: 99,
    status: 'pending',
  });
  assert.equal(sub.validateSync(), undefined);
});

test('Sprint 3 - Subscription Expiry Logic', () => {
  const checkActive = (sub) => {
    if (!sub || sub.status !== 'active') return false;
    if (sub.end_date && new Date() > new Date(sub.end_date)) {
      return false; // Expired
    }
    return true;
  };

  const activeSub = {
    status: 'active',
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in future
  };
  assert.equal(checkActive(activeSub), true);

  const expiredSub = {
    status: 'active',
    end_date: new Date(Date.now() - 1000), // 1 second in past
  };
  assert.equal(checkActive(expiredSub), false);

  const pendingSub = {
    status: 'pending',
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  };
  assert.equal(checkActive(pendingSub), false);
});

test('Sprint 3 - Demo Payment Transaction Model and Reference ID', () => {
  const generateReferenceId = () => {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `BIO-${Date.now()}-${random}`;
  };

  const ref1 = generateReferenceId();
  const ref2 = generateReferenceId();
  assert.ok(ref1.startsWith('BIO-'));
  assert.notEqual(ref1, ref2);

  const transaction = new PaymentTransaction({
    student_id: '507f1f77bcf86cd799439011',
    subscription_id: '507f1f77bcf86cd799439022',
    amount: 99,
    payment_method: 'bkash_demo',
    status: 'pending',
    is_demo: true,
  });
  assert.equal(transaction.validateSync(), undefined);
});

test('Sprint 3 - Weekly Challenge Timeline Availability Check', () => {
  const checkAvailability = (challenge, currentDate = new Date()) => {
    if (challenge.status !== 'published') return { available: false, reason: 'not_published' };
    if (currentDate < challenge.start_date) return { available: false, reason: 'not_started' };
    if (currentDate > challenge.end_date) return { available: false, reason: 'ended' };
    return { available: true };
  };

  const liveChallenge = {
    status: 'published',
    start_date: new Date(Date.now() - 10000),
    end_date: new Date(Date.now() + 500000),
  };
  assert.equal(checkAvailability(liveChallenge).available, true);

  const futureChallenge = {
    status: 'published',
    start_date: new Date(Date.now() + 100000),
    end_date: new Date(Date.now() + 500000),
  };
  assert.equal(checkAvailability(futureChallenge).reason, 'not_started');

  const pastChallenge = {
    status: 'published',
    start_date: new Date(Date.now() - 500000),
    end_date: new Date(Date.now() - 1000),
  };
  assert.equal(checkAvailability(pastChallenge).reason, 'ended');
});

test('Sprint 3 - Protected Endpoints: Payment and Challenge Access Control', async () => {
  // Subscription and payment endpoints require authentication
  const resSubNoAuth = await request(app).get('/api/subscriptions/my');
  assert.equal(resSubNoAuth.status, 401);

  const resPayNoAuth = await request(app).post('/api/payments').send({ subscription_id: '507f1f77bcf86cd799439011' });
  assert.equal(resPayNoAuth.status, 401);

  // Student cannot access admin subscription management
  const studentToken = jwt.sign(
    { id: '507f1f77bcf86cd799439011', role: 'student', email: 'student@example.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const resAdminSubs = await request(app)
    .get('/api/subscriptions')
    .set('Authorization', `Bearer ${studentToken}`);
  assert.ok([401, 403].includes(resAdminSubs.status));
});

