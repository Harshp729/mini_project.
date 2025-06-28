const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // React app's address
  credentials: true
}));

app.use(express.json());

// Hardcoded users
const users = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin' },
  { id: 2, username: 'user', password: 'user', role: 'user' }
];

// Sample test data
const tests = [
  {
    id: 1,
    title: "General Knowledge Quiz",
    description: "Test your knowledge with these general questions",
    questions: [
      {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        difficulty: "easy"
      },
      {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        difficulty: "easy"
      },
      {
        id: 3,
        question: "What is the largest mammal in the world?",
        options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        correctAnswer: 1,
        difficulty: "medium"
      }
    ]
  },
  {
    id: 2,
    title: "Science Quiz",
    description: "Test your knowledge of scientific concepts",
    questions: [
      {
        id: 4,
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "H2"],
        correctAnswer: 0,
        difficulty: "easy"
      },
      {
        id: 5,
        question: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Iron", "Diamond", "Platinum"],
        correctAnswer: 2,
        difficulty: "medium"
      }
    ]
  }
];

// Store past test attempts
const pastTests = [];

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      'secret_key',
      { expiresIn: '1h' }
    );
    res.json({ 
      token, 
      role: user.role,
      username: user.username 
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// Get all tests (admin only)
app.get('/tests', authenticateToken, isAdmin, (req, res) => {
  res.json(tests);
});

// Add a new test (admin only)
app.post('/tests', authenticateToken, isAdmin, (req, res) => {
  const newTest = {
    id: tests.length + 1,
    ...req.body,
    questions: []
  };
  tests.push(newTest);
  res.status(201).json(newTest);
});

// Delete a test (admin only)
app.delete('/tests/:id', authenticateToken, isAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const index = tests.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ message: 'Test not found' });
  tests.splice(index, 1);
  res.status(204).send();
});

// Get questions for a specific test (admin only)
app.get('/tests/:id/questions', authenticateToken, isAdmin, (req, res) => {
  const test = tests.find(t => t.id === parseInt(req.params.id));
  if (!test) return res.status(404).json({ message: 'Test not found' });
  res.json(test.questions);
});

// Add a question to a test (admin only)
app.post('/tests/:id/questions', authenticateToken, isAdmin, (req, res) => {
  const test = tests.find(t => t.id === parseInt(req.params.id));
  if (!test) return res.status(404).json({ message: 'Test not found' });
  
  const newQuestion = {
    id: test.questions.length + 1,
    ...req.body
  };
  test.questions.push(newQuestion);
  res.status(201).json(newQuestion);
});

// Delete a question from a test (admin only)
app.delete('/tests/:testId/questions/:questionId', authenticateToken, isAdmin, (req, res) => {
  const test = tests.find(t => t.id === parseInt(req.params.testId));
  if (!test) return res.status(404).json({ message: 'Test not found' });
  
  const questionIndex = test.questions.findIndex(q => q.id === parseInt(req.params.questionId));
  if (questionIndex === -1) return res.status(404).json({ message: 'Question not found' });
  
  test.questions.splice(questionIndex, 1);
  res.status(204).send();
});

// Get all tests for user
app.get('/user/tests', authenticateToken, (req, res) => {
  const simplifiedTests = tests.map(({ id, title, description }) => ({ id, title, description }));
  res.json(simplifiedTests);
});

// Get quiz questions for a specific test and difficulty (user only)
app.get('/user/tests/:id/quiz', authenticateToken, (req, res) => {
  const testId = parseInt(req.params.id);
  const test = tests.find(t => t.id === testId);
  
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }

  // Return both test info and questions
  res.json({
    test: {
      id: test.id,
      title: test.title,
      description: test.description
    },
    questions: test.questions
  });
});

// Register new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Create new user (always as regular user)
  const newUser = {
    id: users.length + 1,
    username,
    password, // In a real app, you would hash this password
    role: 'user' // Force role to be 'user'
  };

  users.push(newUser);

  // Generate token
  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, role: newUser.role },
    'secret_key',
    { expiresIn: '1h' }
  );

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    }
  });
});

// Save test attempt
app.post('/user/test-attempt', authenticateToken, (req, res) => {
  try {
    console.log('Received test attempt:', req.body);
    console.log('User from token:', req.user);

    const { testId, score, totalQuestions } = req.body;
    
    if (!testId || score === undefined || !totalQuestions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const test = tests.find(t => t.id === parseInt(testId));
    
    if (!test) {
      console.log('Test not found:', testId);
      return res.status(404).json({ message: 'Test not found' });
    }

    const attempt = {
      id: pastTests.length + 1,
      userId: req.user.id,
      testId: parseInt(testId),
      title: test.title,
      score: parseInt(score),
      totalQuestions: parseInt(totalQuestions),
      date: new Date()
    };

    console.log('Saving attempt:', attempt);
    pastTests.push(attempt);
    res.status(201).json(attempt);
  } catch (error) {
    console.error('Error saving test attempt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's past tests
app.get('/user/past-tests', authenticateToken, (req, res) => {
  const userPastTests = pastTests.filter(test => test.userId === req.user.id);
  res.json(userPastTests);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 