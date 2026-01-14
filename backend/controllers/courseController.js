const db = require('../config/db');
const bcrypt = require('bcrypt'); // Necesario para crear usuarios

// --- 1. LISTAR CURSOS (Público) ---
exports.getAllCourses = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM courses');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cursos' });
    }
};

// --- 2. OBTENER CURSO POR ID ---
exports.getCourseById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Curso no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error servidor' });
    }
};

// --- 3. GESTIÓN DE LECCIONES ---
exports.getCourseLessons = async (req, res) => {
    try {
        const [lessons] = await db.execute('SELECT * FROM lessons WHERE course_id = ? ORDER BY orden ASC', [req.params.id]);
        res.json(lessons);
    } catch (error) { res.status(500).json({ message: 'Error al cargar lecciones' }); }
};

exports.getLessonById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Lección no encontrada' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ message: 'Error servidor' }); }
};

exports.addLesson = async (req, res) => {
    try {
        const { titulo, video_url, duracion, orden, descripcion } = req.body;
        await db.execute('INSERT INTO lessons (course_id, titulo, video_url, duracion, orden, descripcion) VALUES (?, ?, ?, ?, ?, ?)', 
            [req.params.id, titulo, video_url, duracion, orden, descripcion]);
        res.status(201).json({ message: 'Lección agregada' });
    } catch (error) { res.status(500).json({ message: 'Error al agregar' }); }
};

exports.updateLesson = async (req, res) => {
    try {
        const { titulo, video_url, duracion, orden, descripcion } = req.body;
        await db.execute('UPDATE lessons SET titulo=?, video_url=?, duracion=?, orden=?, descripcion=? WHERE id=?', 
            [titulo, video_url, duracion, orden, descripcion, req.params.id]);
        res.json({ message: 'Lección actualizada' });
    } catch (error) { res.status(500).json({ message: 'Error al actualizar' }); }
};

exports.deleteLesson = async (req, res) => {
    try {
        await db.execute('DELETE FROM lessons WHERE id = ?', [req.params.id]);
        res.json({ message: 'Lección eliminada' });
    } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
};

// --- 4. GESTIÓN DE CURSOS (Crear/Editar/Borrar) ---
exports.createCourse = async (req, res) => {
    try {
        const { titulo, descripcion, precio, nivel_objetivo } = req.body;
        // En createCourse:
        // Cambia esto:
        const imagen = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/300';

        // En updateCourse:
        // Asegúrate de que imagen_portada solo reciba la ruta relativa si hay un archivo nuevo
        if (req.file) imagen = `/uploads/${req.file.filename}`;
        const [result] = await db.execute('INSERT INTO courses (titulo, descripcion, precio, nivel_objetivo, imagen_portada) VALUES (?, ?, ?, ?, ?)', 
            [titulo, descripcion, precio, nivel_objetivo, imagen]);
        res.status(201).json({ message: 'Curso creado', courseId: result.insertId });
    } catch (error) { res.status(500).json({ message: 'Error al crear curso' }); }
};

exports.updateCourse = async (req, res) => {
    try {
        const { titulo, descripcion, precio, nivel_objetivo, imagen_actual, modalidad, duracion, certificado, requisitos } = req.body;
        let imagen = imagen_actual;
        if (req.file) imagen = `/uploads/${req.file.filename}`;
        
        await db.execute(`UPDATE courses SET titulo=?, descripcion=?, precio=?, nivel_objetivo=?, imagen_portada=?, modalidad=?, duracion=?, certificado=?, requisitos=? WHERE id=?`, 
            [titulo, descripcion, precio, nivel_objetivo, imagen, modalidad, duracion, certificado, requisitos, req.params.id]);
        res.json({ message: 'Curso actualizado' });
    } catch (error) { res.status(500).json({ message: 'Error al actualizar' }); }
};

exports.deleteCourse = async (req, res) => {
    try {
        await db.execute('DELETE FROM courses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Curso eliminado' });
    } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
};

// --- 5. GESTIÓN DE ESTUDIANTES (Frontend Alumno) ---
exports.enrollStudent = async (req, res) => {
    try {
        const userId = req.user.id;
        const [exists] = await db.query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, req.params.id]);
        if (exists.length > 0) return res.status(400).json({ message: 'Ya inscrito' });
        
        await db.execute('INSERT INTO enrollments (user_id, course_id, fecha_inscripcion, progreso) VALUES (?, ?, NOW(), 0)', [userId, req.params.id]);
        res.status(201).json({ message: 'Inscrito con éxito' });
    } catch (error) { res.status(500).json({ message: 'Error al inscribir' }); }
};

exports.checkEnrollment = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, req.params.id]);
        res.json({ isEnrolled: rows.length > 0 });
    } catch (error) { res.status(500).json({ message: 'Error verificando' }); }
};

// --- 6. GESTIÓN DE ESTUDIANTES (Panel Admin) ---

// VER LISTA (Corregido para tu base de datos: nombres/apellidos)
exports.getEnrolledStudents = async (req, res) => {
    try {
        const sql = `
            SELECT e.id AS enrollment_id, u.nombres, u.apellidos, u.email, e.fecha_inscripcion, e.progreso
            FROM enrollments e JOIN users u ON e.user_id = u.id
            WHERE e.course_id = ? ORDER BY e.fecha_inscripcion DESC
        `;
        const [students] = await db.execute(sql, [req.params.id]);
        
        const formatted = students.map(st => ({
            id: st.enrollment_id,
            names: st.nombres,       // <--- CORREGIDO AQUÍ
            lastNames: st.apellidos, // <--- CORREGIDO AQUÍ
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

// ELIMINAR INSCRIPCIÓN
exports.removeStudent = async (req, res) => {
    try {
        await db.execute('DELETE FROM enrollments WHERE id = ?', [req.params.enrollmentId]);
        res.json({ message: 'Estudiante eliminado' });
    } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
};

// EDITAR PROGRESO
exports.updateStudentProgress = async (req, res) => {
    try {
        const { progreso } = req.body;
        await db.execute('UPDATE enrollments SET progreso = ? WHERE id = ?', [progreso, req.params.enrollmentId]);
        res.json({ message: 'Progreso actualizado' });
    } catch (error) { res.status(500).json({ message: 'Error al actualizar progreso' }); }
};

// --- 7. ALTA EXPRESS (Crear Usuario + Inscribir) ---
exports.adminEnrollStudent = async (req, res) => {
    try {
        const { id } = req.params; 
        const { email, nombres, apellidos } = req.body; 

        if (!email) return res.status(400).json({ message: 'El email es obligatorio' });

        let userIdToEnroll;
        let isNewUser = false;
        let tempPassword = '';

        // A. Buscar si existe
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        
        if (users.length > 0) {
            userIdToEnroll = users[0].id;
        } else {
            // B. Si no existe, CREARLO
            if (!nombres || !apellidos) return res.status(400).json({ message: 'Nombre y apellido requeridos para nuevos usuarios.' });

            // Generar clave temporal (Ej: Innova4521)
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

        // C. Verificar inscripción
        const [enrollment] = await db.query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userIdToEnroll, id]);
        if (enrollment.length > 0) return res.status(400).json({ message: 'Usuario ya inscrito.' });

        // D. Inscribir
        await db.execute('INSERT INTO enrollments (user_id, course_id, fecha_inscripcion, progreso) VALUES (?, ?, NOW(), 0)', [userIdToEnroll, id]);

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