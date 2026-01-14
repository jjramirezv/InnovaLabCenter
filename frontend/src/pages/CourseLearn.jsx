import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaVideo, FaFolderOpen, FaArrowLeft, FaGoogleDrive, 
    FaPlayCircle, FaChalkboardTeacher, FaExternalLinkAlt, FaClock,
    FaFilePdf, FaLink, FaDownload, FaClipboardList, FaArrowRight
} from 'react-icons/fa';
import './CourseLearn.css'; 

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://innovalabcenter-production.up.railway.app';;

function CourseLearn() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [resources, setResources] = useState([]);
    const [quizzes, setQuizzes] = useState([]); 
    
    const [currentLesson, setCurrentLesson] = useState(null);
    const [activeTab, setActiveTab] = useState('clases'); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Obtener Token
                const token = localStorage.getItem('token');
                // IMPORTANTE: Esta configuración se usa para peticiones privadas
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // 2. Cargar Curso
                const resCourse = await axios.get(`/courses/${id}`);
                setCourse(resCourse.data);
                
                // 3. Cargar Lecciones
                const resLessons = await axios.get(`/courses/${id}/lessons`);
                setLessons(resLessons.data);
                if (resLessons.data.length > 0) setCurrentLesson(resLessons.data[0]);

                // 4. Cargar Recursos
                const resResources = await axios.get(`/resources/course/${id}`);
                setResources(resResources.data);

                // 5. Cargar Exámenes (CORREGIDO: SE ENVÍA EL TOKEN)
                const resQuizzes = await axios.get(`/quizzes/course/${id}`, config);
                setQuizzes(resQuizzes.data);

            } catch (err) {
                console.error(err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                } else {
                    navigate('/home');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const getResourceLink = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    if (loading) return <div className="loading-screen">Cargando aula...</div>;
    if (!course) return null;

    const renderLessonContent = () => {
        if (!currentLesson) return <div className="empty-state">Selecciona una lección</div>;
        const isMeet = currentLesson.video_url.includes('meet.google');
        
        return (
            <div className="resource-viewer">
                <div className="viewer-background"></div>
                <div className="viewer-card">
                    <div className="icon-badge">{isMeet ? <FaVideo /> : <FaGoogleDrive />}</div>
                    <h2 className="viewer-title">{currentLesson.titulo}</h2>
                    <p className="viewer-description">{isMeet ? "Sala de conferencias en tiempo real." : "Material alojado en nuestros servidores."}</p>
                    <div className="meta-info">
                        <span><FaClock /> {currentLesson.duracion}</span>
                        <span>•</span>
                        <span>{isMeet ? "Google Meet" : "Google Drive"}</span>
                    </div>
                    <a href={currentLesson.video_url} target="_blank" rel="noreferrer" className={`btn-access ${isMeet ? 'meet' : 'drive'}`}>
                        {isMeet ? "Unirse a la Clase" : "Ver Grabación / Archivo"} <FaExternalLinkAlt />
                    </a>
                </div>
            </div>
        );
    };

    const renderResourcesTab = () => {
        if (resources.length === 0) return <div className="empty-resources"><FaFolderOpen size={50} color="#ddd" /><h3>Sin recursos extra</h3></div>;
        return (
            <div className="resources-grid-container">
                <h2 className="section-title">Material Complementario</h2>
                <div className="resources-grid">
                    {resources.map(res => (
                        <div key={res.id} className="resource-card">
                            <div className={`resource-icon ${res.tipo}`}>{res.tipo === 'archivo' ? <FaFilePdf /> : <FaLink />}</div>
                            <div className="resource-info"><h4>{res.titulo}</h4><p>{res.tipo === 'archivo' ? 'Descargable' : 'Enlace Externo'}</p></div>
                            <a href={getResourceLink(res.url_recurso)} target="_blank" rel="noreferrer" className="btn-resource-action" download={res.tipo === 'archivo'}>{res.tipo === 'archivo' ? <FaDownload /> : <FaExternalLinkAlt />}</a>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderQuizzesTab = () => {
        const activeQuizzes = quizzes.filter(q => q.estado === 'publicado');
        if (activeQuizzes.length === 0) return <div className="empty-resources"><FaClipboardList size={50} color="#ddd" /><h3>No hay evaluaciones</h3></div>;

        return (
            <div className="resources-grid-container">
                <h2 className="section-title">Exámenes y Prácticas</h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                    {activeQuizzes.map(quiz => (
                        <div key={quiz.id} style={{ 
                            background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eee',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                            borderLeft: quiz.realizado ? (quiz.estado_aprobacion ? '5px solid #2E7D32' : '5px solid #D32F2F') : '5px solid #217CA3'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#211F30' }}>
                                    {quiz.titulo} 
                                    {quiz.realizado === 1 && (
                                        <span style={{ marginLeft:'10px', fontSize:'0.75rem', padding:'3px 10px', borderRadius:'12px', background: quiz.estado_aprobacion ? '#E8F5E9' : '#FFEBEE', color: quiz.estado_aprobacion ? '#2E7D32' : '#C62828', border:'1px solid', borderColor: quiz.estado_aprobacion ? '#C8E6C9' : '#FFCDD2'}}>
                                            {quiz.estado_aprobacion ? 'APROBADO' : 'NO APROBADO'}
                                        </span>
                                    )}
                                </h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', maxWidth:'500px' }}>{quiz.descripcion || "Sin descripción"}</p>
                                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.85rem', color: '#888' }}>
                                    <span style={{display:'flex', alignItems:'center', gap:'5px'}}><FaClock /> {quiz.duracion_minutos} min</span>
                                    <span>Min. Aprobatoria: {quiz.nota_minima}</span>
                                </div>
                            </div>
                            
                            {quiz.realizado === 1 ? (
                                <div style={{textAlign:'right'}}>
                                    <span style={{display:'block', fontSize:'0.8rem', color:'#666', marginBottom:'5px'}}>Nota Final</span>
                                    <div style={{fontSize:'1.8rem', fontWeight:'bold', color: quiz.estado_aprobacion ? '#2E7D32' : '#D32F2F'}}>{quiz.nota_obtenida}</div>
                                </div>
                            ) : (
                                <button onClick={() => navigate(`/course/quiz/${quiz.id}/take`)} style={{ background: '#217CA3', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(33, 124, 163, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Iniciar Examen <FaArrowRight />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="classroom-container">
            <aside className="classroom-sidebar">
                <div className="sidebar-brand">
                    <button onClick={() => navigate('/home')} className="btn-back"><FaArrowLeft /></button>
                    <span>Aula Virtual</span>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-category">NAVEGACIÓN</div>
                    <button className={`menu-item ${activeTab === 'clases' ? 'active' : ''}`} onClick={() => setActiveTab('clases')}><FaChalkboardTeacher /> Sesiones</button>
                    <button className={`menu-item ${activeTab === 'recursos' ? 'active' : ''}`} onClick={() => setActiveTab('recursos')}><FaFolderOpen /> Recursos Extra</button>
                    <button className={`menu-item ${activeTab === 'evaluaciones' ? 'active' : ''}`} onClick={() => setActiveTab('evaluaciones')}><FaClipboardList /> Evaluaciones</button>
                </div>
            </aside>
            <main className="classroom-content">
                <header className="classroom-header">
                    <div className="header-info"><h2>{course.titulo}</h2><span className="course-mode">{course.modalidad}</span></div>
                    <div className="user-status">Alumno Verificado</div>
                </header>
                <div className="content-area">
                    {activeTab === 'clases' && (<div className="learning-grid"><div className="main-stage">{renderLessonContent()}</div><div className="playlist-section"><div className="playlist-header">Historial</div><div className="playlist-items">{lessons.map((lesson, index) => (<button key={lesson.id} onClick={() => setCurrentLesson(lesson)} className={`playlist-item ${currentLesson?.id === lesson.id ? 'active' : ''}`}><div className="status-indicator">{currentLesson?.id === lesson.id ? <FaPlayCircle /> : index + 1}</div><div className="info"><span className="title">{lesson.titulo}</span></div></button>))}</div></div></div>)}
                    {activeTab === 'recursos' && renderResourcesTab()}
                    {activeTab === 'evaluaciones' && renderQuizzesTab()}
                </div>
            </main>
        </div>
    );
}

export default CourseLearn; 