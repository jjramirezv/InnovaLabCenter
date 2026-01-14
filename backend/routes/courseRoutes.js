const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// === RUTAS LECCIONES ===
router.get('/lessons/:id', verifyToken, verifyAdmin, courseController.getLessonById);
router.put('/lessons/:id', verifyToken, verifyAdmin, courseController.updateLesson);
router.delete('/lessons/:id', verifyToken, verifyAdmin, courseController.deleteLesson);

// === RUTAS CURSOS ===
router.get('/', courseController.getAllCourses);
router.post('/', verifyToken, verifyAdmin, upload.single('imagen'), courseController.createCourse);

// === GESTIÓN ESTUDIANTES (Alumno) ===
router.post('/:id/enroll', verifyToken, courseController.enrollStudent);
router.get('/:id/check-enrollment', verifyToken, courseController.checkEnrollment);

// === GESTIÓN ESTUDIANTES (Admin) ===
router.get('/:id/lessons', courseController.getCourseLessons);
router.post('/:id/lessons', verifyToken, verifyAdmin, courseController.addLesson);
router.get('/:id/students', verifyToken, verifyAdmin, courseController.getEnrolledStudents);
router.post('/:id/students', verifyToken, verifyAdmin, courseController.adminEnrollStudent); // Alta Express
router.delete('/:id/students/:enrollmentId', verifyToken, verifyAdmin, courseController.removeStudent); // Expulsar
router.put('/:id/students/:enrollmentId', verifyToken, verifyAdmin, courseController.updateStudentProgress); // Editar

// === CRUD CURSO (:id al final) ===
router.get('/:id', courseController.getCourseById);
router.put('/:id', verifyToken, verifyAdmin, upload.single('imagen'), courseController.updateCourse);
router.delete('/:id', verifyToken, verifyAdmin, courseController.deleteCourse);

module.exports = router;