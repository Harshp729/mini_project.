import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function NavBar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('role') === 'admin';
  const username = localStorage.getItem('username');

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hide navbar on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Hide navbar if logged out
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear data and redirect even if there's an error
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Quiz App</Link>
      </div>
      <div className="nav-links">
        {isAdmin ? (
          <>
            <button onClick={handleLogout} className="nav-link">Logout</button>
          </>
        ) : (
          <div className="profile-dropdown" style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              className="profile-button"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ 
                minWidth: 120,
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {username || 'Profile'}
              <span style={{ fontSize: '0.8rem' }}>▼</span>
            </button>
            {showDropdown && (
              <div 
                className="dropdown-menu" 
                style={{ 
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  minWidth: '200px',
                  zIndex: 1000
                }}
              >
                <Link 
                  to="/test-selection" 
                  className="dropdown-item" 
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Available Tests
                </Link>
                <Link 
                  to="/past-tests" 
                  className="dropdown-item" 
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Past Tests
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    color: '#dc3545',
                    textDecoration: 'none',
                    border: 'none',
                    backgroundColor: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar; 