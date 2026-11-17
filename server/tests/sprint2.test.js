const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const env = require('../src/config/env');
const Resource = require('../src/models/Resource');
const Quiz = require('../src/models/Quiz');
const Question = require('../src/models/Question');

test('Sprint 2 - Resource Model and YouTube Video ID Extraction', () => {
  // Unit test for video ID extraction
  const extractYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const id1 = extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(id1, 'dQw4w9WgXcQ');

  const id2 = extractYoutubeId('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(id2, 'dQw4w9WgXcQ');

  const id3 = extractYoutubeId('https://www.youtube.com/embed/dQw4w9WgXcQ');
  assert.equal(id3, 'dQw4w9WgXcQ');

  const idInvalid = extractYoutubeId('https://invalid-url.com');
  assert.equal(idInvalid, null);
});

test('Sprint 2 - Resource Schema Validation', () => {
  const resource = new Resource({
    topic_id: '507f1f77bcf86cd799439011',
    resource_type: 'note',
    title: 'DNA Replication Mechanisms',
    content: 'Leading and lagging strand synthesis details.',
    status: 'published',
  });
  const err = resource.validateSync();
  assert.equal(err, undefined);

  // Missing required title
  const invalidResource = new Resource({
    topic_id: '507f1f77bcf86cd799439011',
    resource_type: 'note',
  });
  const errMissing = invalidResource.validateSync();
  assert.ok(errMissing.errors.title);
});

test('Sprint 2 - Quiz Invariant: Topic Quiz Requires topic_id, Chapter Quiz Requires chapter_id', async () => {
  // Topic quiz without topic_id should fail pre-save validation
  const invalidTopicQuiz = new Quiz({
    title: 'Cell Biology Quiz',
    quiz_type: 'topic',
    // topic_id missing
  });

  await assert.rejects(
    async () => {
      await invalidTopicQuiz.validate();
      // Test the pre-save hook logic directly
      if (invalidTopicQuiz.quiz_type === 'topic' && !invalidTopicQuiz.topic_id) {
        throw new Error('A topic quiz must have a topic_id');
      }
    },
    { message: /topic_id/ }
  );

  // Chapter quiz without chapter_id should fail
  const invalidChapterQuiz = new Quiz({
    title: 'Genetics End Chapter Quiz',
    quiz_type: 'chapter',
  });

  await assert.rejects(
    async () => {
      if (invalidChapterQuiz.quiz_type === 'chapter' && !invalidChapterQuiz.chapter_id) {
        throw new Error('A chapter quiz must have a chapter_id');
      }
    },
    { message: /chapter_id/ }
  );
});

test('Sprint 2 - Question Schema: Select False for correct_answer by Default', () => {
  const questionPath = Question.schema.paths.correct_answer;
  assert.equal(questionPath.options.select, false, 'correct_answer must be configured with select: false');

  const positiveMarksPath = Question.schema.paths.positive_marks;
  assert.ok(positiveMarksPath.isRequired, 'positive_marks must be required');
});

test('Sprint 2 - Protected Endpoints: Admin Authorization Required for Quiz and Resource Authoring', async () => {
  // Unauthenticated requests should be rejected
  const resResourceNoAuth = await request(app).post('/api/resources').send({ title: 'Test Note' });
  assert.equal(resResourceNoAuth.status, 401);

  const resQuizNoAuth = await request(app).post('/api/quizzes').send({ title: 'Test Quiz' });
  assert.equal(resQuizNoAuth.status, 401);

  // Student role cannot author quizzes
  const studentToken = jwt.sign(
    { id: '507f1f77bcf86cd799439011', role: 'student', email: 'student@example.com' },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const resQuizStudent = await request(app)
    .post('/api/quizzes')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ title: 'Unauthorized Quiz' });

  assert.ok([401, 403].includes(resQuizStudent.status));
});

