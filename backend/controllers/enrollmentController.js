const db = require('../config/db');

// 1. INSCRIBIR ESTUDIANTE (Corregido para recibir metodo_pago)
exports.enrollStudent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        // RECIBIMOS metodo_pago para que coincida con CoursePage.jsx
        const { metodo_pago } = req.body; 

        // Verificar si ya existe
        const [existing] = await db.query(
            'SELECT * FROM enrollments WHERE course_id = ? AND user_id = ?',
            [courseId, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                message: 'Solicitud ya registrada.',
                status: existing[0].estado 
            });
        }

        // Estado inicial
        let estadoFinal = 'pendiente';
        
        await db.execute(
            'INSERT INTO enrollments (course_id, user_id, enrolled_at, estado, metodo_pago) VALUES (?, ?, NOW(), ?, ?)',
            [courseId, userId, estadoFinal, metodo_pago || 'manual']
        );

        res.status(201).json({ message: 'Registrado correctamente', status: estadoFinal });

    } catch (error) {
        console.error("❌ Error en inscripción:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// 2. VERIFICAR ESTADO
exports.checkEnrollment = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const [rows] = await db.query('SELECT estado FROM enrollments WHERE course_id = ? AND user_id = ?', [courseId, userId]);
        
        if (rows.length > 0) {
            res.json({ isEnrolled: true, status: rows[0].estado });
        } else {
            res.json({ isEnrolled: false, status: null });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verificando inscripción' });
    }
};

// ... Resto de funciones getUserEnrollments, getPendingEnrollments, approveEnrollment, rejectEnrollment se mantienen igual ...
exports.getUserEnrollments = async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `SELECT c.*, e.progreso FROM courses c JOIN enrollments e ON c.id = e.course_id WHERE e.user_id = ? AND e.estado = 'activo'`;
        const [rows] = await db.query(query, [userId]);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Error obteniendo cursos' }); }
};

exports.getPendingEnrollments = async (req, res) => {
    try {
        const query = `SELECT e.id, CONCAT(u.nombres, ' ', u.apellidos) AS names, u.email, c.titulo as curso_titulo, c.precio, e.enrolled_at, e.metodo_pago FROM enrollments e JOIN users u ON e.user_id = u.id JOIN courses c ON e.course_id = c.id WHERE e.estado = 'pendiente' ORDER BY e.enrolled_at DESC`;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.approveEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("UPDATE enrollments SET estado = 'activo' WHERE id = ?", [id]);
        res.json({ message: 'Aprobada' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.rejectEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM enrollments WHERE id = ?", [id]);
        res.json({ message: 'Rechazada' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};