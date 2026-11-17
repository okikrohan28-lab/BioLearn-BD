const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const env = require('../src/config/env');
const Resource = require('../src/models/Resource');
const Question = require('../src/models/Question');
const { fileFilter } = require('../src/middleware/upload.middleware');

const createAdminToken = () => {
  return jwt.sign(
    { id: '507f1f77bcf86cd799439011', role: 'admin', email: 'admin@biolearn.edu.bd' },
    env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );
};

const createStudentToken = () => {
  return jwt.sign(
    { id: '507f1f77bcf86cd799439012', role: 'student', email: 'student@biolearn.edu.bd' },
    env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );
};

test('Corrections Part 1.1 & 1.5 - Admin Premium and Subscription Route Protection', async () => {
  // Non-authenticated user should be blocked from GET /api/subscriptions
  const unauthRes = await request(app).get('/api/subscriptions');
  assert.equal(unauthRes.status, 401, 'Unauthenticated request to /api/subscriptions must return 401');

  // Student should be forbidden from accessing admin subscriptions endpoint
  const studentToken = createStudentToken();
  const studentRes = await request(app)
    .get('/api/subscriptions')
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(studentRes.status, 403, 'Student access to /api/subscriptions must return 403 Forbidden');
});

test('Corrections Part 1.4 - Bulk Question Creation Endpoint Authorization & Validation', async () => {
  const adminToken = createAdminToken();
  const studentToken = createStudentToken();

  // Student forbidden
  const studentRes = await request(app)
    .post('/api/questions/bulk')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ quiz_id: '507f1f77bcf86cd799439013', questions: [] });
  assert.equal(studentRes.status, 403, 'Student must not be allowed to bulk create questions');

  // Admin validation error when questions array is missing or empty
  const emptyRes = await request(app)
    .post('/api/questions/bulk')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ quiz_id: '507f1f77bcf86cd799439013', questions: [] });
  assert.equal(emptyRes.status, 400, 'Empty questions array must return 400 Bad Request');
  assert.match(emptyRes.body.message, /at least one question/i);

  // Missing quiz_id validation
  const noQuizRes = await request(app)
    .post('/api/questions/bulk')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ questions: [{ question_text: 'Sample?' }] });
  assert.equal(noQuizRes.status, 400, 'Missing quiz_id must return 400 Bad Request');
});

test('Corrections Part 1.3 - Learning Resource Upload Middleware Filter & Restrictions', () => {
  // Test PDF allowed
  let allowedPdf = false;
  fileFilter({}, { originalname: 'botany-notes.pdf', mimetype: 'application/pdf' }, (err, allow) => {
    allowedPdf = allow && !err;
  });
  assert.equal(allowedPdf, true, 'PDF documents must be accepted');

  // Test DOC and DOCX allowed
  let allowedDoc = false;
  fileFilter({}, { originalname: 'zoology-syllabus.docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }, (err, allow) => {
    allowedDoc = allow && !err;
  });
  assert.equal(allowedDoc, true, 'DOCX documents must be accepted');

  // Test JPEG and PNG allowed
  let allowedImage = false;
  fileFilter({}, { originalname: 'plant-cell.png', mimetype: 'image/png' }, (err, allow) => {
    allowedImage = allow && !err;
  });
  assert.equal(allowedImage, true, 'PNG images must be accepted');

  // Test Executable / Disallowed File Rejected
  let rejectedExe = false;
  fileFilter({}, { originalname: 'malware.exe', mimetype: 'application/x-msdownload' }, (err, allow) => {
    if (err || !allow) rejectedExe = true;
  });
  assert.equal(rejectedExe, true, 'Executable or disallowed extensions must be rejected');
});

test('Corrections Part 1.3 - Resource Schema Supports Upload Fields and Enums', () => {
  const resource = new Resource({
    topic_id: '507f1f77bcf86cd799439014',
    title: 'Cell Division Diagram',
    resource_type: 'diagram',
    file_url: '/uploads/resources/diagram-1234.png',
    file_name: 'diagram.png',
    file_type: 'image/png',
    file_size: 1048576,
  });

  assert.equal(resource.resource_type, 'diagram');
  assert.equal(resource.file_url, '/uploads/resources/diagram-1234.png');
  assert.equal(resource.file_name, 'diagram.png');
  assert.equal(resource.file_size, 1048576);
});
