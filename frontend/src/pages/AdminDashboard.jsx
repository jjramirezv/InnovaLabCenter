import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaPlus, FaSignOutAlt, FaLayerGroup, FaEdit, 
    FaChalkboardTeacher, FaTrash, FaCheckCircle,
    FaBell, FaCheck, FaTimes, FaMobileAlt, FaExclamationTriangle
} from 'react-icons/fa';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    
    // Estados base
    const [courses, setCourses] = useState([]);
    const [pendingEnrollments, setPendingEnrollments] = useState([]); 
    const [activeTab, setActiveTab] = useState('cursos'); 

    // Modales
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    
    // Selección
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [courseToDelete, setCourseToDelete] = useState(null);
    
    const [newCourse, setNewCourse] = useState({
        titulo: '', descripcion: '', precio: '', nivel_objetivo: 'superior'
    });

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/300';
        if (url.startsWith('http')) return url; 
        return `http://localhost:3000${url}`;   
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            navigate('/home');
            return;
        }
        fetchCourses();
        fetchPending();
    }, [navigate]);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/courses');
            setCourses(res.data);
        } catch (error) { console.error(error); }
    };

    const fetchPending = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/enrollments/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingEnrollments(res.data);
        } catch (error) { console.error("Error cargando pendientes", error); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!selectedFile) { alert("⚠️ Por favor, sube una imagen."); return; }
        const formData = new FormData();
        formData.append('titulo', newCourse.titulo);
        formData.append('descripcion', newCourse.descripcion);
        formData.append('precio', newCourse.precio);
        formData.append('nivel_objetivo', newCourse.nivel_objetivo);
        formData.append('imagen', selectedFile);

        try {
            const token = localStorage.getItem('token');
            await axios.post('/courses', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });
            setShowModal(false); setShowSuccess(true);
            setNewCourse({ titulo: '', descripcion: '', precio: '', nivel_objetivo: 'superior' });
            setSelectedFile(null); fetchCourses();
        } catch (error) { console.error(error); }
    };

    const confirmDelete = (course) => {
        setCourseToDelete(course);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        if (!courseToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/courses/${courseToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setShowDeleteConfirm(false); fetchCourses();
        } catch (error) { console.error(error); }
    };

    const handleApprove = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/enrollments/${selectedRequest.id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowApproveModal(false); setShowSuccess(true); fetchPending(); 
        } catch (error) { console.error(error); }
    };

    const handleReject = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/enrollments/${selectedRequest.id}/reject`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowRejectModal(false); fetchPending(); 
        } catch (error) { console.error(error); }
    };

    const handleChange = (e) => setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
    const handleFileChange = (e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-brand">InnovaLab Admin</div>
                <nav className="admin-nav">
                    <button className={`nav-btn ${activeTab === 'cursos' ? 'active' : ''}`} onClick={() => setActiveTab('cursos')}>
                        <FaLayerGroup /> Gestión de Cursos
                    </button>
                    <button className={`nav-btn ${activeTab === 'solicitudes' ? 'active' : ''}`} onClick={() => setActiveTab('solicitudes')} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span><FaBell /> Solicitudes</span>
                        {pendingEnrollments.length > 0 && (
                            <span style={{background:'#E29930', color:'white', padding:'2px 8px', borderRadius:'10px', fontSize:'0.75rem', fontWeight:'bold'}}>
                                {pendingEnrollments.length}
                            </span>
                        )}
                    </button>
                    <button className="nav-btn logout" onClick={() => { localStorage.clear(); navigate('/login'); }}><FaSignOutAlt /> Cerrar Sesión</button>
                </nav>
            </aside>

            <main className="admin-content">
                <header className="admin-header">
                    <h1>{activeTab === 'cursos' ? 'Panel de Control' : 'Aprobación de Pagos'}</h1>
                    {activeTab === 'cursos' && <button className="btn-create" onClick={() => setShowModal(true)}><FaPlus /> Nuevo Curso</button>}
                </header>

                {activeTab === 'cursos' && (
                    <div className="admin-grid">
                        {courses.map(course => (
                            <div key={course.id} className="admin-card">
                                <div className="card-img" style={{backgroundImage: `url(${getImageUrl(course.imagen_portada)})`}}></div>
                                <div className="card-body">
                                    <h3>{course.titulo}</h3>
                                    <p className="price">S/ {course.precio}</p>
                                    <span className={`badge ${course.nivel_objetivo}`}>{course.nivel_objetivo}</span>
                                    <div className="card-actions-row">
                                        <button className="btn-action edit" onClick={() => navigate(`/admin/course/${course.id}/edit`)}><FaEdit /> Editar</button>
                                        <button className="btn-action content" onClick={() => navigate(`/admin/course/${course.id}/manage`)}><FaChalkboardTeacher /> Contenido</button>
                                        <button className="btn-action delete-course" onClick={() => confirmDelete(course)}><FaTrash /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'solicitudes' && (
                    <div style={{background:'white', padding:'30px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
                        {pendingEnrollments.length === 0 ? (
                            <div style={{textAlign:'center', padding:'50px', color:'#999'}}>
                                <FaCheckCircle size={50} style={{marginBottom:'15px', color:'#28a745', opacity:0.5}}/>
                                <h3>¡Todo al día!</h3>
                                <p>No tienes pagos pendientes.</p>
                            </div>
                        ) : (
                            <table style={{width:'100%', borderCollapse:'collapse'}}>
                                <thead>
                                    <tr style={{borderBottom:'2px solid #eee', textAlign:'left', color:'#555'}}>
                                        <th style={{padding:'15px'}}>Estudiante</th>
                                        <th style={{padding:'15px'}}>Curso</th>
                                        <th style={{padding:'15px'}}>Método</th>
                                        <th style={{padding:'15px'}}>Fecha</th>
                                        <th style={{padding:'15px', textAlign:'center'}}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingEnrollments.map(req => (
                                        <tr key={req.id} style={{borderBottom:'1px solid #f9f9f9'}}>
                                            <td style={{padding:'15px'}}>
                                                <div style={{fontWeight:'bold'}}>{req.names}</div>
                                                <div style={{fontSize:'0.85rem', color:'#888'}}>{req.email}</div>
                                            </td>
                                            <td style={{padding:'15px', color:'#217CA3', fontWeight:'bold'}}>{req.curso_titulo}</td>
                                            <td style={{padding:'15px'}}>
                                                <span style={{background: req.metodo_pago === 'yape' ? '#742284' : '#00C3E3', color:'white', padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem'}}>
                                                    <FaMobileAlt /> {req.metodo_pago?.toUpperCase() || 'APP'}
                                                </span>
                                            </td>
                                            <td style={{padding:'15px'}}>{new Date(req.enrolled_at).toLocaleDateString()}</td>
                                            <td style={{padding:'15px', textAlign:'center'}}>
                                                <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                                                    <button onClick={() => { setSelectedRequest(req); setShowApproveModal(true); }} style={{background:'#E8F5E9', color:'#2E7D32', border:'none', padding:'10px', borderRadius:'8px', cursor:'pointer'}}><FaCheck /></button>
                                                    <button onClick={() => { setSelectedRequest(req); setShowRejectModal(true); }} style={{background:'#FFEBEE', color:'#C62828', border:'none', padding:'10px', borderRadius:'8px', cursor:'pointer'}}><FaTimes /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>

            {/* MODALES REUTILIZABLES */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header"><h2>Crear Nuevo Curso</h2><button className="close-btn" onClick={() => setShowModal(false)}>×</button></div>
                        <form onSubmit={handleCreate}>
                            <div className="form-group"><label>Título</label><input type="text" name="titulo" onChange={handleChange} required /></div>
                            <div className="form-group"><label>Descripción</label><textarea name="descripcion" rows="3" onChange={handleChange} required /></div>
                            <div className="row">
                                <div className="form-group"><label>Precio</label><input type="number" name="precio" onChange={handleChange} required /></div>
                                <div className="form-group"><label>Nivel</label><select name="nivel_objetivo" onChange={handleChange}><option value="superior">Superior</option><option value="jovenes">Jóvenes</option><option value="ninos">Niños</option></select></div>
                            </div>
                            <div className="form-group"><label>Imagen</label><input type="file" onChange={handleFileChange} /></div>
                            <div className="modal-buttons"><button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancelar</button><button type="submit" className="btn-submit">Guardar</button></div>
                        </form>
                    </div>
                </div>
            )}
            
            {showApproveModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign:'center', width:'400px'}}>
                        <div style={{fontSize:'3rem', color:'#28a745', marginBottom:'10px'}}><FaCheckCircle /></div>
                        <h3>¿Aprobar Acceso?</h3>
                        <p>Confirmar pago de <strong>{selectedRequest?.names}</strong>.</p>
                        <div className="modal-buttons" style={{justifyContent:'center'}}>
                            <button className="btn-cancel" onClick={() => setShowApproveModal(false)}>Cerrar</button>
                            <button className="btn-submit" onClick={handleApprove} style={{background:'#28a745'}}>Activar</button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign:'center', width:'400px'}}>
                        <div style={{fontSize:'3rem', color:'#dc3545', marginBottom:'10px'}}><FaExclamationTriangle /></div>
                        <h3>¿Rechazar Solicitud?</h3>
                        <p>Se eliminará la solicitud de <strong>{selectedRequest?.names}</strong>.</p>
                        <div className="modal-buttons" style={{justifyContent:'center'}}>
                            <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>Volver</button>
                            <button className="btn-submit" onClick={handleReject} style={{background:'#dc3545'}}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign:'center', width:'400px'}}>
                        <div style={{fontSize:'3rem', color:'#dc3545', marginBottom:'10px'}}><FaTrash /></div>
                        <h3>¿Eliminar Curso?</h3>
                        <p>Borrarás permanentemente "{courseToDelete?.titulo}".</p>
                        <div className="modal-buttons" style={{justifyContent:'center'}}>
                            <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>No, esperar</button>
                            <button className="btn-submit" onClick={handleDelete} style={{background:'#dc3545'}}>Sí, eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{textAlign:'center', width:'300px'}}>
                        <div style={{fontSize:'3rem', color:'#28a745'}}><FaCheckCircle /></div>
                        <h2>¡Éxito!</h2>
                        <button className="btn-submit" onClick={() => setShowSuccess(false)} style={{marginTop:'15px', width:'100%'}}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;