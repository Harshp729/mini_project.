# MCQ Quiz Backend

This is the backend for the MCQ Quiz Platform. It provides endpoints for authentication, managing questions, and retrieving quiz questions.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

The server runs on port 5000.

## Endpoints

- **POST /login**: Login with username and password. Returns a JWT token and role.
- **GET /questions**: Get all questions (admin only).
- **POST /questions**: Add a new question (admin only).
- **PUT /questions/:id**: Update a question (admin only).
- **DELETE /questions/:id**: Delete a question (admin only).
- **GET /quiz**: Get quiz questions by difficulty (user only).

## Hardcoded Data

- Users: admin/admin, user/user
- Questions: Sample questions with difficulty levels (easy, medium, hard) 