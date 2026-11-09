
# BioLearn BD - Development Instructions

## Project
Build BioLearn BD, an interactive Biology learning platform for HSC and university admission students in Bangladesh.

## Stack
- React + Vite
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Tailwind CSS
- JWT Authentication

## Architecture
- Separate frontend and backend.
- Use MVC architecture in Express.
- Keep business logic in services.
- Use reusable React components.
- Use REST APIs.
- Keep database models consistent with docs/BioLearn-ER-Diagram.pdf.

## User Roles
- Student
- Administrator

## Core Features
- Authentication
- Paper/chapter/topic management
- Learning resources
- Topic quizzes
- Chapter-end quizzes
- Quiz results
- Progress tracking
- Leaderboard

## Extended Features
- Achievements
- Weekly challenges
- Premium subscriptions
- Payments
- AI-assisted question generation
- Admin analytics

## Critical Rules
1. Never expose passwords or secrets.
2. Hash passwords.
3. Enforce authorization on backend APIs.
4. Calculate quiz scores on the server.
5. Never expose correct answers before submission.
6. A quiz must belong to exactly one topic OR chapter.
7. AI-generated questions require administrator approval.
8. Payment activation requires verified server-side payment.
9. Do not expose private student information on leaderboards.

## Agent Workflow
Before implementation:
1. Inspect existing files.
2. Review relevant project documentation.
3. Identify dependencies.
4. Propose a plan.
5. Wait for approval before major changes.

After implementation:
1. Explain modified files.
2. Run tests.
3. Fix implementation-related errors.
4. Report unfinished work.
5. Update documentation.

Never rewrite unrelated modules without approval.
