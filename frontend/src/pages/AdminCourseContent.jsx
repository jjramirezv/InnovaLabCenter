import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaArrowLeft, FaPlus, FaUsers, FaLayerGroup, FaFolderOpen, FaClipboardList,
    FaTrash, FaCheckCircle, FaPlayCircle, FaBroadcastTower, FaGoogle, FaEdit, FaTimes, 
    FaExclamationTriangle, FaUserPlus, FaUserTimes, FaExclamationCircle, FaGraduationCap
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
    
    // ESTADOS DE MODALES
    const [showModal, setShowModal] = useState(false); 
    const [showEnrollModal, setShowEnrollModal] = useState(false); 
    const [showEditProgressModal, setShowEditProgressModal] = useState(false); 
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [showDeleteStudentConfirm, setShowDeleteStudentConfirm] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [showDeleteGradeModal, setShowDeleteGradeModal] = useState(false); 
    const [gradeToDelete, setGradeToDelete] = useState(null); 

    const [enrollData, setEnrollData] = useState({ email: '', nombres: '', apellidos: '' });
    const [editingStudent, setEditingStudent] = useState(null); 
    const [newProgress, setNewProgress] = useState(0);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [newLesson, setNewLesson] = useState({ titulo: '', video_url: '', duracion: '', orden: 1, descripcion: '' });

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
        } catch (error) { console.error(error); }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/courses/${cleanId}/lessons`, newLesson, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false); setShowSuccess(true); fetchData();
            setNewLesson({ titulo: '', video_url: '', duracion: '', orden: lessons.length + 2, descripcion: '' });
        } catch (error) { setErrorMessage("Error al crear lección"); setShowErrorModal(true); }
    };

    const handleDeleteLesson = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/courses/lessons/${lessonToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowDeleteConfirm(false); fetchData(); 
        } catch (error) { setErrorMessage("No se pudo borrar"); setShowErrorModal(true); }
    };

    const handleManualEnroll = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/courses/${cleanId}/students`, enrollData, { headers: { Authorization: `Bearer ${token}` } });
            setShowEnrollModal(false); setShowSuccess(true); fetchData();
            setEnrollData({ email: '', nombres: '', apellidos: '' });
        } catch (error) { setErrorMessage(error.response?.data?.message || "Error"); setShowErrorModal(true); }
    };

    const confirmDeleteGrade = (grade) => { setGradeToDelete(grade); setShowDeleteGradeModal(true); };
    const handleDeleteGrade = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/quizzes/admin/results/${gradeToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowDeleteGradeModal(false); fetchData();
        } catch (error) { setErrorMessage("Error al eliminar nota"); setShowErrorModal(true); }
    };

    const getIconType = (url) => {
        if (!url) return <FaPlayCircle className="icon-type video" />;
        if (url.includes('meet.google')) return <FaBroadcastTower className="icon-type meet" />;
        if (url.includes('drive.google')) return <FaGoogle className="icon-type drive" />;
        return <FaPlayCircle className="icon-type video" />;
    };

    if (!course) return <div className="loading-screen">Cargando...</div>;

    return (
        <div className="manage-container">
            <header className="manage-header-aligned">
                <div className="header-left">
                    <button onClick={() => navigate('/admin')} className="btn-back-circle"><FaArrowLeft /></button>
                    <div className="header-titles">
                        <span className="subtitle">Gestión de Curso:</span>
                        <h1>{course.titulo}</h1>
                    </div>
                </div>
            </header>

            <div className="manage-tabs">
                <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}><FaLayerGroup /> Lecciones</button>
                <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}><FaFolderOpen /> Recursos</button>
                <button className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab('quizzes')}><FaClipboardList /> Evaluaciones</button>
                <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><FaUsers /> Seguimiento</button>
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
                                        <div className="lesson-info"><strong>{lesson.titulo}</strong><small>{lesson.video_url}</small></div>
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
                            <h3>Alumnos</h3>
                            <button className="btn-add-lesson" onClick={() => setShowEnrollModal(true)}><FaUserPlus /> Inscripción Manual</button>
                        </div>
                        <table className="students-table">
                            <thead><tr><th>Estudiante</th><th>Progreso</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {students.map((st) => (
                                    <tr key={st.id}>
                                        <td data-label="Estudiante">
                                            <div style={{display:'flex', alignItems:'center', gap:'10px', justifyContent:'flex-end'}}>
                                                <div className="user-avatar-small">{st.names?.charAt(0)}</div>
                                                <strong>{st.names}</strong>
                                            </div>
                                        </td>
                                        <td data-label="Progreso">{st.progress || 0}%</td>
                                        <td data-label="Acciones">
                                            <div className="action-buttons">
                                                <button className="btn-icon-action delete" onClick={() => { setStudentToDelete(st); setShowDeleteStudentConfirm(true); }}><FaUserTimes /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- MODALES REALES --- */}
            {showModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-header-simple"><h2>Nueva Lección</h2><button onClick={() => setShowModal(false)}><FaTimes /></button></div>
                        <form onSubmit={handleAddLesson}>
                            <div className="form-group"><label>Título</label><input type="text" onChange={e => setNewLesson({...newLesson, titulo: e.target.value})} required /></div>
                            <div className="form-group"><label>URL (Drive/Meet)</label><input type="text" onChange={e => setNewLesson({...newLesson, video_url: e.target.value})} required /></div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-confirm">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEnrollModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-header-simple"><h2>Inscripción Manual</h2><button onClick={() => setShowEnrollModal(false)}><FaTimes /></button></div>
                        <form onSubmit={handleManualEnroll}>
                            <div className="form-group"><label>Email del Alumno</label><input type="email" style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ddd'}} onChange={e => setEnrollData({...enrollData, email: e.target.value})} required /></div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowEnrollModal(false)}>Cerrar</button>
                                <button type="submit" className="btn-confirm">Inscribir</button>
                            </div>
                        </form>
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