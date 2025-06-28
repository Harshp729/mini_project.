import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';
import { Query } from 'appwrite';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Find user by username
        const users = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USERS,
          [Query.equal('username', formData.username)]
        );

        if (users.documents.length === 0) {
          throw new Error('Invalid username or password');
        }

        const user = users.documents[0];

        // Check password (in production, use proper password hashing)
        if (user.password !== formData.password) {
          throw new Error('Invalid username or password');
        }

        // Store user info in localStorage
        localStorage.setItem('token', user.$id);
        localStorage.setItem('role', user.role);
        localStorage.setItem('username', user.username);

        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/test-selection');
        }
      } else {
        // Check if username already exists
        const existingUsers = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USERS,
          [Query.equal('username', formData.username)]
        );

        if (existingUsers.documents.length > 0) {
          throw new Error('Username already exists');
        }

        // Create new user
        const newUser = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          'unique()', // Appwrite will generate a unique ID
          {
            username: formData.username,
            password: formData.password, // In production, hash this password
            role: 'user', // Default role for new registrations
            createdAt: new Date().toISOString() // Add the required createdAt field
          }
        );

        // Store user info and redirect
        localStorage.setItem('token', newUser.$id);
        localStorage.setItem('role', newUser.role);
        localStorage.setItem('username', newUser.username);
        navigate('/test-selection');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.message.includes('not authorized') || error.message.includes('permission')) {
        setError('Unable to access the database. Please try again later.');
      } else {
        setError(error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#333'
        }}>
          {isLogin ? 'Login' : 'Register'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ color: '#dc3545', textAlign: 'center', marginTop: '0.5rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '1rem'
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ username: '', password: '', confirmPassword: '' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                ':hover': {
                  color: '#0056b3',
                  textDecoration: 'underline'
                }
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#0056b3';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#007bff';
                e.target.style.textDecoration = 'none';
              }}
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; 