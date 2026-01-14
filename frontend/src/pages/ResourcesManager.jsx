import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
    FaTrash, FaLink, FaFilePdf, FaPlus, FaExternalLinkAlt, 
    FaCheckCircle, FaExclamationCircle, FaTimes, FaCloudUploadAlt 
} from 'react-icons/fa';

// --- CONFIGURACIÓN DE URL ---
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://innovalabcenter-production.up.railway.app';

function ResourcesManager({ courseId }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Formulario
    const [newRes, setNewRes] = useState({ titulo: '', tipo: 'archivo', url_externa: '', descripcion: '' });
    const [file, setFile] = useState(null);

    // ESTADOS DE UI (Validación y Modales)
    const [validationError, setValidationError] = useState(''); // Error de formulario (rojo sutil)
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal éxito
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal confirmación borrar
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
        setValidationError(''); // Limpiar errores previos

        // 1. VALIDACIÓN MANUAL (Reemplaza al navegador)
        if (!newRes.titulo.trim()) {
            setValidationError('Por favor, ingresa un título para el recurso.');
            return;
        }
        if (newRes.tipo === 'archivo' && !file) {
            setValidationError('Debes seleccionar un archivo PDF, Word o Zip.');
            return;
        }
        if (newRes.tipo === 'link' && !newRes.url_externa.trim()) {
            setValidationError('Debes pegar una URL válida (ej: Drive, YouTube).');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('titulo', newRes.titulo);
        formData.append('tipo', newRes.tipo);
        formData.append('descripcion', newRes.descripcion);
        
        if (newRes.tipo === 'archivo') {
            formData.append('archivo', file);
        } else {
            formData.append('url_externa', newRes.url_externa);
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`/resources/course/${courseId}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            
            // ÉXITO: Limpiamos y mostramos Modal Bonito
            setNewRes({ titulo: '', tipo: 'archivo', url_externa: '', descripcion: '' });
            setFile(null);
            setShowSuccessModal(true); // <--- ACTIVAMOS MODAL
            fetchResources(); 

        } catch (error) {
            setValidationError('Hubo un error al subir el recurso. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Preparar eliminación
    const confirmDelete = (res) => {
        setResourceToDelete(res);
        setShowDeleteModal(true);
    };

    // Ejecutar eliminación
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

    // Helper URL
    const getResourceLink = (url) => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    return (
        <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginTop: '30px' }}>
            <h3 style={{ color: '#211F30', fontSize:'1.2rem', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px', display:'flex', alignItems:'center', gap:'10px' }}>
                <FaLink color="#217CA3"/> Gestión de Recursos Extra
            </h3>

            {/* FORMULARIO (con noValidate para desactivar mensajes del navegador) */}
            <form onSubmit={handleSubmit} noValidate style={{ background: '#F8F9FA', padding: '25px', borderRadius: '12px', marginBottom: '30px', border:'1px solid #eee' }}>
                
                {/* Mensaje de Error de Validación Personalizado */}
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
                        <label style={{fontWeight:'600', fontSize:'0.9rem', color:'#444'}}>Título del Recurso</label>
                        <input 
                            type="text" 
                            placeholder="Ej: Guía de Instalación PDF" 
                            value={newRes.titulo}
                            onChange={e => setNewRes({...newRes, titulo: e.target.value})}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline:'none', fontSize:'0.95rem' }}
                        />
                    </div>
                    
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        <label style={{fontWeight:'600', fontSize:'0.9rem', color:'#444'}}>Tipo de Recurso</label>
                        <select 
                            value={newRes.tipo}
                            onChange={e => setNewRes({...newRes, tipo: e.target.value})}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline:'none', fontSize:'0.95rem', background:'white' }}
                        >
                            <option value="archivo">📄 Subir Archivo (PDF, Doc)</option>
                            <option value="link">🔗 Enlace Externo (Drive, Web)</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    {newRes.tipo === 'archivo' ? (
                        <div style={{ position:'relative' }}>
                            <input 
                                type="file" 
                                id="file-upload"
                                onChange={e => setFile(e.target.files[0])}
                                style={{ display:'none' }}
                            />
                            <label htmlFor="file-upload" style={{
                                display:'flex', alignItems:'center', gap:'10px', padding:'15px', 
                                border:'2px dashed #217CA3', borderRadius:'8px', cursor:'pointer',
                                background: file ? '#E3F2FD' : 'white', transition:'all 0.2s', color:'#555'
                            }}>
                                <FaCloudUploadAlt size={24} color="#217CA3"/>
                                {file ? <strong>{file.name}</strong> : "Clic aquí para seleccionar archivo..."}
                            </label>
                        </div>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                            <label style={{fontWeight:'600', fontSize:'0.9rem', color:'#444'}}>URL del Enlace</label>
                            <input 
                                type="url" 
                                placeholder="https://drive.google.com/..."
                                value={newRes.url_externa}
                                onChange={e => setNewRes({...newRes, url_externa: e.target.value})}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width:'100%', boxSizing:'border-box' }}
                            />
                        </div>
                    )}
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
                    onMouseOver={(e) => !loading && (e.target.style.background = '#1A6585')}
                    onMouseOut={(e) => !loading && (e.target.style.background = '#217CA3')}
                >
                    {loading ? 'Guardando...' : <><FaPlus /> Agregar a la Clase</>}
                </button>
            </form>

            {/* LISTA DE RECURSOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {resources.length === 0 && (
                    <div style={{ textAlign:'center', padding:'40px', color:'#999', background:'#FAFAFA', borderRadius:'12px', border:'1px dashed #ddd' }}>
                        <FaExternalLinkAlt size={30} style={{marginBottom:'10px', opacity:0.3}}/>
                        <p>No hay recursos adicionales aún.</p>
                    </div>
                )}
                
                {resources.map(res => (
                    <div key={res.id} style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '15px 20px', border: '1px solid #EEE', borderRadius: '10px', background: 'white',
                        transition:'box-shadow 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                            <div style={{ 
                                width: '45px', height: '45px', borderRadius: '10px', 
                                background: res.tipo === 'archivo' ? '#FFF3E0' : '#E3F2FD',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: res.tipo === 'archivo' ? '#EF6C00' : '#1565C0',
                                fontSize:'1.2rem'
                            }}>
                                {res.tipo === 'archivo' ? <FaFilePdf /> : <FaLink />}
                            </div>
                            <div>
                                <strong style={{ display: 'block', color: '#333', fontSize:'1rem' }}>{res.titulo}</strong>
                                <small style={{ color: '#888', display:'flex', alignItems:'center', gap:'5px' }}>
                                    {res.tipo === 'archivo' ? 'Archivo descargable' : 'Enlace externo'}
                                </small>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a 
                                href={getResourceLink(res.url_recurso)} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ 
                                    padding: '10px', color: '#217CA3', background:'#F0F7FA', borderRadius: '8px', 
                                    display:'flex', alignItems:'center', justifyContent:'center', border:'none'
                                }}
                                title="Abrir recurso"
                            >
                                <FaExternalLinkAlt />
                            </a>
                            <button 
                                onClick={() => confirmDelete(res)}
                                style={{ 
                                    padding: '10px', color: '#D32F2F', background: '#FFF0F0', border: 'none', 
                                    borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center'
                                }}
                                title="Eliminar"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- MODAL DE ÉXITO (Estilo InnovaLab) --- */}
            {showSuccessModal && (
                <div className="custom-modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div style={{background:'white', padding:'30px', borderRadius:'16px', width:'350px', textAlign:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
                        <div style={{fontSize:'4rem', color:'#217CA3', marginBottom:'15px'}}><FaCheckCircle /></div>
                        <h2 style={{color:'#211F30', margin:'0 0 10px 0'}}>¡Agregado!</h2>
                        <p style={{color:'#666', marginBottom:'25px'}}>El recurso se ha guardado correctamente y ya es visible para los alumnos.</p>
                        <button 
                            onClick={() => setShowSuccessModal(false)}
                            style={{background:'#217CA3', color:'white', border:'none', padding:'12px 30px', borderRadius:'30px', fontWeight:'bold', cursor:'pointer', fontSize:'1rem', boxShadow:'0 4px 15px rgba(33, 124, 163, 0.3)'}}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {/* --- MODAL DE ELIMINAR (Estilo InnovaLab) --- */}
            {showDeleteModal && (
                <div className="custom-modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div style={{background:'white', padding:'30px', borderRadius:'16px', width:'350px', textAlign:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
                        <div style={{fontSize:'3rem', color:'#E29930', marginBottom:'15px'}}><FaTrash /></div>
                        <h2 style={{color:'#211F30', margin:'0 0 10px 0'}}>¿Eliminar Recurso?</h2>
                        <p style={{color:'#666', marginBottom:'25px'}}>Estás a punto de borrar <strong>"{resourceToDelete?.titulo}"</strong>. Esta acción no se puede deshacer.</p>
                        <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                style={{background:'#F0F0F0', color:'#555', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDelete}
                                style={{background:'#E29930', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', boxShadow:'0 4px 15px rgba(226, 153, 48, 0.3)'}}
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResourcesManager;