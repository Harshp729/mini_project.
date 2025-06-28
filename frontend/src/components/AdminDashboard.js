import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS, createTest, createQuestion, getTests, getQuestions } from '../appwrite';
import { Query } from 'appwrite';

function AdminDashboard() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTest, setNewTest] = useState({ title: '', description: '' });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'easy'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await getTests();
      setTests(response.documents);
      if (response.documents.length > 0) {
        setSelectedTest(response.documents[0]);
        await fetchQuestions(response.documents[0].$id);
      }
    } catch (err) {
      setError('Failed to load tests');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (testId) => {
    try {
      const response = await getQuestions(testId);
      setQuestions(response.documents);
    } catch (err) {
      setError('Failed to load questions');
      console.error('Error fetching questions:', err);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const test = await createTest(newTest.title, newTest.description);
      setTests([...tests, test]);
      setNewTest({ title: '', description: '' });
      setSuccess('Test added successfully');
    } catch (err) {
      setError(err.message || 'Failed to add test');
      console.error('Error creating test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.TESTS,
        testId
      );
      setSuccess('Test deleted successfully');
      fetchTests();
    } catch (err) {
      setError('Failed to delete test');
      console.error('Error deleting test:', err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedTest) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const question = await createQuestion(
        selectedTest.$id,
        newQuestion.question,
        newQuestion.options,
        newQuestion.options[newQuestion.correctAnswer],
        newQuestion.difficulty
      );

      setQuestions([...questions, question]);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'easy'
      });
      setSuccess('Question added successfully');
    } catch (err) {
      setError(err.message || 'Failed to add question');
      console.error('Error creating question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.QUESTIONS,
        questionId
      );
      setSuccess('Question deleted successfully');
      fetchQuestions(selectedTest.$id);
    } catch (err) {
      setError('Failed to delete question');
      console.error('Error deleting question:', err);
    }
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
        Loading dashboard...
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
        Admin Dashboard
      </h1>

      {error && (
        <div style={{
          backgroundColor: '#fff3f3',
          color: '#dc3545',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#f0fff4',
          color: '#2f855a',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #c6f6d5'
        }}>
          {success}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem'
      }}>
        {/* Left Column - Tests */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Add New Test Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 style={{ 
              margin: '0 0 1.5rem 0',
              color: '#333',
              fontSize: '1.5rem'
            }}>
              Add New Test
            </h2>
            <form onSubmit={handleAddTest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  Title:
                </label>
                <input
                  type="text"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  Description:
                </label>
                <textarea
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#0056b3';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#007bff';
                }}
              >
                {loading ? 'Adding...' : 'Add Test'}
              </button>
            </form>
          </div>

          {/* Tests List */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 style={{ 
              margin: '0 0 1.5rem 0',
              color: '#333',
              fontSize: '1.5rem'
            }}>
              Tests
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tests.map((test) => (
                <div 
                  key={test.$id} 
                  style={{
                    backgroundColor: selectedTest?.$id === test.$id ? '#e7f1ff' : '#f8f9fa',
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => {
                    setSelectedTest(test);
                    fetchQuestions(test.$id);
                  }}
                >
                  <h3 style={{ 
                    margin: 0,
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>
                    {test.title}
                  </h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTest(test.$id);
                    }}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Questions */}
        {selectedTest && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            <h2 style={{ 
              margin: '0 0 1.5rem 0',
              color: '#333',
              fontSize: '1.5rem'
            }}>
              Add Question to {selectedTest.title}
            </h2>
            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  Question:
                </label>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>
              {newQuestion.options.map((option, index) => (
                <div key={index}>
                  <label style={{ 
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Option {index + 1}:
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options];
                      newOptions[index] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: newOptions });
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  Correct Answer:
                </label>
                <select
                  value={newQuestion.correctAnswer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }}
                >
                  {newQuestion.options.map((_, index) => (
                    <option key={index} value={index}>Option {index + 1}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Add Question
              </button>
            </form>

            {/* Questions List */}
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                margin: '0 0 1rem 0',
                color: '#333',
                fontSize: '1.2rem'
              }}>
                Existing Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {questions.map((question) => (
                  <div 
                    key={question.$id}
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ 
                        margin: '0 0 0.5rem 0',
                        color: '#333',
                        fontSize: '1rem'
                      }}>
                        {question.question}
                      </p>
                      <div style={{ 
                        color: '#666',
                        fontSize: '0.9rem'
                      }}>
                        Correct Answer: {question.correctAnswer}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteQuestion(question.$id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 