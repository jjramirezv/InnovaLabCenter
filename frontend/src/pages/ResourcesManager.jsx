import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
    FaTrash, FaLink, FaPlus, FaExternalLinkAlt, 
    FaCheckCircle, FaExclamationCircle, FaTimes 
} from 'react-icons/fa';

function ResourcesManager({ courseId }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Formulario simplificado: Solo texto
    const [newRes, setNewRes] = useState({ titulo: '', url_externa: '', descripcion: '' });

    // ESTADOS DE UI
    const [validationError, setValidationError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);

    useEffect(() => {
        fetchResources();
    }, [courseId]);

    const fetchResources = async () => {
        try {
            const res = await axios.get(`/resources/course/${courseId}`);
            setResources(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        // VALIDACIÓN
        if (!newRes.titulo.trim()) {
            setValidationError('Por favor, ingresa un título para el recurso.');
            return;
        }
        if (!newRes.url_externa.trim()) {
            setValidationError('Debes pegar una URL de Google Drive, YouTube o similar.');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            // Enviamos un JSON simple ya que no hay archivos físicos
            await axios.post(`/resources/course/${courseId}`, {
                titulo: newRes.titulo,
                tipo: 'link', // Forzamos que el tipo siempre sea link
                url_externa: newRes.url_externa,
                descripcion: newRes.descripcion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNewRes({ titulo: '', url_externa: '', descripcion: '' });
            setShowSuccessModal(true);
            fetchResources(); 

        } catch (error) {
            setValidationError('Hubo un error al guardar el enlace. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (res) => {
        setResourceToDelete(res);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!resourceToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/resources/${resourceToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowDeleteModal(false);
            setResourceToDelete(null);
            fetchResources();
        } catch (error) { console.error(error); }
    };

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginTop: '30px' }}>
            <h3 style={{ color: '#211F30', fontSize:'1.2rem', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', display:'flex', alignItems:'center', gap:'10px' }}>
                <FaLink color="#217CA3"/> Enlaces de Recursos (Drive, YouTube, etc.)
            </h3>

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} noValidate style={{ background: '#F8F9FA', padding: '25px', borderRadius: '12px', marginBottom: '30px', border:'1px solid #eee' }}>
                
                {validationError && (
                    <div style={{ 
                        background: '#FFF0F0', color: '#D32F2F', padding: '12px 15px', borderRadius: '8px', 
                        fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderLeft:'4px solid #D32F2F'
                    }}>
                        <FaExclamationCircle /> {validationError}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        <label style={{fontWeight:'600', fontSize:'0.9rem', color:'#444'}}>Título del Material</label>
                        <input 
                            type="text" 
                            placeholder="Ej: Guía de Clase en PDF (Drive)" 
                            value={newRes.titulo}
                            onChange={e => setNewRes({...newRes, titulo: e.target.value})}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline:'none', fontSize:'0.95rem' }}
                        />
                    </div>
                    
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        <label style={{fontWeight:'600', fontSize:'0.9rem', color:'#444'}}>URL / Enlace del recurso</label>
                        <input 
                            type="url" 
                            placeholder="https://drive.google.com/..."
                            value={newRes.url_externa}
                            onChange={e => setNewRes({...newRes, url_externa: e.target.value})}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width:'100%', boxSizing:'border-box', outline:'none' }}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        background: '#217CA3', color: 'white', border: 'none', padding: '12px 25px', 
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', 
                        fontWeight: 'bold', fontSize:'1rem', transition:'background 0.2s',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Guardando...' : <><FaPlus /> Vincular Recurso</>}
                </button>
            </form>

            {/* LISTA DE RECURSOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {resources.length === 0 && (
                    <div style={{ textAlign:'center', padding:'40px', color:'#999', background:'#FAFAFA', borderRadius:'12px', border:'1px dashed #ddd' }}>
                        <FaExternalLinkAlt size={30} style={{marginBottom:'10px', opacity:0.3}}/>
                        <p>No hay enlaces agregados aún.</p>
                    </div>
                )}
                
                {resources.map(res => (
                    <div key={res.id} style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '15px 20px', border: '1px solid #EEE', borderRadius: '10px', background: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                            <div style={{ 
                                width: '45px', height: '45px', borderRadius: '10px', 
                                background: '#E3F2FD',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: '#1565C0',
                                fontSize:'1.2rem'
                            }}>
                                <FaLink />
                            </div>
                            <div>
                                <strong style={{ display: 'block', color: '#333', fontSize:'1rem' }}>{res.titulo}</strong>
                                <small style={{ color: '#888' }}>Enlace externo</small>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a 
                                href={res.url_recurso} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ 
                                    padding: '10px', color: '#217CA3', background:'#F0F7FA', borderRadius: '8px', 
                                    display:'flex', alignItems:'center', justifyContent:'center', border:'none'
                                }}
                            >
                                <FaExternalLinkAlt />
                            </a>
                            <button 
                                onClick={() => confirmDelete(res)}
                                style={{ 
                                    padding: '10px', color: '#D32F2F', background: '#FFF0F0', border: 'none', 
                                    borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center'
                                }}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALES DE ÉXITO Y ELIMINAR SE MANTIENEN IGUAL... */}
            {showSuccessModal && (
                <div className="custom-modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div style={{background:'white', padding:'30px', borderRadius:'16px', width:'350px', textAlign:'center'}}>
                        <div style={{fontSize:'4rem', color:'#217CA3', marginBottom:'15px'}}><FaCheckCircle /></div>
                        <h2>¡Enlazado!</h2>
                        <p>El enlace se ha guardado y ya es visible para los alumnos.</p>
                        <button onClick={() => setShowSuccessModal(false)} style={{background:'#217CA3', color:'white', border:'none', padding:'12px 30px', borderRadius:'30px', fontWeight:'bold', cursor:'pointer'}}>Continuar</button>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="custom-modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div style={{background:'white', padding:'30px', borderRadius:'16px', width:'350px', textAlign:'center'}}>
                        <div style={{fontSize:'3rem', color:'#E29930', marginBottom:'15px'}}><FaTrash /></div>
                        <h2>¿Quitar Enlace?</h2>
                        <p>Se borrará el acceso a <strong>"{resourceToDelete?.titulo}"</strong>.</p>
                        <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                            <button onClick={() => setShowDeleteModal(false)} style={{background:'#F0F0F0', color:'#555', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>Cancelar</button>
                            <button onClick={handleDelete} style={{background:'#E29930', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer'}}>Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResourcesManager;