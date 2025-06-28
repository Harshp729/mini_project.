# mini_project

## Step into the frontend directory
cd frontend

## Install all required dependencies
npm install

## Install Appwrite SDK (if not already included in package.json)
npm install appwrite

## Start the development server
npm start


#project overveiw

“AI-Based Adaptive MCQ System” — a smart exam platform that adjusts question difficulty in real-time based on user performance. The goal is to make online assessments more personalized, fair, and efficient. Instead of a one-size-fits-all test, this system adapts to the student's knowledge level during the exam, creating a tailored learning and evaluation experience.
Most traditional online tests follow a static structure where all users receive the same set of questions, regardless of their individual skill levels. This often leads to unfair evaluation — some users find it too easy, while others find it too difficult. My project solves this by introducing adaptive testing logic that mimics human-like decision-making. It aims to support students in identifying their actual proficiency and encourages learning through progression.

🔹 Key Features
Adaptive Questioning: The test begins with a medium-level question. If the user answers correctly, the difficulty increases; if wrong, it decreases. This continues for a total of 10 questions.

User Authentication: Secure login/signup system for individual users.

Intro Page & Course Selection: After logging in, users view an introduction page and select from a list of available courses for the exam.

User Dashboard: Each user has a dashboard to view their past exam results, number of correct/wrong answers, and performance trends.
