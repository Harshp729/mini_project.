import { Client, Account, Databases, ID, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68235c51001dae7844e5');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);

// Database and Collection IDs
export const DATABASE_ID = '68235d040031822e3290';
export const COLLECTIONS = {
    USERS: '68236861001c898c10dc',
    TESTS: '68236ad0001e9353c37f',
    QUESTIONS: '68236b9a001489f4cf83',
    TEST_ATTEMPTS: '68236c75000c9ee33197'
};

// Helper function to handle Appwrite errors
const handleAppwriteError = (error) => {
    console.error('Appwrite Error:', error);
    if (error.code === 401) {
        throw new Error('You are not authorized to perform this action. Please log in.');
    } else if (error.code === 404) {
        throw new Error('The requested resource was not found.');
    } else if (error.code === 403) {
        throw new Error('You do not have permission to perform this action.');
    } else {
        throw new Error(error.message || 'An error occurred while communicating with the server.');
    }
};

// User functions
export const createUser = async (username, password, role = 'user') => {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            ID.unique(),
            {
                username,
                password, // Note: In production, hash this password
                role,
                createdAt: new Date().toISOString()
            }
        );
    } catch (error) {
        handleAppwriteError(error);
    }
};

export const getUser = async (userId) => {
    try {
        return await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            userId
        );
    } catch (error) {
        handleAppwriteError(error);
    }
};

// Test functions
export const createTest = async (title, description) => {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.TESTS,
            ID.unique(),
            {
                title,
                description,
                createdAt: new Date().toISOString()
            }
        );
    } catch (error) {
        handleAppwriteError(error);
    }
};

export const getTests = async () => {
    try {
        return await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TESTS
        );
    } catch (error) {
        handleAppwriteError(error);
    }
};

// Question functions
export const createQuestion = async (testId, question, options, correctAnswer, difficulty) => {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.QUESTIONS,
            ID.unique(),
            {
                testId,
                question,
                options,
                correctAnswer,
                difficulty,
                createdAt: new Date().toISOString()
            }
        );
    } catch (error) {
        handleAppwriteError(error);
    }
};

export const getQuestions = async (testId) => {
    try {
        return await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.QUESTIONS,
            [
                Query.equal('testId', testId)
            ]
        );
    } catch (error) {
        handleAppwriteError(error);
    }
};

// Test attempt functions
export const saveTestAttempt = async (attemptData) => {
    try {
        const response = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.TEST_ATTEMPTS,
            ID.unique(),
            {
                userId: attemptData.userId,
                testId: attemptData.testId,
                score: attemptData.score,
                totalQuestions: attemptData.totalQuestions,
                questionResponses: attemptData.questionResponses,
                date: attemptData.date
            }
        );
        return response;
    } catch (error) {
        handleAppwriteError(error);
        throw error;
    }
};

export const getUserAttempts = async (userId) => {
    try {
        return await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TEST_ATTEMPTS,
            [
                Query.equal('userId', userId)
            ]
        );
    } catch (error) {
        handleAppwriteError(error);
    }
}; 