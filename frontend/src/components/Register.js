import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';
import { ID, Query } from 'appwrite';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Check if username already exists
      const existingUsers = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('username', username)]
      );

      if (existingUsers.documents.length > 0) {
        throw new Error('Username already exists');
      }

      // Create new user
      const newUser = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        {
          username,
          password, // Note: In production, hash this password
          role: 'user', // Force role to be 'user'
          createdAt: new Date().toISOString()
        }
      );

      // Store user info in localStorage
      localStorage.setItem('token', newUser.$id);
      localStorage.setItem('role', newUser.role);
      localStorage.setItem('username', newUser.username);

      // Redirect to test selection
      navigate('/test-selection');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message.includes('not authorized') || err.message.includes('permission')) {
        setError('Unable to access the database. Please try again later.');
      } else {
        setError(err.message || 'An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Register</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Choose a password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register; 