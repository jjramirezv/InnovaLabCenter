import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaArrowLeft, FaPlus, FaUsers, FaLayerGroup, FaFolderOpen, FaClipboardList,
    FaTrash, FaCheckCircle, FaPlayCircle, FaBroadcastTower, FaGoogle, FaEdit, FaTimes, 
    FaExclamationTriangle, FaUserPlus, FaUserTimes, FaGraduationCap
} from 'react-icons/fa';
import './AdminCourseContent.css';

import ResourcesManager from './ResourcesManager'; 
import QuizManager from './QuizManager';

function AdminCourseContent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const cleanId = id.replace(':', ''); 
    
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [students, setStudents] = useState([]);
    const [courseGrades, setCourseGrades] = useState([]); 
    const [activeTab, setActiveTab] = useState('lessons'); 
    
    // ESTADOS DE MODALES (AQUÍ ESTÁ EL TRUCO PARA QUE FUNCIONEN)
    const [showModal, setShowModal] = useState(false); 
    const [showEnrollModal, setShowEnrollModal] = useState(false); 
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteStudentConfirm, setShowDeleteStudentConfirm] = useState(false);
    const [showDeleteGradeModal, setShowDeleteGradeModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // SELECCIÓN PARA BORRAR
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [gradeToDelete, setGradeToDelete] = useState(null);

    // FORMULARIO DE LECCIÓN CON VALORES POR DEFECTO (EVITA ERROR 500)
    const [newLesson, setNewLesson] = useState({ 
        titulo: '', 
        video_url: '', 
        duracion: '10 min', // Default
        orden: 1,           // Default
        descripcion: 'Contenido de la lección' // Default
    });

    const [enrollData, setEnrollData] = useState({ email: '' });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [resCourse, resLessons, resStudents, resGrades] = await Promise.all([
                axios.get(`/courses/${cleanId}`),
                axios.get(`/courses/${cleanId}/lessons`),
                axios.get(`/courses/${cleanId}/students`, config),
                axios.get(`/quizzes/admin/results/course/${cleanId}`, config) 
            ]);
            setCourse(resCourse.data);
            setLessons(resLessons.data);
            setStudents(resStudents.data);
            setCourseGrades(resGrades.data);
            // Ajustar el orden automáticamente para la siguiente lección
            setNewLesson(prev => ({ ...prev, orden: resLessons.data.length + 1 }));
        } catch (error) { console.error(error); }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Enviamos todo el objeto para que el backend no de Error 500
            await axios.post(`/courses/${cleanId}/lessons`, newLesson, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setShowModal(false); setShowSuccess(true); fetchData();
        } catch (error) { alert("Error 500: Revisa que todos los campos del backend estén configurados."); }
    };

    const handleDeleteLesson = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/courses/lessons/${lessonToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowDeleteConfirm(false); fetchData();
        } catch (error) { alert("No se pudo eliminar"); }
    };

    const handleManualEnroll = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/courses/${cleanId}/students`, enrollData, { headers: { Authorization: `Bearer ${token}` } });
            setShowEnrollModal(false); setShowSuccess(true); fetchData();
        } catch (error) { alert("Error en inscripción"); }
    };

    const handleRemoveStudent = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/courses/${cleanId}/students/${studentToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowDeleteStudentConfirm(false); fetchData();
        } catch (error) { alert("Error al quitar alumno"); }
    };

    const handleDeleteGrade = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/quizzes/admin/results/${gradeToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowDeleteGradeModal(false); fetchData();
        } catch (error) { alert("Error al resetear nota"); }
    };

    const getIconType = (url) => {
        if (!url) return <FaPlayCircle className="icon-type video" />;
        if (url.includes('meet.google')) return <FaBroadcastTower className="icon-type meet" />;
        if (url.includes('drive.google')) return <FaGoogle className="icon-type drive" />;
        return <FaPlayCircle className="icon-type video" />;
    };

    if (!course) return <div className="loading-screen">Cargando gestión...</div>;

    return (
        <div className="manage-container">
            <header className="manage-header-aligned">
                <div className="header-left">
                    <button onClick={() => navigate('/admin')} className="btn-back-circle"><FaArrowLeft /></button>
                    <div className="header-titles">
                        <span className="subtitle">Curso:</span>
                        <h1 className="truncate-title">{course.titulo}</h1>
                    </div>
                </div>
            </header>

            <div className="manage-tabs">
                <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}><FaLayerGroup /> Lecciones</button>
                <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}><FaFolderOpen /> Recursos</button>
                <button className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab('quizzes')}><FaClipboardList /> Evaluaciones</button>
                <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><FaUsers /> Alumnos</button>
            </div>

            <div className="manage-content">
                {activeTab === 'lessons' && (
                    <div className="lessons-view">
                        <div className="view-header">
                            <h3>Plan de Estudios</h3>
                            <button className="btn-add-lesson" onClick={() => setShowModal(true)}><FaPlus /> Agregar Lección</button>
                        </div>
                        <div className="lessons-list">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="lesson-row">
                                    <div className="lesson-left">
                                        <div className="lesson-drag-handle">#{lesson.orden}</div>
                                        <div className="lesson-icon-wrapper">{getIconType(lesson.video_url)}</div>
                                        <div className="lesson-info">
                                            <strong>{lesson.titulo}</strong>
                                            <small className="link-encajonado">{lesson.video_url}</small>
                                        </div>
                                    </div>
                                    <div className="lesson-right">
                                        <span className="badge-duration">{lesson.duracion}</span>
                                        <div className="action-buttons">
                                            <button className="btn-icon-action edit" onClick={() => navigate(`/admin/course/${cleanId}/lesson/${lesson.id}/edit`)}><FaEdit /></button>
                                            <button className="btn-icon-action delete" onClick={() => {setLessonToDelete(lesson); setShowDeleteConfirm(true)}}><FaTrash /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && <ResourcesManager courseId={cleanId} />}
                {activeTab === 'quizzes' && <QuizManager courseId={cleanId} />}

                {activeTab === 'students' && (
                    <div className="students-view">
                        <div className="view-header">
                            <h3>Alumnos Inscritos</h3>
                            <button className="btn-add-lesson" onClick={() => setShowEnrollModal(true)} style={{backgroundColor: '#217CA3'}}>
                                <FaUserPlus /> Inscripción Manual
                            </button>
                        </div>
                        
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Estudiante</th>
                                    <th>Progreso</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((st) => (
                                    <tr key={st.id}>
                                        <td data-label="Estudiante">
                                            <div className="student-cell-mobile">
                                                <div className="user-avatar-small">{st.names?.charAt(0)}</div>
                                                <div>
                                                    {/* Muestra nombres y apellidos completos */}
                                                    <strong>{st.names} {st.lastNames}</strong>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Progreso">
                                            <strong>{st.progress || 0}%</strong>
                                        </td>
                                        <td data-label="Fecha">
                                            {new Date(st.enrollment_date).toLocaleDateString()}
                                        </td>
                                        <td data-label="Acciones">
                                            <div className="action-buttons">
                                                <button className="btn-icon-action delete" onClick={() => { setStudentToDelete(st); setShowDeleteStudentConfirm(true); }}>
                                                    <FaUserTimes />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Calificaciones */}
                        <div className="view-header" style={{marginTop:'30px'}}><h3>Calificaciones</h3></div>
                        <table className="students-table">
                            <thead><tr style={{background:'#f8f9fa'}}><th>Alumno</th><th>Examen</th><th>Nota</th><th>Reset</th></tr></thead>
                            <tbody>
                                {courseGrades.map((grade) => (
                                    <tr key={grade.id}>
                                        <td data-label="Alumno">{grade.student_names}</td>
                                        <td data-label="Examen">{grade.examen_nombre}</td>
                                        <td data-label="Nota" style={{fontWeight:'bold'}}>{grade.nota}</td>
                                        <td data-label="Reset">
                                            <button className="btn-icon-action delete" onClick={() => confirmDeleteGrade(grade)}>
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- MODALES FÍSICOS (NO BORRAR) --- */}
            {showModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-header-simple"><h2>Nueva Lección</h2><button onClick={() => setShowModal(false)}><FaTimes /></button></div>
                        <form onSubmit={handleAddLesson}>
                            <div className="form-group"><label>Título</label><input type="text" placeholder="Ej: Introducción" onChange={e => setNewLesson({...newLesson, titulo: e.target.value})} required /></div>
                            <div className="form-group"><label>URL Drive/Meet</label><input type="text" placeholder="https://..." onChange={e => setNewLesson({...newLesson, video_url: e.target.value})} required /></div>
                            <p style={{fontSize:'0.7rem', color:'#888'}}>* Los demás datos se llenarán con valores por defecto y podrás editarlos luego.</p>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-confirm">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal" style={{textAlign:'center'}}>
                        <FaExclamationTriangle size={40} color="#dc3545" />
                        <h3>¿Eliminar Lección?</h3>
                        <p>Borrarás "{lessonToDelete?.titulo}".</p>
                        <div className="modal-actions" style={{justifyContent:'center'}}>
                            <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>No</button>
                            <button className="btn-confirm" style={{background:'#dc3545'}} onClick={handleDeleteLesson}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {showEnrollModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-header-simple"><h2>Inscripción Manual</h2><button onClick={() => setShowEnrollModal(false)}><FaTimes /></button></div>
                        <form onSubmit={handleManualEnroll}>
                            <div className="form-group"><label>Email del Alumno</label><input type="email" onChange={e => setEnrollData({email: e.target.value})} required /></div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowEnrollModal(false)}>Cerrar</button>
                                <button type="submit" className="btn-confirm">Inscribir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteStudentConfirm && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal" style={{textAlign:'center'}}>
                        <FaUserTimes size={40} color="#dc3545" />
                        <h3>¿Quitar Alumno?</h3>
                        <p>Se eliminará el acceso de {studentToDelete?.names}.</p>
                        <div className="modal-actions" style={{justifyContent:'center'}}>
                            <button className="btn-cancel" onClick={() => setShowDeleteStudentConfirm(false)}>No</button>
                            <button className="btn-confirm" style={{background:'#dc3545'}} onClick={handleRemoveStudent}>Sí, quitar</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal" style={{textAlign:'center'}}>
                        <FaCheckCircle size={50} color="#28a745" />
                        <h2>¡Completado!</h2>
                        <button className="btn-confirm" onClick={() => setShowSuccess(false)}>Aceptar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCourseContent;  