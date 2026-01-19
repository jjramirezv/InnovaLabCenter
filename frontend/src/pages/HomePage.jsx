import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaSignOutAlt, FaSearch, FaUserCircle, FaBars, FaTimes, 
    FaHome, FaBook, FaCog, FaSave, FaLock, FaCheckCircle, FaExclamationCircle 
} from 'react-icons/fa';
import '../Auth.css'; 
import './HomePage.css'; 
import './UserProfile.css'; 

function HomePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
    // Estados de datos
    const [allCourses, setAllCourses] = useState([]);       
    const [myCourses, setMyCourses] = useState([]);         
    
    // Estados de interfaz
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState('catalogo'); 

    // Estados de perfil (Sin lógica de imagen)
    const [profileData, setProfileData] = useState({ nombres: '', apellidos: '', email: '', auth_provider: 'local' });
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Modal de notificaciones
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusConfig, setStatusConfig] = useState({ type: 'success', title: '', message: '' });

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/300?text=Sin+Imagen';
        if (url.startsWith('http')) return url;
        const backendUrl = 'https://innovalabcenter-production.up.railway.app';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${backendUrl}${path}`;
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }
        
        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);

        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const resAll = await axios.get('/courses');
                setAllCourses(resAll.data);
                const resMy = await axios.get(`/enrollments/user/${currentUser.id}`, config);
                setMyCourses(resMy.data);
                const resProfile = await axios.get('/users/profile', config);
                setProfileData(resProfile.data);
            } catch (err) {
                console.error("Error cargando datos:", err);
                if (err.response?.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const triggerNotice = (type, title, message) => {
        setStatusConfig({ type, title, message });
        setShowStatusModal(true);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
    
        if (profileData.auth_provider === 'local' && passwords.newPassword) {
            if (passwords.newPassword !== passwords.confirmPassword) {
                triggerNotice('error', 'Seguridad', 'Las contraseñas no coinciden');
                return;
            }
        }

        try {
            setUpdatingProfile(true);
            const token = localStorage.getItem('token');
            
            await axios.put('/users/profile', {
                nombres: profileData.nombres,
                apellidos: profileData.apellidos,
                newPassword: profileData.auth_provider === 'local' ? (passwords.newPassword || null) : null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            triggerNotice('success', '¡Éxito!', 'Perfil actualizado correctamente');
            setPasswords({ newPassword: '', confirmPassword: '' });
            
            const updatedUser = { ...user, names: `${profileData.nombres} ${profileData.apellidos}` };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            const msg = error.response?.data?.message || 'No se pudo actualizar el perfil';
            triggerNotice('error', 'Error', msg);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const targetList = currentView === 'catalogo' ? allCourses : myCourses;
    const filteredCourses = targetList.filter(course => 
        course.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="dashboard-layout">
            
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-text">InnovaLab Center</div>
                    <button className="btn-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${currentView === 'catalogo' ? 'active' : ''}`} 
                        onClick={() => { setCurrentView('catalogo'); setIsSidebarOpen(false); }}
                    >
                        <FaHome /> <span>Explorar Cursos</span>
                    </button>
                    
                    <button 
                        className={`nav-item ${currentView === 'mis_cursos' ? 'active' : ''}`} 
                        onClick={() => { setCurrentView('mis_cursos'); setIsSidebarOpen(false); }}
                    >
                        <FaBook /> <span>Mis Aprendizajes</span>
                    </button>
                    
                    <button 
                        className={`nav-item ${currentView === 'perfil' ? 'active' : ''}`} 
                        onClick={() => { setCurrentView('perfil'); setIsSidebarOpen(false); }}
                    >
                        <FaCog /> <span>Configuración</span>
                    </button>

                    {/* SECCIÓN RECUPERADA: DIVISOR Y CERRAR SESIÓN */}
                    <div className="nav-divider"></div>
                    
                    <button className="nav-item logout" onClick={handleLogout}>
                        <FaSignOutAlt /> <span>Cerrar Sesión</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-avatar-mini">
                        <FaUserCircle size={30} color="#778ca0" />
                    </div>
                    <div className="mini-user-info">
                        <strong>{user.names.split(' ')[0]}</strong>
                        <small>Estudiante</small>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <FaBars />
                    </button>
                    <h2 className="page-title">
                        {currentView === 'catalogo' && 'Explorar Catálogo'}
                        {currentView === 'mis_cursos' && 'Mis Cursos Inscritos'}
                        {currentView === 'perfil' && 'Mi Perfil'}
                    </h2>
                </header>

                <div className="content-scroll">
                    {/* VISTA: CATÁLOGO */}
                    {currentView === 'catalogo' && (
                        <>
                            <div className="mini-hero">
                                <h1>Hola, {user.names.split(' ')[0]} 👋</h1>
                                <p>Explora nuevos conocimientos en mecatrónica.</p>
                            </div>
                            <div className="courses-grid">
                                {filteredCourses.map(course => (
                                    <div key={course.id} className={`course-card ${course.nivel_objetivo === 'ninos' ? 'theme-kids' : 'theme-general'}`}>
                                        <div className="course-image">
                                            <img src={getImageUrl(course.imagen_portada)} alt={course.titulo} />
                                            <span className="course-tag">{course.nivel_objetivo === 'ninos' ? 'Zona Kids' : 'Pro'}</span>
                                        </div>
                                        <div className="course-details">
                                            <h3>{course.titulo}</h3>
                                            <p className="desc">{course.descripcion.substring(0, 60)}...</p>
                                            <div className="course-footer">
                                                <span className="price">S/ {course.precio}</span>
                                                <button className="btn-details" onClick={() => navigate(`/course/${course.id}`)}>Ver Detalles</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* VISTA: MIS CURSOS */}
                    {currentView === 'mis_cursos' && (
                        <div className="courses-grid">
                            {filteredCourses.length === 0 ? (
                                <div className="no-courses">Aún no tienes cursos inscritos.</div>
                            ) : (
                                filteredCourses.map(course => (
                                    <div key={course.id} className="course-card theme-general">
                                        <div className="course-image">
                                            <img src={getImageUrl(course.imagen_portada)} alt={course.titulo} />
                                        </div>
                                        <div className="course-details">
                                            <h3>{course.titulo}</h3>
                                            <div className="progress-container" style={{margin: '15px 0'}}>
                                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', fontSize:'0.85rem'}}>
                                                    <span style={{color: '#778ca0'}}>Progreso</span>
                                                    <span style={{fontWeight: 'bold', color: '#217CA3'}}>{course.progreso || 0}%</span>
                                                </div>
                                                <div style={{width:'100%', height:'8px', background:'#eee', borderRadius:'10px', overflow:'hidden'}}>
                                                    <div style={{width: `${course.progreso || 0}%`, height:'100%', background:'#217CA3'}}></div>
                                                </div>
                                            </div>
                                            <button className="btn-details continue" onClick={() => navigate(`/course/${course.id}/learn`)} style={{width: '100%', background: '#217CA3'}}>Continuar Aprendizaje</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* VISTA: PERFIL (SIN FOTO) */}
                    {currentView === 'perfil' && (
                        <div className="profile-view-container">
                            <div className="profile-view-card">
                                <div className="profile-view-left">
                                    <div className="profile-view-avatar-wrapper">
                                        <FaUserCircle className="profile-view-default-avatar" />
                                    </div>
                                    <h3>{profileData.nombres} {profileData.apellidos}</h3>
                                    <p>{profileData.email}</p>
                                </div>

                                <div className="profile-view-right">
                                    <form onSubmit={handleProfileUpdate}>
                                        <div className="profile-view-row">
                                            <div className="profile-view-group">
                                                <label>Nombres</label>
                                                <input type="text" value={profileData.nombres} onChange={(e) => setProfileData({...profileData, nombres: e.target.value})} required />
                                            </div>
                                            <div className="profile-view-group">
                                                <label>Apellidos</label>
                                                <input type="text" value={profileData.apellidos} onChange={(e) => setProfileData({...profileData, apellidos: e.target.value})} required />
                                            </div>
                                        </div>

                                        {/* GESTIÓN DE SEGURIDAD SEGÚN PROVEEDOR */}
                                        {profileData.auth_provider === 'google' ? (
                                            <div style={{ 
                                                background: '#f8f9fa', padding: '20px', borderRadius: '12px', 
                                                marginTop: '25px', border: '1px dashed #ccc', textAlign: 'center' 
                                            }}>
                                                <img 
                                                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                                                    alt="Google" 
                                                    style={{ width: '20px', marginBottom: '10px' }} 
                                                />
                                                <h4 style={{ color: '#5f6368', margin: '0 0 5px 0' }}>Seguridad gestionada por Google</h4>
                                                <p style={{ color: '#70757a', fontSize: '0.85rem', margin: 0 }}>
                                                    Tu cuenta está vinculada a Google. Puedes gestionar tu seguridad directamente desde tu cuenta de Google.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="profile-view-password-section">
                                                <h4><FaLock /> Seguridad</h4>
                                                <div className="profile-view-row">
                                                    <div className="profile-view-group">
                                                        <label>Nueva Clave</label>
                                                        <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} placeholder="Opcional" />
                                                    </div>
                                                    <div className="profile-view-group">
                                                        <label>Repetir Clave</label>
                                                        <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button type="submit" className="profile-view-btn-save" disabled={updatingProfile}>
                                            {updatingProfile ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>  
                    )}
                </div>
            </main>

            {showStatusModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal" style={{ textAlign: 'center', width: '400px' }}>
                        <div style={{ fontSize: '3.5rem', color: statusConfig.type === 'success' ? '#217CA3' : '#E29930', marginBottom: '15px' }}>
                            {statusConfig.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                        </div>
                        <h2 style={{ color: '#211F30', marginBottom: '10px' }}>{statusConfig.title}</h2>
                        <p style={{ color: '#4e5768' }}>{statusConfig.message}</p>
                        <button className="profile-view-btn-save" style={{ marginTop: '25px', background: statusConfig.type === 'success' ? '#217CA3' : '#32384D' }} onClick={() => setShowStatusModal(false)}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;