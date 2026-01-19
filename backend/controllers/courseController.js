const db = require('../config/db');
const bcrypt = require('bcrypt');

// 1. LISTAR CURSOS (Público)
exports.getAllCourses = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM courses');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cursos' });
    }
};

// 2. OBTENER CURSO POR ID
exports.getCourseById = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [cleanId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Curso no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error servidor' });
    }
};

// 3. GESTIÓN DE LECCIONES
exports.getCourseLessons = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        const [lessons] = await db.execute('SELECT * FROM lessons WHERE course_id = ? ORDER BY orden ASC', [cleanId]);
        res.json(lessons);
    } catch (error) { res.status(500).json({ message: 'Error al cargar lecciones' }); }
};

exports.getLessonById = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        const [rows] = await db.query('SELECT * FROM lessons WHERE id = ?', [cleanId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Lección no encontrada' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ message: 'Error servidor' }); }
};

exports.addLesson = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        const { titulo, video_url, duracion, orden, descripcion } = req.body;
        await db.execute('INSERT INTO lessons (course_id, titulo, video_url, duracion, orden, descripcion) VALUES (?, ?, ?, ?, ?, ?)', 
            [cleanId, titulo, video_url, duracion, orden, descripcion]);
        res.status(201).json({ message: 'Lección agregada' });
    } catch (error) { res.status(500).json({ message: 'Error al agregar' }); }
};

exports.updateLesson = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        const { titulo, video_url, duracion, orden, descripcion } = req.body;
        await db.execute('UPDATE lessons SET titulo=?, video_url=?, duracion=?, orden=?, descripcion=? WHERE id=?', 
            [titulo, video_url, duracion, orden, descripcion, cleanId]);
        res.json({ message: 'Lección actualizada' });
    } catch (error) { res.status(500).json({ message: 'Error al actualizar' }); }
};

exports.deleteLesson = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        await db.execute('DELETE FROM lessons WHERE id = ?', [cleanId]);
        res.json({ message: 'Lección eliminada' });
    } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
};

// 4. GESTIÓN DE CURSOS (Crear/Editar/Borrar) 

exports.createCourse = async (req, res) => {
    try {
        const { titulo, descripcion, precio, nivel_objetivo } = req.body;
        
        // CLOUDINARY:
        // req.file.path contiene la URL completa de Cloudinary (https://res.cloudinary.com/...)
        const imagen = req.file ? req.file.path : 'https://via.placeholder.com/300';

        const [result] = await db.execute(
            'INSERT INTO courses (titulo, descripcion, precio, nivel_objetivo, imagen_portada) VALUES (?, ?, ?, ?, ?)', 
            [titulo, descripcion, precio, nivel_objetivo, imagen]
        );
        
        res.status(201).json({ message: 'Curso creado con imagen en la nube', courseId: result.insertId });
    } catch (error) { 
        console.error("Error al crear curso:", error);
        res.status(500).json({ message: 'Error al crear curso' }); 
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        const { titulo, descripcion, precio, nivel_objetivo, imagen_actual, modalidad, duracion, certificado, requisitos } = req.body;
        
        // Si hay una nueva imagen, se usa req.file.path (Cloudinary), si no, se mantiene la actual
        let imagen = req.file ? req.file.path : imagen_actual;
        
        await db.execute(
            `UPDATE courses SET titulo=?, descripcion=?, precio=?, nivel_objetivo=?, imagen_portada=?, modalidad=?, duracion=?, certificado=?, requisitos=? WHERE id=?`, 
            [titulo, descripcion, precio, nivel_objetivo, imagen, modalidad, duracion, certificado, requisitos, cleanId]
        );
        res.json({ message: 'Curso actualizado correctamente' });
    } catch (error) { 
        console.error("Error al actualizar curso:", error);
        res.status(500).json({ message: 'Error al actualizar' }); 
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        await db.execute('DELETE FROM courses WHERE id = ?', [cleanId]);
        res.json({ message: 'Curso eliminado' });
    } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
};

// 5. GESTIÓN DE ESTUDIANTES (Frontend Alumno) 
exports.enrollStudent = async (req, res) => {
    try {
        const userId = req.user.id;
        const cleanId = req.params.id.replace(':', '');
        const [exists] = await db.query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, cleanId]);
        if (exists.length > 0) return res.status(400).json({ message: 'Ya inscrito' });
        
        await db.execute('INSERT INTO enrollments (user_id, course_id, fecha_inscripcion, progreso) VALUES (?, ?, NOW(), 0)', [userId, cleanId]);
        res.status(201).json({ message: 'Inscrito con éxito' });
    } catch (error) { res.status(500).json({ message: 'Error al inscribir' }); }
};

exports.checkEnrollment = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        const [rows] = await db.query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, cleanId]);
        res.json({ isEnrolled: rows.length > 0 });
    } catch (error) { res.status(500).json({ message: 'Error verificando' }); }
};

// 6. GESTIÓN DE ESTUDIANTES (Panel Admin) 

exports.getEnrolledStudents = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', '');
        const sql = `
            SELECT e.id AS enrollment_id, u.nombres, u.apellidos, u.email, e.fecha_inscripcion, e.progreso
            FROM enrollments e JOIN users u ON e.user_id = u.id
            WHERE e.course_id = ? ORDER BY e.fecha_inscripcion DESC
        `;
        const [students] = await db.execute(sql, [cleanId]);
        
        const formatted = students.map(st => ({
            id: st.enrollment_id,
            names: st.nombres,
            lastNames: st.apellidos,
            email: st.email,
            enrollment_date: st.fecha_inscripcion,
            progress: st.progreso
        }));
        res.json(formatted);
    } catch (error) { 
        console.error("Error SQL:", error); 
        res.status(500).json({ message: 'Error al listar estudiantes' }); 
    }
};

exports.removeStudent = async (req, res) => {
    try {
        const enrollmentId = req.params.enrollmentId.replace(':', '');
        await db.execute('DELETE FROM enrollments WHERE id = ?', [enrollmentId]);
        res.json({ message: 'Estudiante eliminado' });
    } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
};

exports.updateStudentProgress = async (req, res) => {
    try {
        const enrollmentId = req.params.enrollmentId.replace(':', '');
        const { progreso } = req.body;
        await db.execute('UPDATE enrollments SET progreso = ? WHERE id = ?', [progreso, enrollmentId]);
        res.json({ message: 'Progreso actualizado' });
    } catch (error) { res.status(500).json({ message: 'Error al actualizar progreso' }); }
};

// 7. ALTA EXPRESS 
exports.adminEnrollStudent = async (req, res) => {
    try {
        const cleanId = req.params.id.replace(':', ''); 
        const { email, nombres, apellidos } = req.body; 

        if (!email) return res.status(400).json({ message: 'El email es obligatorio' });

        let userIdToEnroll;
        let isNewUser = false;
        let tempPassword = '';

        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        
        if (users.length > 0) {
            userIdToEnroll = users[0].id;
        } else {
            if (!nombres || !apellidos) return res.status(400).json({ message: 'Nombre y apellido requeridos para nuevos usuarios.' });

            const randomCode = Math.floor(1000 + Math.random() * 9000);
            tempPassword = `Innova${randomCode}`;
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            const [result] = await db.execute(
                'INSERT INTO users (nombres, apellidos, email, password, rol, created_at, auth_provider, is_verified) VALUES (?, ?, ?, ?, "estudiante", NOW(), "local", 1)',
                [nombres, apellidos, email, hashedPassword]
            );
            userIdToEnroll = result.insertId;
            isNewUser = true;
        }

        const [enrollment] = await db.query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userIdToEnroll, cleanId]);
        if (enrollment.length > 0) return res.status(400).json({ message: 'Usuario ya inscrito.' });

        await db.execute('INSERT INTO enrollments (user_id, course_id, fecha_inscripcion, progreso) VALUES (?, ?, NOW(), 0)', [userIdToEnroll, cleanId]);

        res.status(201).json({ 
            message: isNewUser ? 'Usuario CREADO e inscrito.' : 'Usuario existente inscrito.',
            isNewUser,
            credentials: isNewUser ? { email, password: tempPassword } : null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el proceso de alta.' });
    }
};