const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// --- RUTAS ESTUDIANTE ---

// Ruta para "Mis Aprendizajes": /api/enrollments/user/:userId
router.get('/user/:userId', verifyToken, enrollmentController.getUserEnrollments);

// Verificar si está inscrito en un curso específico
router.get('/courses/:courseId/check-enrollment', verifyToken, enrollmentController.checkEnrollment);

// Inscribirse
router.post('/courses/:courseId/enroll', verifyToken, enrollmentController.enrollStudent);

// --- RUTAS ADMIN ---
router.get('/pending', verifyToken, verifyAdmin, enrollmentController.getPendingEnrollments);
router.patch('/:id/approve', verifyToken, verifyAdmin, enrollmentController.approveEnrollment);
router.delete('/:id/reject', verifyToken, verifyAdmin, enrollmentController.rejectEnrollment);

module.exports = router;