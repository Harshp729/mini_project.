import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileDropdown({ username, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="profile-icon">👤</span>
        <span className="username">{username}</span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <button onClick={() => {
            setIsOpen(false);
            navigate('/past-tests');
          }}>
            Past Tests
          </button>
          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown; 