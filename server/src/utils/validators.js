const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    phone: z.string().trim().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

const profileUpdateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().trim().optional(),
  }),
});

const paperSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).trim().min(2, 'Title must be at least 2 characters'),
    subject: z.string().trim().default('Biology'),
    access_level: z.enum(['free', 'premium']).default('free'),
    status: z.enum(['published', 'draft', 'archived']).default('published'),
    description: z.string().trim().optional(),
  }),
});

const chapterSchema = z.object({
  body: z.object({
    paper_id: z.string({ required_error: 'Paper ID is required' }).regex(objectIdRegex, 'Invalid Paper ID format'),
    chapter_no: z.coerce.number({ required_error: 'Chapter number is required' }).int().min(1, 'Chapter number must be at least 1'),
    title: z.string({ required_error: 'Title is required' }).trim().min(2, 'Title must be at least 2 characters'),
    description: z.string().trim().optional(),
    status: z.enum(['published', 'draft', 'archived']).default('published'),
  }),
});

const topicSchema = z.object({
  body: z.object({
    chapter_id: z.string({ required_error: 'Chapter ID is required' }).regex(objectIdRegex, 'Invalid Chapter ID format'),
    topic_no: z.coerce.number({ required_error: 'Topic number is required' }).int().min(1, 'Topic number must be at least 1'),
    title: z.string({ required_error: 'Title is required' }).trim().min(2, 'Title must be at least 2 characters'),
    description: z.string().trim().optional(),
    status: z.enum(['published', 'draft', 'archived']).default('published'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  paperSchema,
  chapterSchema,
  topicSchema,
};
