import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS, getQuestions, saveTestAttempt } from '../appwrite';
import { Query } from 'appwrite';

function Quiz() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [questionResponses, setQuestionResponses] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      setError('');

      // Get test details
      const testDoc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TESTS,
        testId
      );
      setTest(testDoc);

      // Get all questions for the test
      const questionsResponse = await getQuestions(testId);
      setQuestions(questionsResponse.documents);
    } catch (err) {
      setError('Failed to load test');
      console.error('Error fetching test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) {
      setError('Please select an answer');
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    // Get the selected option text instead of the index
    const selectedOptionText = currentQ.options[selectedAnswer];
    const isCorrect = selectedOptionText === currentQ.correctAnswer;
    
    console.log('Selected Option Text:', selectedOptionText);
    console.log('Correct Answer:', currentQ.correctAnswer);
    console.log('Is Correct:', isCorrect);

    const newScore = isCorrect ? score + 1 : score;

    // Format the response as a string
    const response = {
      questionId: currentQ.$id,
      selectedAnswer: selectedOptionText,
      isCorrect: isCorrect
    };

    setQuestionResponses([...questionResponses, response]);
    setScore(newScore);
    setError('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      try {
        // Set the final score before saving
        setFinalScore(newScore);
        
        // Format responses for Appwrite - keep each response under 255 chars
        const formattedResponses = questionResponses.map((response, index) => {
          const question = questions[index];
          // Create a minimal response object to stay under 255 chars
          const minimalResponse = {
            q: question.$id,
            a: response.selectedAnswer,
            c: response.isCorrect
          };
          return JSON.stringify(minimalResponse);
        });

        await saveTestAttempt({
          userId: localStorage.getItem('token'),
          testId: testId,
          score: newScore,
          totalQuestions: questions.length,
          questionResponses: formattedResponses,
          date: new Date().toISOString()
        });

        setShowResults(true);
      } catch (err) {
        setError('Error saving test attempt: ' + err.message);
        console.error('Error saving test attempt:', err);
      }
    }
  };

  const handleCloseResults = () => {
    navigate('/test-selection', { 
      state: { 
        score: finalScore,
        totalQuestions: questions.length,
        testTitle: test.title
      }
    });
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
        Loading test...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '1rem'
      }}>
        <div style={{ color: '#dc3545', fontSize: '1.2rem' }}>{error}</div>
        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          onClick={() => navigate('/test-selection')}
        >
          Back to Tests
        </button>
      </div>
    );
  }

  if (!test) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '1rem'
      }}>
        <div style={{ color: '#dc3545', fontSize: '1.2rem' }}>Test not found</div>
        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          onClick={() => navigate('/test-selection')}
        >
          Back to Tests
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '1rem'
      }}>
        <div style={{ color: '#dc3545', fontSize: '1.2rem' }}>No questions available for this test</div>
        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          onClick={() => navigate('/test-selection')}
        >
          Back to Tests
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div style={{ 
      padding: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {showResults && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              color: '#333',
              fontSize: '1.8rem',
              marginBottom: '1.5rem'
            }}>
              Quiz Completed!
            </h2>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#007bff',
                marginBottom: '0.5rem'
              }}>
                {Math.round((finalScore / questions.length) * 100)}%
              </div>
              <div style={{
                color: '#666',
                fontSize: '1.1rem',
                marginBottom: '0.5rem'
              }}>
                You scored {finalScore} out of {questions.length} questions
              </div>
              <div style={{
                color: '#666',
                fontSize: '0.9rem'
              }}>
                {finalScore === questions.length ? 'Perfect score! 🎉' : 
                 finalScore >= questions.length * 0.7 ? 'Great job! 👏' : 
                 'Keep practicing! 💪'}
              </div>
            </div>

            <button
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%',
                transition: 'background-color 0.2s ease'
              }}
              onClick={handleCloseResults}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#0056b3';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#007bff';
              }}
            >
              Back to Tests
            </button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto 1.5rem auto'
      }}>
        <h2 style={{ 
          margin: 0,
          color: '#333',
          fontSize: '1.6rem',
          marginBottom: '0.75rem'
        }}>
          {test.title}
        </h2>
        <p style={{ 
          color: '#666',
          fontSize: '1.1rem',
          marginBottom: '1.5rem'
        }}>
          {test.description}
        </p>

        <div style={{ 
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          height: '8px',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          <div 
            style={{ 
              backgroundColor: '#007bff',
              height: '100%',
              borderRadius: '8px',
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              transition: 'width 0.3s ease'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: '0.9rem',
            backgroundColor: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          width: '100%',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ 
            margin: 0,
            color: '#333',
            fontSize: '1.3rem',
            marginBottom: '1.5rem',
            flexGrow: 1,
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            {currentQ.question}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            width: '100%'
          }}>
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: selectedAnswer === index ? '#e7f1ff' : 'white',
                  border: `2px solid ${selectedAnswer === index ? '#007bff' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  height: '60px',
                  width: '100%'
                }}
                onClick={() => handleAnswerSelect(index)}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedAnswer === index ? '#007bff' : '#ddd'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selectedAnswer === index && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#007bff'
                    }} />
                  )}
                </div>
                <span style={{
                  color: '#333',
                  fontSize: '1rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fff3f3',
            color: '#dc3545',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            width: '100%',
            transition: 'background-color 0.2s ease'
          }}
          onClick={handleNext}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#007bff';
          }}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

export default Quiz; 