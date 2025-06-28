import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TestSelection from './components/TestSelection';
import Quiz from './components/Quiz';
import AdminDashboard from './components/AdminDashboard';
import NavBar from './components/NavBar';
import PastTests from './components/PastTests';

// Private Route component
const PrivateRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('role') === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/test-selection" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/test-selection" 
            element={
              <PrivateRoute>
                <TestSelection />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/quiz/:testId" 
            element={
              <PrivateRoute>
                <Quiz />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/past-tests" 
            element={
              <PrivateRoute>
                <PastTests />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/test-selection" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 