import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaArrowLeft, FaPlus, FaUsers, FaLayerGroup, FaFolderOpen, FaClipboardList,
    FaTrash, FaCheckCircle, FaPlayCircle, FaBroadcastTower, FaGoogle, FaEdit, FaTimes, 
    FaExclamationTriangle, FaUserPlus, FaUserTimes, FaExclamationCircle, FaGraduationCap, FaSearch
} from 'react-icons/fa';
import './AdminCourseContent.css';

import ResourcesManager from './ResourcesManager'; 
import QuizManager from './QuizManager';

function AdminCourseContent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const cleanId = id.replace(':', ''); // CENTRALIZAMOS LA LIMPIEZA DE ID (EVITA ERROR 404)
    
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [students, setStudents] = useState([]);
    const [courseGrades, setCourseGrades] = useState([]); 
    const [activeTab, setActiveTab] = useState('lessons'); 
    
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
    const [newUserCredentials, setNewUserCredentials] = useState(null); 
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
        } catch (error) {
            console.error("Error en fetchData:", error);
        }
    };

    const confirmDeleteGrade = (grade) => {
        setGradeToDelete(grade);
        setShowDeleteGradeModal(true);
    };

    const handleDeleteGrade = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/quizzes/admin/results/${gradeToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowDeleteGradeModal(false);
            setGradeToDelete(null);
            setShowSuccess(true);
            fetchData(); 
        } catch (error) {
            setErrorMessage("No se pudo eliminar la nota.");
            setShowErrorModal(true);
        }
    };

    const handleManualEnroll = async (e) => {
        e.preventDefault();
        setNewUserCredentials(null);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(`/courses/${cleanId}/students`, enrollData, config);
            if (res.data.isNewUser && res.data.credentials) {
                setNewUserCredentials(res.data.credentials);
            } else {
                setShowEnrollModal(false);
                setShowSuccess(true);
            }
            setEnrollData({ email: '', nombres: '', apellidos: '' });
            fetchData(); 
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Error en la inscripción.");
            setShowErrorModal(true); 
        }
    };

    const handleRemoveStudent = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/courses/${cleanId}/students/${studentToDelete.id}`, config);
            setShowDeleteStudentConfirm(false);
            fetchData(); 
        } catch (error) {
            setErrorMessage("No se pudo eliminar al estudiante.");
            setShowErrorModal(true);
        }
    };

    const handleUpdateProgress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/courses/${cleanId}/students/${editingStudent.id}`, { progreso: newProgress }, config);
            setShowEditProgressModal(false);
            fetchData();
        } catch (error) {
            setErrorMessage("Error al actualizar el progreso.");
            setShowErrorModal(true);
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/courses/${cleanId}/lessons`, newLesson, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false);
            setShowSuccess(true);
            fetchData();
            setNewLesson({ titulo: '', video_url: '', duracion: '', orden: lessons.length + 2, descripcion: '' });
        } catch (error) {
            setErrorMessage("Error al crear la lección.");
            setShowErrorModal(true);
        }
    };

    const handleDeleteLesson = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/courses/lessons/${lessonToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            setShowDeleteConfirm(false);
            fetchData(); 
        } catch (error) {
            setErrorMessage("No se pudo borrar la lección.");
            setShowErrorModal(true);
        }
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
                        <span className="subtitle">Gestión de Curso:</span>
                        <h1>{course.titulo}</h1>
                    </div>
                </div>
            </header>

            <div className="manage-tabs">
                <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}><FaLayerGroup /> Lecciones ({lessons.length})</button>
                <button className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}><FaFolderOpen /> Recursos</button>
                <button className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab('quizzes')}><FaClipboardList /> Evaluaciones</button>
                <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><FaUsers /> Seguimiento Alumnos ({students.length})</button>
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
        <div className="view-header"><h3>Alumnos Inscritos</h3><button className="btn-add-lesson" onClick={() => setShowEnrollModal(true)} style={{backgroundColor: '#217CA3'}}><FaUserPlus /> Inscripción Manual</button></div>
        <table className="students-table">
            <thead><tr><th>Estudiante</th><th>Progreso</th><th>Inscripción</th><th>Acciones</th></tr></thead>
            <tbody>
                {students.map((st) => (
                    <tr key={st.id}>
                        <td data-label="Estudiante"> {/* <--- AGREGADO */}
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}><div className="user-avatar-small">{st.names?.charAt(0)}</div><div style={{textAlign:'left'}}><strong>{st.names}</strong><br/><small style={{wordBreak:'break-all'}}>{st.email}</small></div></div>
                        </td>
                        <td data-label="Progreso"> {/* <--- AGREGADO */}
                            <div className="progress-container-table"><span>{st.progress || 0}%</span></div>
                        </td>
                        <td data-label="Fecha"> {/* <--- AGREGADO */}
                            {new Date(st.enrollment_date).toLocaleDateString()}
                        </td>
                        <td data-label="Acciones"> {/* <--- AGREGADO */}
                            <div className="action-buttons"><button className="btn-icon-action edit" onClick={() => { setEditingStudent(st); setNewProgress(st.progress || 0); setShowEditProgressModal(true); }}><FaEdit /></button><button className="btn-icon-action delete" onClick={() => { setStudentToDelete(st); setShowDeleteStudentConfirm(true); }}><FaUserTimes /></button></div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {/* Tabla de Calificaciones */}
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
                            <button className="btn-icon-action delete" onClick={() => confirmDeleteGrade(grade)}><FaTrash /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)}
            </div>
            {/* MODALES IGUALES AL ORIGINAL (Omitidos por brevedad pero deben estar presentes) */}
        </div>
    );
}

export default AdminCourseContent;