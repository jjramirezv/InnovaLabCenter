import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaArrowLeft, FaUserGraduate, FaClock, FaStar, FaPlayCircle, 
    FaCheckCircle, FaHourglassHalf, FaExclamationCircle, FaTimes, FaSpinner
} from 'react-icons/fa';
import '../Auth.css'; 
import PaymentModal from '../components/PaymentModal';

function CoursePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const cleanId = id ? id.toString().split(':').filter(Boolean).pop() : '';

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState(null); 

    const [showPayment, setShowPayment] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [errorData, setErrorData] = useState({ show: false, message: '' });

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/300?text=Sin+Imagen';

        // 1. Si ya es un link de Cloudinary (empieza con http), úsalo directo
        if (url.startsWith('http')) return url;

        // 2. Si es una ruta vieja (/uploads/...), apunta a tu BACKEND DE RAILWAY
        // NUNCA USES LOCALHOST AQUÍ PARA PRODUCCIÓN
        const backendUrl = 'https://innovalabcenter-production.up.railway.app';
        
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${backendUrl}${path}`;
    };

    const checkEnrollmentStatus = useCallback(async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const enrollRes = await axios.get(`/enrollments/courses/${cleanId}/check-enrollment`, config);
            if (enrollRes.data.isEnrolled) {
                setEnrollmentStatus(enrollRes.data.status); 
            } else {
                setEnrollmentStatus(null);
            }
        } catch (e) {
            setEnrollmentStatus(null);
        }
    }, [cleanId]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }
        
        setUser(JSON.parse(storedUser));

        const fetchData = async () => {
            try {
                const courseRes = await axios.get(`/courses/${cleanId}`);
                setCourse(courseRes.data);
                await checkEnrollmentStatus(token);
            } catch (err) {
                console.error("Error cargando curso:", err);
                if (err.response?.status === 401) navigate('/login');
                else navigate('/home');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [cleanId, navigate, checkEnrollmentStatus]);

    const handleEnrollClick = () => {
        if (!user) return;
        setShowPayment(true);
    };

    const handlePaymentSuccess = async (method) => {
        const token = localStorage.getItem('token');
        setShowPayment(false); 

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // CORRECCIÓN CLAVE: Enviamos 'metodo_pago' para evitar Error 400
            const res = await axios.post(`/enrollments/courses/${cleanId}/enroll`, {
                metodo_pago: method 
            }, config);
            
            if (res.data.status) {
                setEnrollmentStatus(res.data.status); 
                if (res.data.status === 'activo') navigate(`/course/${cleanId}/learn`);
                else setShowPendingModal(true);
            }
            
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const statusReal = error.response.data.status || 'pendiente';
                setEnrollmentStatus(statusReal); 
                if (statusReal === 'pendiente') setShowPendingModal(true);
            } else {
                setErrorData({ show: true, message: error.response?.data?.message || 'Error al procesar inscripción.' });
            }
        }
    };

    if (loading) return <div style={{height: '80vh', display: 'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', color: '#666'}}><FaSpinner className="spin-animation" size={40} style={{marginBottom:'15px', color:'#217CA3'}} /><p>Cargando curso...</p></div>;
    if (!course) return null;

    const isKids = course.nivel_objetivo === 'ninos';
    const accentColor = isKids ? '#E29930' : '#217CA3';

    const renderActionButton = () => {
        if (enrollmentStatus === 'activo') {
            return (
                <button style={{ width: '100%', padding: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)' }} onClick={() => navigate(`/course/${cleanId}/learn`)}> 
                    <FaPlayCircle size={20}/> Ir al Aula Virtual
                </button>
            );
        } else if (enrollmentStatus === 'pendiente') {
            return (
                <button onClick={() => setShowPendingModal(true)} style={{ width: '100%', padding: '16px', backgroundColor: '#FFF3E0', color: '#EF6C00', border: '2px solid #FFE0B2', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}> 
                    <FaHourglassHalf size={18}/> Estado: Pendiente de Aprobación
                </button>
            );
        } else {
            return (
                <button style={{ width: '100%', padding: '16px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: `0 8px 20px ${isKids ? 'rgba(226, 153, 48, 0.3)' : 'rgba(33, 124, 163, 0.3)'}`, transition: 'transform 0.2s' }} onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'} onMouseUp={(e) => e.target.style.transform = 'scale(1)'} onClick={handleEnrollClick}>
                    Inscribirme Ahora
                </button>
            );
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', color: '#333', fontFamily: "'Poppins', sans-serif" }}>
            <div style={{ backgroundColor: 'white', padding: '15px 5%', boxShadow: '0 2px 15px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <button onClick={() => navigate('/home')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid #eee', borderRadius: '30px', padding: '8px 20px', color: '#555', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <FaArrowLeft /> Catálogo
                </button>
            </div>

            <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px 60px' }}>
                {/* BANNER ORIGINAL */}
                <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative', height: '350px', backgroundColor: '#eee' }}>
                    <img src={getImageUrl(course.imagen_portada)} alt={course.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', padding: '60px 40px 30px', boxSizing: 'border-box' }}>
                        <span style={{ backgroundColor: accentColor, color: 'white', padding: '6px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', display: 'inline-block', letterSpacing: '1px' }}>{isKids ? 'Zona Kids 🧒' : 'Profesional 🎓'}</span>
                        <h1 style={{ margin: '0', fontSize: '2.5rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)', lineHeight: '1.2' }}>{course.titulo}</h1>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '40px', marginTop: '40px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 2, minWidth: '320px', backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <h2 style={{ color: '#211F30', marginTop: 0, marginBottom: '20px' }}>Sobre este curso</h2>
                        <p style={{ lineHeight: '1.8', color: '#555', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>{course.descripcion}</p>
                    </div>

                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', position: 'sticky', top: '100px', border: '1px solid #f0f0f0' }}>
                            <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px dashed #eee' }}>
                                <span style={{ color: '#888', fontSize: '0.9rem', display:'block', marginBottom:'5px' }}>Inversión Única</span>
                                <div style={{ fontSize: '2.8rem', fontWeight: '800', color: '#211F30', lineHeight:1 }}>S/ {course.precio} <span style={{fontSize:'1rem', color:'#999', fontWeight:'normal'}}> PEN</span></div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '30px', color: '#555', fontSize: '0.95rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaUserGraduate color="#aaa" /> Certificado Incluido</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaStar color="#ffc107"/> 4.9 Valoración</div>
                            </div>
                            {renderActionButton()}
                        </div>
                    </div>
                </div>
            </div>

            {showPayment && <PaymentModal course={course} onClose={() => setShowPayment(false)} onConfirm={handlePaymentSuccess} />}
            
            {showPendingModal && (
                <div className="custom-modal-overlay" style={modalOverlayStyle}>
                    <div className="custom-modal" style={modalContentStyle}>
                        <FaHourglassHalf size={60} color="#FFA000" style={{marginBottom:'20px'}} />
                        <h2>Inscripción Pendiente</h2>
                        <p>Espera a que el administrador acepte tu inscripción para ingresar al aula virtual.</p>
                        <button onClick={() => setShowPendingModal(false)} style={modalButtonStyle}>Entendido</button>
                    </div>
                </div>
            )}
            <style>{`.spin-animation { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const modalOverlayStyle = { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(33, 31, 48, 0.7)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:3000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { background:'white', padding:'40px', borderRadius:'24px', width:'400px', maxWidth:'90%', textAlign:'center', position:'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const modalButtonStyle = { background:'#217CA3', color:'white', border:'none', padding:'14px 30px', borderRadius:'30px', fontSize:'1rem', fontWeight:'bold', cursor:'pointer', marginTop:'20px', width:'100%' };

export default CoursePage;  