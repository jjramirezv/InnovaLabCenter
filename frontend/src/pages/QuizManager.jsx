import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaClipboardList, FaPlus, FaTrash, FaClock, FaCheckCircle, 
    FaEdit, FaEye, FaEyeSlash, FaExclamationTriangle 
} from 'react-icons/fa';

function QuizManager({ courseId }) {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    
    // Estados para Crear Examen
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newQuiz, setNewQuiz] = useState({
        titulo: '',
        descripcion: '',
        duracion_minutos: 30,
        nota_minima: 14,
        fecha_limite: ''
    });

    // Estados de UI
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    // Modal de Borrado
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, [courseId]);

    // --- CORRECCIÓN 1: ENVIAR TOKEN AL OBTENER LISTA ---
    const fetchQuizzes = async () => {
        try {
            const token = localStorage.getItem('token');
            // Si no hay token, probablemente deba loguearse de nuevo, pero intentamos igual
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const res = await axios.get(`/quizzes/course/${courseId}`, config);
            setQuizzes(res.data);
        } catch (error) { 
            console.error("Error cargando exámenes:", error); 
        }
    };

    // --- CORRECCIÓN 2: ASEGURAR TOKEN AL CREAR ---
    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        if (!newQuiz.titulo.trim()) {
            setErrorMsg('El examen necesita un título.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Tu sesión parece haber expirado. Por favor inicia sesión nuevamente.");
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`/quizzes/course/${courseId}`, newQuiz, config);
            
            setSuccessMsg('Examen creado exitosamente.');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchQuizzes();
            setShowCreateModal(false);
            setNewQuiz({ titulo: '', descripcion: '', duracion_minutos: 30, nota_minima: 14, fecha_limite: '' });

        } catch (error) {
            console.error(error);
            setErrorMsg('Error al crear el examen. Verifica tu conexión.');
        }
    };

    const confirmDelete = (quiz) => {
        setQuizToDelete(quiz);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!quizToDelete) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.delete(`/quizzes/${quizToDelete.id}`, config);
            
            setShowDeleteModal(false);
            setQuizToDelete(null);
            fetchQuizzes();
        } catch (error) { console.error(error); }
    };

    const toggleStatus = async (quiz) => {
        const newStatus = quiz.estado === 'borrador' ? 'publicado' : 'borrador';
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.patch(`/quizzes/${quiz.id}/status`, { estado: newStatus }, config);
            fetchQuizzes(); 
        } catch (error) {
            console.error("Error cambiando estado", error);
        }
    };

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginTop: '30px' }}>
            
            {/* CABECERA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h3 style={{ color: '#211F30', fontSize:'1.2rem', display:'flex', alignItems:'center', gap:'10px', margin:0 }}>
                    <FaClipboardList color="#E29930"/> Evaluaciones y Exámenes
                </h3>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    style={{ 
                        background: '#217CA3', color: 'white', border: 'none', padding: '10px 20px', 
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' 
                    }}
                >
                    <FaPlus /> Nuevo Examen
                </button>
            </div>

            {/* MENSAJES */}
            {successMsg && (
                <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '15px', borderRadius: '8px', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
                    <FaCheckCircle /> {successMsg}
                </div>
            )}

            {/* LISTA DE EXÁMENES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {quizzes.length === 0 && (
                    <div style={{ textAlign:'center', padding:'40px', color:'#999', background:'#FAFAFA', borderRadius:'12px', border:'1px dashed #ddd' }}>
                        <FaClipboardList size={30} style={{marginBottom:'10px', opacity:0.3}}/>
                        <p>No hay exámenes creados en este curso.</p>
                    </div>
                )}

                {quizzes.map(quiz => (
                    <div key={quiz.id} style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '20px', border: '1px solid #EEE', borderRadius: '10px', background: 'white',
                        transition:'all 0.2s', borderLeft: quiz.estado === 'publicado' ? '5px solid #4CAF50' : '5px solid #FF9800'
                    }}>
                        <div>
                            <strong style={{ display: 'block', color: '#333', fontSize:'1.1rem', marginBottom:'5px' }}>{quiz.titulo}</strong>
                            <div style={{ display:'flex', gap:'15px', color:'#666', fontSize:'0.9rem', alignItems:'center' }}>
                                <span style={{display:'flex', alignItems:'center', gap:'5px'}}><FaClock size={12}/> {quiz.duracion_minutos} min</span>
                                <span style={{display:'flex', alignItems:'center', gap:'5px'}}>Nota Mínima: <strong>{quiz.nota_minima}</strong></span>
                                
                                <button 
                                    onClick={() => toggleStatus(quiz)}
                                    title={quiz.estado === 'borrador' ? "Clic para Publicar" : "Clic para Ocultar"}
                                    style={{ 
                                        padding:'4px 12px', borderRadius:'15px', fontSize:'0.75rem', border:'none', cursor:'pointer',
                                        background: quiz.estado === 'publicado' ? '#E8F5E9' : '#FFF3E0',
                                        color: quiz.estado === 'publicado' ? '#2E7D32' : '#EF6C00',
                                        display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold'
                                    }}
                                >
                                    {quiz.estado === 'publicado' ? <><FaEye /> PUBLICADO</> : <><FaEyeSlash /> BORRADOR</>}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => navigate(`/admin/quiz/${quiz.id}/edit`)} 
                                style={{ 
                                    padding: '10px 15px', color: 'white', background: '#E29930', border: 'none', 
                                    borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold'
                                }}
                            >
                                <FaEdit /> Editar Preguntas
                            </button>
                            <button 
                                onClick={() => confirmDelete(quiz)}
                                style={{ 
                                    padding: '10px', color: '#D32F2F', background: '#FFF0F0', border: 'none', 
                                    borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center'
                                }}
                                title="Eliminar Examen"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL CREAR EXAMEN */}
            {showCreateModal && (
                <div className="custom-modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div className="custom-modal" style={{background:'white', padding:'30px', borderRadius:'16px', width:'500px', boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
                        <h2 style={{color:'#211F30', margin:'0 0 20px 0'}}>Configurar Nuevo Examen</h2>
                        {errorMsg && <p style={{color:'red', fontSize:'0.9rem'}}>{errorMsg}</p>}
                        <form onSubmit={handleCreateQuiz}>
                            <div style={{marginBottom:'15px'}}>
                                <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Título</label>
                                <input type="text" value={newQuiz.titulo} onChange={e => setNewQuiz({...newQuiz, titulo: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} placeholder="Ej: Examen Final - Módulo 1"/>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'15px'}}>
                                <div><label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Duración (min)</label><input type="number" value={newQuiz.duracion_minutos} onChange={e => setNewQuiz({...newQuiz, duracion_minutos: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}}/></div>
                                <div><label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Nota para Aprobar</label><input type="number" value={newQuiz.nota_minima} onChange={e => setNewQuiz({...newQuiz, nota_minima: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}}/></div>
                            </div>
                            <div style={{marginBottom:'20px'}}>
                                <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Descripción</label>
                                <textarea rows="3" value={newQuiz.descripcion} onChange={e => setNewQuiz({...newQuiz, descripcion: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}} placeholder="Instrucciones..."/>
                            </div>
                            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{padding:'10px 20px', borderRadius:'5px', border:'none', cursor:'pointer', background:'#f0f0f0'}}>Cancelar</button>
                                <button type="submit" style={{padding:'10px 20px', borderRadius:'5px', border:'none', cursor:'pointer', background:'#217CA3', color:'white', fontWeight:'bold'}}>Crear y Continuar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ELIMINAR EXAMEN */}
            {showDeleteModal && (
                <div className="custom-modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div style={{background:'white', padding:'30px', borderRadius:'16px', width:'380px', textAlign:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
                        <div style={{fontSize:'3rem', color:'#E29930', marginBottom:'15px'}}><FaExclamationTriangle /></div>
                        <h2 style={{color:'#211F30', margin:'0 0 10px 0'}}>¿Borrar Examen?</h2>
                        <p style={{color:'#666', marginBottom:'25px'}}>Se eliminará <strong>"{quizToDelete?.titulo}"</strong> y todas sus preguntas y notas. <br/><br/>Esta acción es irreversible.</p>
                        <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                            <button onClick={() => setShowDeleteModal(false)} style={{background:'#F0F0F0', color:'#555', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Cancelar</button>
                            <button onClick={handleDelete} style={{background:'#E29930', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', boxShadow:'0 4px 15px rgba(226, 153, 48, 0.3)'}}>Sí, Eliminar Todo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizManager; 