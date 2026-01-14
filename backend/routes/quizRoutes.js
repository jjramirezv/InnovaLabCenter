const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// RUTAS ADMIN
router.get('/admin/results/course/:courseId', verifyToken, verifyAdmin, quizController.getResultsByCourse);
router.delete('/admin/results/:id', verifyToken, verifyAdmin, quizController.deleteQuizAttempt);

// GESTIÓN EXAMEN
router.post('/course/:courseId', verifyToken, verifyAdmin, quizController.createQuiz);
router.patch('/:id/status', verifyToken, verifyAdmin, quizController.updateQuizStatus);
router.delete('/:id', verifyToken, verifyAdmin, quizController.deleteQuiz);

// GESTIÓN PREGUNTAS
router.post('/:quizId/question', verifyToken, verifyAdmin, quizController.addQuestion);
router.delete('/question/:id', verifyToken, verifyAdmin, quizController.deleteQuestion);

// RUTAS ESTUDIANTE / GENERAL
router.get('/:id', verifyToken, quizController.getQuizDetails);
router.post('/submit', verifyToken, quizController.submitQuiz);
router.get('/course/:courseId', verifyToken, quizController.getQuizzesByCourse);

module.exports = router;