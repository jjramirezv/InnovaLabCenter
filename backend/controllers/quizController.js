const db = require('../config/db');

// 1. NOTAS POR CURSO 
exports.getResultsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const query = `
            SELECT 
                qa.id, 
                CONCAT(u.nombres, ' ', u.apellidos) as student_names, 
                u.email,
                q.titulo as examen_nombre, 
                qa.score as nota, 
                qa.aprobado, 
                qa.fecha_intento as fecha,
                e.progreso as progreso_total
            FROM quiz_attempts qa
            JOIN users u ON qa.student_id = u.id
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN enrollments e ON e.user_id = u.id AND e.course_id = q.course_id
            WHERE q.course_id = ?
            ORDER BY qa.fecha_intento DESC
        `;
        const [rows] = await db.query(query, [courseId]);
        res.json(rows);
    } catch (error) {
        console.error("❌ ERROR SQL:", error.message);
        res.status(500).json({ message: 'Error al obtener calificaciones' });
    }
};

// 2. ELIMINAR INTENTO
exports.deleteQuizAttempt = async (req, res) => {
    try {
        await db.execute('DELETE FROM quiz_attempts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Nota eliminada.' });
    } catch (error) { res.status(500).json({ message: 'Error al borrar nota' }); }
};

// 3. ENVIAR EXAMEN 
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; 
        const studentId = req.user.id; 

        const [quizData] = await db.query('SELECT course_id, nota_minima FROM quizzes WHERE id = ?', [quizId]);
        const { course_id, nota_minima } = quizData[0];
        const [questions] = await db.query('SELECT * FROM questions WHERE quiz_id = ?', [quizId]);
        
        let puntajeObtenido = 0;
        for (let q of questions) {
            const studentAns = answers.find(a => a.questionId === q.id);
            if (studentAns) {
                const [correctOpts] = await db.query('SELECT id, texto_opcion FROM question_options WHERE question_id = ? AND es_correcta = 1', [q.id]);
                if (correctOpts.length > 0) {
                    const correctOpt = correctOpts[0];
                    if (q.tipo === 'multiple') {
                        if (String(studentAns.optionId) === String(correctOpt.id)) puntajeObtenido += q.puntos;
                    } else {
                        if (studentAns.textValue?.trim().toLowerCase() === correctOpt.texto_opcion.trim().toLowerCase()) puntajeObtenido += q.puntos;
                    }
                }
            }
        }

        const aprobado = puntajeObtenido >= nota_minima ? 1 : 0;
        await db.execute(
            'INSERT INTO quiz_attempts (quiz_id, student_id, score, aprobado, fecha_intento) VALUES (?, ?, ?, ?, NOW())',
            [quizId, studentId, puntajeObtenido, aprobado]
        );

        const [totalQ] = await db.query('SELECT COUNT(*) as total FROM quizzes WHERE course_id = ? AND estado = "publicado"', [course_id]);
        const [passedQ] = await db.query(`SELECT COUNT(DISTINCT quiz_id) as aprobados FROM quiz_attempts WHERE student_id = ? AND aprobado = 1 AND quiz_id IN (SELECT id FROM quizzes WHERE course_id = ?)`, [studentId, course_id]);
        
        const total = totalQ[0].total || 1;
        const aprobados = passedQ[0].aprobados || 0;
        const nuevoProgreso = Math.min(100, Math.round((aprobados / total) * 100));

        await db.execute('UPDATE enrollments SET progreso = ? WHERE course_id = ? AND user_id = ?', [nuevoProgreso, course_id, studentId]);
        res.json({ score: puntajeObtenido, aprobado: aprobado === 1, nuevoProgreso });
    } catch (error) { res.status(500).json({ message: 'Error interno' }); }
};

// 4. DETALLE PARA EL EDITOR
exports.getQuizDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const [quiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [id]);
        const [questions] = await db.query('SELECT * FROM questions WHERE quiz_id = ? ORDER BY orden ASC', [id]);
        for (let q of questions) {
            const [opts] = await db.query('SELECT id, texto_opcion, es_correcta FROM question_options WHERE question_id = ?', [q.id]);
            q.options = opts;
        }
        res.json({ quiz: quiz[0], questions });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

// 5. AGREGAR PREGUNTA
exports.addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { enunciado, tipo, puntos, orden, opciones } = req.body;
        const [qResult] = await db.execute('INSERT INTO questions (quiz_id, enunciado, tipo, puntos, orden) VALUES (?, ?, ?, ?, ?)', [quizId, enunciado, tipo, puntos, orden]);
        const questionId = qResult.insertId;
        if (opciones) {
            for (let opt of opciones) {
                await db.execute('INSERT INTO question_options (question_id, texto_opcion, es_correcta) VALUES (?, ?, ?)', [questionId, opt.texto, opt.es_correcta ? 1 : 0]);
            }
        }
        res.status(201).json({ message: 'Pregunta guardada' });
    } catch (error) { res.status(500).json({ message: 'Error al guardar' }); }
};

// 6. ELIMINAR PREGUNTA INDIVIDUAL
exports.deleteQuestion = async (req, res) => {
    try {
        await db.execute('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Eliminada' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.createQuiz = async (req, res) => {
    const { titulo, descripcion, duracion_minutos, nota_minima, fecha_limite } = req.body;
    const [result] = await db.execute('INSERT INTO quizzes (course_id, titulo, descripcion, duracion_minutos, nota_minima, fecha_limite) VALUES (?, ?, ?, ?, ?, ?)', [req.params.courseId, titulo, descripcion, duracion_minutos, nota_minima, fecha_limite || null]);
    res.status(201).json({ quizId: result.insertId });
};
exports.deleteQuiz = async (req, res) => { await db.execute('DELETE FROM quizzes WHERE id = ?', [req.params.id]); res.json({ message: 'Eliminado' }); };
exports.updateQuizStatus = async (req, res) => { await db.execute('UPDATE quizzes SET estado = ? WHERE id = ?', [req.body.estado, req.params.id]); res.json({ message: 'Actualizado' }); };
exports.getQuizzesByCourse = async (req, res) => {
    const [rows] = await db.query(`SELECT q.*, qa.score as nota_obtenida, qa.aprobado as estado_aprobacion FROM quizzes q LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_id = ? WHERE q.course_id = ?`, [req.user.id, req.params.courseId]);
    res.json(rows);
};