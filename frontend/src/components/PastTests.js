import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS } from '../appwrite';
import { Query } from 'appwrite';

function PastTests() {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        const userId = localStorage.getItem('token');
        if (!userId) {
          throw new Error('User not authenticated');
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TEST_ATTEMPTS,
          [Query.equal('userId', userId)]
        );

        // Get test details for each attempt
        const attemptsWithTests = await Promise.all(
          response.documents.map(async (attempt) => {
            try {
              const test = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.TESTS,
                attempt.testId
              );
              return {
                ...attempt,
                testTitle: test.title
              };
            } catch (err) {
              console.error('Error fetching test details:', err);
              return {
                ...attempt,
                testTitle: 'Unknown Test'
              };
            }
          })
        );

        // Sort by date in descending order (most recent first)
        const sortedHistory = attemptsWithTests.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTestHistory(sortedHistory);
      } catch (error) {
        console.error('Error fetching test history:', error);
        setError('Failed to load test history');
      } finally {
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, []);

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
        Loading test history...
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
        Test History
      </h1>

      {testHistory.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          color: '#666'
        }}>
          No test attempts found.
        </div>
      ) : (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {testHistory.map((attempt) => (
            <div
              key={attempt.$id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '3fr 1fr 1fr',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ 
                  margin: 0,
                  color: '#333',
                  fontSize: '1.2rem',
                  marginBottom: '0.5rem'
                }}>
                  {attempt.testTitle}
                </h3>
                <div style={{ 
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  Taken on: {attempt.date ? new Date(attempt.date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Date not available'}
                </div>
              </div>

              <div style={{ 
                textAlign: 'center',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                <div style={{ 
                  color: '#666',
                  fontSize: '0.9rem',
                  marginBottom: '0.25rem'
                }}>
                  Score
                </div>
                <div style={{ 
                  color: '#333',
                  fontSize: '1.2rem',
                  fontWeight: '500'
                }}>
                  {attempt.score}/{attempt.totalQuestions}
                </div>
              </div>

              <div style={{ 
                textAlign: 'center',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px'
              }}>
                <div style={{ 
                  color: '#666',
                  fontSize: '0.9rem',
                  marginBottom: '0.25rem'
                }}>
                  Percentage
                </div>
                <div style={{ 
                  color: '#333',
                  fontSize: '1.2rem',
                  fontWeight: '500'
                }}>
                  {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PastTests; 