import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS, getQuestions } from '../appwrite';
import { Query } from 'appwrite';

function TestSelection() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TESTS
        );
        
        // Fetch questions for each test
        const testsWithQuestions = await Promise.all(
          response.documents.map(async (test) => {
            try {
              const questionsResponse = await getQuestions(test.$id);
              return {
                ...test,
                questionCount: questionsResponse.documents.length
              };
            } catch (err) {
              console.error(`Error fetching questions for test ${test.$id}:`, err);
              return {
                ...test,
                questionCount: 0
              };
            }
          })
        );
        
        setTests(testsWithQuestions);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setError('Failed to load tests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleStartTest = (testId) => {
    navigate(`/quiz/${testId}`);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading available tests...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: '#dc3545',
        fontSize: '1.2rem'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#333',
        fontSize: '2rem'
      }}>
        Available Tests
      </h1>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        padding: '1rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {tests.map((test) => (
          <div
            key={test.$id}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              aspectRatio: '1',
              width: '100%',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
              }
            }}
            onClick={() => handleStartTest(test.$id)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            <h2 style={{ 
              margin: 0,
              color: '#333',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}>
              {test.title}
            </h2>
            
            <div style={{ 
              color: '#666',
              fontSize: '1rem',
              textAlign: 'center',
              flexGrow: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical'
            }}>
              {test.description}
            </div>

            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#666',
              fontSize: '0.9rem',
              borderTop: '1px solid #eee',
              paddingTop: '1rem',
              marginTop: 'auto'
            }}>
              <span>Questions: {test.questionCount}</span>
            </div>

            <button
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#0056b3';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#007bff';
              }}
            >
              Start Test
            </button>
          </div>
        ))}
      </div>

      {tests.length === 0 && !error && (
        <div className="alert alert-info">
          No tests available at the moment.
        </div>
      )}
    </div>
  );
}

export default TestSelection; 