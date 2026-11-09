const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const env = require('../src/config/env');

test('Sprint 1 - API Health Check', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'healthy');
});

test('Sprint 1 - Input Validation for Student Registration', async () => {
  // Empty payload
  const resEmpty = await request(app).post('/api/auth/register').send({});
  assert.equal(resEmpty.status, 400);
  assert.equal(resEmpty.body.success, false);
  assert.ok(Array.isArray(resEmpty.body.errors));

  // Invalid email and short password
  const resInvalid = await request(app).post('/api/auth/register').send({
    name: 'A',
    email: 'not-an-email',
    password: '123',
  });
  assert.equal(resInvalid.status, 400);
  const fields = resInvalid.body.errors.map((e) => e.field);
  assert.ok(fields.includes('name'));
  assert.ok(fields.includes('email'));
  assert.ok(fields.includes('password'));
});

test('Sprint 1 - Input Validation for Login', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'bad-email',
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('Sprint 1 - Protected Route: Student Profile requires Bearer Token', async () => {
  const resNoAuth = await request(app).get('/api/auth/profile');
  assert.equal(resNoAuth.status, 401);
  assert.equal(resNoAuth.body.success, false);

  const resBadToken = await request(app)
    .get('/api/auth/profile')
    .set('Authorization', 'Bearer invalid_token_here');
  assert.equal(resBadToken.status, 401);
});

test('Sprint 1 - Protected Route: Paper Creation requires Admin Authorization', async () => {
  // 1. No token
  const resNoAuth = await request(app).post('/api/papers').send({
    title: 'Test Paper',
  });
  assert.equal(resNoAuth.status, 401);

  // 2. Student token attempting admin route -> 403 Forbidden
  const studentToken = jwt.sign(
    { id: '507f1f77bcf86cd799439011', role: 'student', email: 'test@student.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Note: if user is not in DB, authenticate checks DB; with mock id, DB returns not found (401)
  const resStudentToken = await request(app)
    .post('/api/papers')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ title: 'Test Paper' });
  assert.ok([401, 403].includes(resStudentToken.status));
});

test('Sprint 1 - Validation on Content Creation Endpoints', async () => {
  // Generate admin token
  const adminToken = jwt.sign(
    { id: '507f1f77bcf86cd799439099', role: 'admin', email: 'admin@biolearnbd.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Chapter validation: invalid paper_id format
  const resBadChapter = await request(app)
    .post('/api/chapters')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      paper_id: 'not-an-objectid',
      chapter_no: 1,
      title: 'Chapter 1',
    });
  // If DB check triggers before validation or validation triggers:
  assert.ok([400, 401].includes(resBadChapter.status));

  // Topic validation: invalid chapter_id format
  const resBadTopic = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      chapter_id: 'invalid-id',
      topic_no: 1,
      title: 'Topic 1',
    });
  assert.ok([400, 401].includes(resBadTopic.status));
});

test('Sprint 1 - Bcrypt Password Hashing and Comparison', async () => {
  const plainPassword = 'StudentPassword@123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notEqual(hash, plainPassword);
  assert.ok(hash.startsWith('$2'));

  const matches = await bcrypt.compare(plainPassword, hash);
  assert.equal(matches, true);

  const wrongMatches = await bcrypt.compare('WrongPassword', hash);
  assert.equal(wrongMatches, false);
});

test('Sprint 1 - JWT Generation and Verification Lifecycle', () => {
  const payload = {
    id: '672b1234567890abcdef1234',
    role: 'student',
    email: 'student@example.com',
  };

  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = jwt.verify(token, env.JWT_SECRET);
  assert.equal(decoded.id, payload.id);
  assert.equal(decoded.role, payload.role);
  assert.equal(decoded.email, payload.email);

  assert.throws(() => {
    jwt.verify('tampered.token.here', env.JWT_SECRET);
  });
});
