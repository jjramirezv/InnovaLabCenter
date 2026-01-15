const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// ✅ CAMBIO CLAVE: Importa el middleware que SÍ usa Cloudinary
// (Asegúrate de que la ruta al archivo sea la correcta, ej: '../middleware/upload')
const upload = require('../middleware/upload'); 

// === RUTAS LECCIONES ===
router.get('/lessons/:id', verifyToken, verifyAdmin, courseController.getLessonById);
router.put('/lessons/:id', verifyToken, verifyAdmin, courseController.updateLesson);
router.delete('/lessons/:id', verifyToken, verifyAdmin, courseController.deleteLesson);

// === RUTAS CURSOS ===
router.get('/', courseController.getAllCourses);

// Aquí 'upload.single' ahora usará Cloudinary automáticamente
router.post('/', verifyToken, verifyAdmin, upload.single('imagen'), courseController.createCourse);

// === GESTIÓN ESTUDIANTES (Alumno) ===
router.post('/:id/enroll', verifyToken, courseController.enrollStudent);
router.get('/:id/check-enrollment', verifyToken, courseController.checkEnrollment);

// === GESTIÓN ESTUDIANTES (Admin) ===
router.get('/:id/lessons', courseController.getCourseLessons);
router.post('/:id/lessons', verifyToken, verifyAdmin, courseController.addLesson);
router.get('/:id/students', verifyToken, verifyAdmin, courseController.getEnrolledStudents);
router.post('/:id/students', verifyToken, verifyAdmin, courseController.adminEnrollStudent); 
router.delete('/:id/students/:enrollmentId', verifyToken, verifyAdmin, courseController.removeStudent); 
router.put('/:id/students/:enrollmentId', verifyToken, verifyAdmin, courseController.updateStudentProgress); 

// === CRUD CURSO ===
router.get('/:id', courseController.getCourseById);

// Aquí también usará Cloudinary
router.put('/:id', verifyToken, verifyAdmin, upload.single('imagen'), courseController.updateCourse);

router.delete('/:id', verifyToken, verifyAdmin, courseController.deleteCourse);

module.exports = router;