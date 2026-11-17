const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const env = require('../src/config/env');

const Student = require('../src/models/Student');
const Admin = require('../src/models/Admin');
const Paper = require('../src/models/Paper');
const Chapter = require('../src/models/Chapter');
const Topic = require('../src/models/Topic');
const Resource = require('../src/models/Resource');
const Quiz = require('../src/models/Quiz');
const Question = require('../src/models/Question');
const QuizAttempt = require('../src/models/QuizAttempt');
const WeeklyChallenge = require('../src/models/WeeklyChallenge');
const Subscription = require('../src/models/Subscription');
const PaymentTransaction = require('../src/models/PaymentTransaction');

let studentToken = '';
let studentUser = null;
let adminToken = '';
let adminUser = null;
let testPaperId = '';
let testChapterId = '';
let testTopicId = '';
let testResourceId = '';
let testQuizId = '';
let testQuestion1Id = '';
let testQuestion2Id = '';
let testChallengeId = '';
let testAttemptId = '';
let testSubscriptionId = '';
let testPaymentId = '';

const testEmail = `audit_student_${Date.now()}@example.com`;
const testAdminEmail = `audit_admin_${Date.now()}@biolearnbd.com`;

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }
});

test.after(async () => {
  // Cleanup test artifacts
  try {
    const studentId = studentUser?.id || studentUser?._id;
    if (studentId) {
      await Student.findByIdAndDelete(studentId);
      await Subscription.deleteMany({ student_id: studentId });
      await PaymentTransaction.deleteMany({ student_id: studentId });
      await QuizAttempt.deleteMany({ student_id: studentId });
    }
    if (adminUser) {
      await Admin.findByIdAndDelete(adminUser._id);
    }
    if (testPaperId) await Paper.findByIdAndDelete(testPaperId);
    if (testChapterId) await Chapter.findByIdAndDelete(testChapterId);
    if (testTopicId) await Topic.findByIdAndDelete(testTopicId);
    if (testResourceId) await Resource.findByIdAndDelete(testResourceId);
    if (testQuizId) {
      await Quiz.findByIdAndDelete(testQuizId);
      await Question.deleteMany({ quiz_id: testQuizId });
    }
    if (testChallengeId) await WeeklyChallenge.findByIdAndDelete(testChallengeId);
  } catch (err) {
    console.error('Cleanup warning:', err.message);
  } finally {
    await mongoose.disconnect();
  }
});

// ==========================================
// SPRINT 1 AUDIT TESTS
// ==========================================

test('1.1 - Student registration: validation, hashing, duplicate prevention', async () => {
  // 1. Validation failure on invalid inputs
  const failRes = await request(app).post('/api/auth/register').send({
    name: '',
    email: 'invalid-email',
    password: '123',
  });
  assert.equal(failRes.status, 400);
  assert.equal(failRes.body.success, false);

  // 2. Successful registration
  const regRes = await request(app).post('/api/auth/register').send({
    name: 'Audit Test Student',
    email: testEmail,
    password: 'Password@123',
    phone: '01711223344',
  });
  assert.equal(regRes.status, 201);
  assert.equal(regRes.body.success, true);
  assert.ok(regRes.body.data.token);
  assert.equal(regRes.body.data.student.email, testEmail);

  // Verify password is not in response
  assert.equal(regRes.body.data.student.password, undefined);
  assert.equal(regRes.body.data.student.password_hash, undefined);

  // Verify password in DB is bcrypt-hashed
  const dbStudent = await Student.findOne({ email: testEmail }).select('+password_hash');
  assert.ok(dbStudent.password_hash);
  assert.notEqual(dbStudent.password_hash, 'Password@123');
  const isMatch = await bcrypt.compare('Password@123', dbStudent.password_hash);
  assert.equal(isMatch, true);

  // 3. Duplicate email prevention
  const dupRes = await request(app).post('/api/auth/register').send({
    name: 'Duplicate Student',
    email: testEmail,
    password: 'Password@123',
  });
  assert.equal(dupRes.status, 409);
  assert.equal(dupRes.body.success, false);
});

test('1.2 - Login and authentication: issuance, invalid rejection, role segregation', async () => {
  // 1. Invalid credentials rejection
  const badLogin = await request(app).post('/api/auth/login').send({
    email: testEmail,
    password: 'WrongPassword@999',
  });
  assert.equal(badLogin.status, 401);

  // 2. Student login
  const studentLogin = await request(app).post('/api/auth/login').send({
    email: testEmail,
    password: 'Password@123',
  });
  assert.equal(studentLogin.status, 200);
  assert.ok(studentLogin.body.data.token);
  assert.equal(studentLogin.body.data.student.email, testEmail);

  studentToken = studentLogin.body.data.token;
  studentUser = studentLogin.body.data.student;

  // 3. Admin user creation and login
  const adminPwdHash = await Admin.hashPassword('Admin@123456');
  adminUser = await Admin.create({
    name: 'Audit Administrator',
    email: testAdminEmail,
    role: 'admin',
    password_hash: adminPwdHash,
  });

  const adminLogin = await request(app).post('/api/auth/admin/login').send({
    email: testAdminEmail,
    password: 'Admin@123456',
  });
  assert.equal(adminLogin.status, 200);
  assert.ok(adminLogin.body.data.token);
  assert.equal(adminLogin.body.data.admin.role, 'admin');

  adminToken = adminLogin.body.data.token;

  // 4. Role segregation: student cannot access admin endpoints
  const studentForbidden = await request(app)
    .post('/api/papers')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ title: 'Hacked Paper' });
  assert.equal(studentForbidden.status, 403);
});

test('1.3 - Manage student profile: view, update permitted fields, forbid points/role changes', async () => {
  // 1. View profile
  const profileRes = await request(app)
    .get('/api/auth/profile')
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(profileRes.status, 200);
  assert.equal(profileRes.body.data.email, testEmail);

  // 2. Update permitted fields (name, phone)
  const updateRes = await request(app)
    .put('/api/auth/profile')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      name: 'Audit Student Updated',
      phone: '01899887766',
      points: 99999, // Should NOT be modified
      role: 'admin', // Should NOT be modified
    });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.data.name, 'Audit Student Updated');
  assert.equal(updateRes.body.data.phone, '01899887766');

  // Verify DB state
  const studentId = studentUser.id || studentUser._id;
  const updatedDb = await Student.findById(studentId);
  assert.equal(updatedDb.name, 'Audit Student Updated');
  assert.equal(updatedDb.phone, '01899887766');
  assert.equal(updatedDb.status, 'active'); // Remains active
  assert.equal(updatedDb.points, undefined); // Points not on schema
});

test('2.1 - Manage papers: Admin CRUD and student published visibility', async () => {
  // 1. Admin creates paper
  const createRes = await request(app)
    .post('/api/papers')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Audit Biology 1st Paper',
      subject: 'Biology',
      access_level: 'free',
      status: 'published',
      description: 'Paper created during comprehensive audit.',
    });
  assert.equal(createRes.status, 201);
  assert.ok(createRes.body.data._id);
  testPaperId = createRes.body.data._id;

  // 2. Admin updates paper
  const updateRes = await request(app)
    .put(`/api/papers/${testPaperId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      description: 'Updated paper description.',
    });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.data.description, 'Updated paper description.');

  // 3. Student can view published papers
  const listRes = await request(app).get('/api/papers');
  assert.equal(listRes.status, 200);
  const found = listRes.body.data.some((p) => p._id === testPaperId);
  assert.equal(found, true);
});

test('2.2 - Manage chapters: Compound uniqueness and paper reference', async () => {
  // 1. Admin creates chapter
  const createRes = await request(app)
    .post('/api/chapters')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      paper_id: testPaperId,
      chapter_no: 99,
      title: 'Audit Chapter 99: Cellular Respiration',
      description: 'Audit chapter overview.',
      status: 'published',
    });
  assert.equal(createRes.status, 201);
  testChapterId = createRes.body.data._id;

  // 2. Reject duplicate chapter_no within the same paper
  const dupRes = await request(app)
    .post('/api/chapters')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      paper_id: testPaperId,
      chapter_no: 99,
      title: 'Duplicate Chapter',
      status: 'published',
    });
  assert.equal(dupRes.status, 409);
});

test('2.3 - Manage topics: Chapter reference and topic_no uniqueness', async () => {
  // 1. Admin creates topic
  const createRes = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      chapter_id: testChapterId,
      topic_no: 1,
      title: 'Audit Topic 1: Glycolysis & Krebs Cycle',
      description: 'Detailed pathways of cellular respiration.',
      status: 'published',
    });
  assert.equal(createRes.status, 201);
  testTopicId = createRes.body.data._id;

  // 2. Reject duplicate topic_no within same chapter
  const dupRes = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      chapter_id: testChapterId,
      topic_no: 1,
      title: 'Duplicate Topic',
      status: 'published',
    });
  assert.equal(dupRes.status, 409);
});

test('2.5 - Browse catalogue: Hierarchical paper -> chapter -> topic view', async () => {
  const catRes = await request(app).get('/api/catalogue');
  assert.equal(catRes.status, 200);
  assert.equal(catRes.body.success, true);
  assert.ok(Array.isArray(catRes.body.data));

  // Find the seeded paper in catalogue
  const paper = catRes.body.data.find((p) => p._id.toString() === testPaperId);
  assert.ok(paper, 'Created paper found in catalogue');
  assert.ok(Array.isArray(paper.chapters), 'Paper has chapters array');
  const ch = paper.chapters.find((c) => c._id.toString() === testChapterId);
  assert.ok(ch, 'Created chapter found under paper');
  assert.ok(Array.isArray(ch.topics), 'Chapter has topics array');
  const top = ch.topics.find((t) => t._id.toString() === testTopicId);
  assert.ok(top, 'Created topic found under chapter');
});

// ==========================================
// SPRINT 2 AUDIT TESTS
// ==========================================

test('2.4 - Manage learning resources: Admin notes, diagrams, and YouTube URL extraction', async () => {
  // 1. Admin creates a resource (YouTube lesson)
  const resYoutube = await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      topic_id: testTopicId,
      resource_type: 'youtube',
      title: 'Glycolysis Video Animation',
      content: 'Animation of enzymatic steps in glycolysis.',
      youtube_url: 'https://www.youtube.com/watch?v=ef0uO_a0Hao',
      status: 'published',
    });
  assert.equal(resYoutube.status, 201);
  assert.ok(resYoutube.body.data._id);
  assert.equal(resYoutube.body.data.youtube_video_id, 'ef0uO_a0Hao');
  testResourceId = resYoutube.body.data._id;

  // 2. Admin updates the resource
  const updateRes = await request(app)
    .put(`/api/resources/${testResourceId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Glycolysis Animated Walkthrough (Updated)',
    });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.data.title, 'Glycolysis Animated Walkthrough (Updated)');
});

test('2.6 - View learning materials: Student retrieves topic learning resources', async () => {
  const res = await request(app).get(`/api/resources?topicId=${testTopicId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  const found = res.body.data.find((r) => r._id === testResourceId);
  assert.ok(found, 'Seeded video resource visible in topic resources');
  assert.equal(found.youtube_video_id, 'ef0uO_a0Hao');
});

test('3.1 - Manage topic quizzes: Exclusive topic invariant and authoring', async () => {
  // 1. Topic quiz with topic_id (Valid)
  const validRes = await request(app)
    .post('/api/quizzes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Glycolysis Mastery Topic Quiz',
      quiz_type: 'topic',
      topic_id: testTopicId,
      time_limit_minutes: 15,
      pass_marks: 5,
      status: 'published',
    });
  assert.equal(validRes.status, 201);
  testQuizId = validRes.body.data._id;

  // 2. Invariant violation: topic quiz with missing topic_id
  const invalidRes = await request(app)
    .post('/api/quizzes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Invalid Quiz',
      quiz_type: 'topic',
      // Missing topic_id
      time_limit_minutes: 10,
    });
  assert.equal(invalidRes.status, 400);
});

test('3.2 - Manage chapter quizzes: Exclusive chapter invariant and authoring', async () => {
  // 1. Chapter quiz with chapter_id (Valid)
  const chQuiz = await request(app)
    .post('/api/quizzes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Respiration Chapter End Assessment',
      quiz_type: 'chapter',
      chapter_id: testChapterId,
      time_limit_minutes: 25,
      pass_marks: 10,
      status: 'published',
    });
  assert.equal(chQuiz.status, 201);
  assert.equal(chQuiz.body.data.quiz_type, 'chapter');

  // Clean up the chapter quiz
  await Quiz.findByIdAndDelete(chQuiz.body.data._id);
});

test('3.4 - Manage quiz questions: Positive marks, option sets, and correct_answer secrecy', async () => {
  // 1. Add Question 1
  const q1Res = await request(app)
    .post('/api/questions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      quiz_id: testQuizId,
      question_text: 'Where does Glycolysis take place in a eukaryotic cell?',
      options: [
        { option_label: 'A', option_text: 'Cytoplasm (Cytosol)' },
        { option_label: 'B', option_text: 'Mitochondrial Matrix' },
        { option_label: 'C', option_text: 'Thylakoid Membrane' },
        { option_label: 'D', option_text: 'Nucleoplasm' },
      ],
      correct_answer: 'A',
      positive_marks: 5,
      explanation: 'Glycolysis occurs in the cytoplasm and requires no oxygen.',
      order: 1,
    });
  assert.equal(q1Res.status, 201);
  testQuestion1Id = q1Res.body.data._id;

  // 2. Add Question 2
  const q2Res = await request(app)
    .post('/api/questions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      quiz_id: testQuizId,
      question_text: 'What is the net ATP yield from one molecule of glucose during glycolysis?',
      options: [
        { option_label: 'A', option_text: '4 ATP' },
        { option_label: 'B', option_text: '2 ATP' },
        { option_label: 'C', option_text: '36 ATP' },
        { option_label: 'D', option_text: '38 ATP' },
      ],
      correct_answer: 'B',
      positive_marks: 5,
      explanation: 'Gross production is 4 ATP, but 2 ATP are consumed, resulting in a net yield of 2 ATP.',
      order: 2,
    });
  assert.equal(q2Res.status, 201);
  testQuestion2Id = q2Res.body.data._id;

  // 3. Quiz total_marks updated to 10
  const quizDb = await Quiz.findById(testQuizId);
  assert.equal(quizDb.total_marks, 10);

  // 4. Critical Security Rule: When student starts quiz, correct_answer is completely omitted!
  const studentStart = await request(app)
    .get(`/api/quizzes/${testQuizId}/start`)
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(studentStart.status, 200);
  assert.ok(studentStart.body.data.questions);
  assert.equal(studentStart.body.data.questions.length, 2);

  studentStart.body.data.questions.forEach((q) => {
    assert.equal(q.correct_answer, undefined, 'CRITICAL: correct_answer must NOT be exposed before submission');
  });

  testAttemptId = studentStart.body.data.attempt_id;
});

// ==========================================
// SPRINT 3 AUDIT TESTS
// ==========================================

test('3.3 - Manage weekly challenge quizzes: Window availability and eligibility', async () => {
  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const challengeRes = await request(app)
    .post('/api/challenges')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      quiz_id: testQuizId,
      title: 'HSC Biology National Sprint Challenge #1',
      description: 'Weekly national contest on Cell Physiology and Cytology.',
      start_date: now.toISOString(),
      end_date: nextWeek.toISOString(),
      is_premium_only: false,
      status: 'published',
    });
  assert.equal(challengeRes.status, 201);
  testChallengeId = challengeRes.body.data._id;

  // Student can view active challenges
  const listRes = await request(app).get('/api/challenges');
  assert.equal(listRes.status, 200);
  const found = listRes.body.data.some((c) => c._id === testChallengeId);
  assert.equal(found, true);
});

test('3.7 & 3.8 - Take quiz, server-side scoring, instant results, and answer review', async () => {
  // Student submits: Question 1 = 'A' (correct, +5), Question 2 = 'A' (incorrect, correct is B, 0)
  const submitRes = await request(app)
    .post(`/api/quizzes/${testQuizId}/submit`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      answers: [
        { question_id: testQuestion1Id, selected_option: 'A' },
        { question_id: testQuestion2Id, selected_option: 'A' },
      ],
    });
  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.body.success, true);
  const attempt = submitRes.body.data;

  // Server-side calculated score
  assert.equal(attempt.obtained_marks, 5);
  assert.equal(attempt.total_marks, 10);
  assert.equal(attempt.score, 50); // 50% score
  assert.equal(attempt.correct_count, 1);
  assert.equal(attempt.incorrect_count, 1);
  assert.equal(attempt.status, 'submitted');

  // Verify duplicate submission rejection (idempotency)
  const dupSubmit = await request(app)
    .post(`/api/quizzes/${testQuizId}/submit`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ answers: [] });
  assert.equal(dupSubmit.status, 409);

  // Student reviews submitted answers
  const reviewRes = await request(app)
    .get(`/api/attempts/${attempt._id}`)
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(reviewRes.status, 200);
  assert.ok(reviewRes.body.data.questions);
  assert.equal(reviewRes.body.data.questions.length, 2);

  // Review reveals correct answer & explanation post-submission
  const attemptData = reviewRes.body.data.attempt;
  const questionsData = reviewRes.body.data.questions;
  const q1Review = questionsData.find((q) => q._id.toString() === testQuestion1Id);
  assert.ok(q1Review);
  assert.equal(q1Review.correct_answer, 'A');
  assert.ok(q1Review.explanation.includes('cytoplasm'));

  const studentAns = attemptData.answers.find((a) => a.question_id.toString() === testQuestion1Id);
  assert.ok(studentAns);
  assert.equal(studentAns.selected_option, 'A');
});

test('5.1 - Subscribe to premium: Plan selection, pending lifecycle', async () => {
  const subRes = await request(app)
    .post('/api/subscriptions')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      plan_name: 'Monthly Premium Pro',
      duration_days: 30,
      fee: 499,
    });
  assert.equal(subRes.status, 201);
  assert.equal(subRes.body.data.status, 'pending');
  assert.equal(subRes.body.data.fee, 499);
  assert.equal(subRes.body.data.duration_days, 30);
  testSubscriptionId = subRes.body.data._id;
});

test('5.2 - Process subscription payment: Complete DEMO bKash workflow', async () => {
  // 1. Initiate transaction
  const payRes = await request(app)
    .post('/api/payments')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      subscription_id: testSubscriptionId,
    });
  assert.equal(payRes.status, 201);
  assert.equal(payRes.body.data.status, 'pending');
  assert.equal(payRes.body.data.is_demo, true);
  assert.equal(payRes.body.data.payment_method, 'bkash_demo');
  testPaymentId = payRes.body.data._id;

  // 2. Confirm demo payment
  const confirmRes = await request(app)
    .post(`/api/payments/${testPaymentId}/confirm-demo`)
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(confirmRes.status, 200);
  assert.equal(confirmRes.body.data.payment.status, 'successful');
  assert.ok(confirmRes.body.data.payment.reference_id.startsWith('BIO-'));
  assert.equal(confirmRes.body.data.subscription.status, 'active');

  // Verify DB state
  const updatedSub = await Subscription.findById(testSubscriptionId);
  assert.equal(updatedSub.status, 'active');
  assert.ok(updatedSub.start_date);
  assert.ok(updatedSub.end_date);
  assert.ok(new Date(updatedSub.end_date) > new Date(updatedSub.start_date));
});

test('5.3 - Check subscription status: Validity verification and expiration enforcement', async () => {
  // 1. Verify active subscription query
  const mySubRes = await request(app)
    .get('/api/subscriptions/my')
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(mySubRes.status, 200);
  assert.equal(mySubRes.body.data.status, 'active');

  // 2. Test expiration logic: artificially set end_date in the past
  await Subscription.findByIdAndUpdate(testSubscriptionId, {
    end_date: new Date(Date.now() - 10000), // 10 seconds ago
  });

  const subscriptionService = require('../src/services/subscription.service');
  const studentId = studentUser.id || studentUser._id;
  const isActive = await subscriptionService.checkActiveSubscription(studentId);
  assert.equal(isActive, false, 'Expired subscription must return false');

  // Verify status in DB was automatically updated to expired
  const expiredSub = await Subscription.findById(testSubscriptionId);
  assert.equal(expiredSub.status, 'expired');
});
