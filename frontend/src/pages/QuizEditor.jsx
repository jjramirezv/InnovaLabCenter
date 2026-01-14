import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaArrowLeft, FaPlus, FaTrash, FaCheckCircle, FaSave, 
    FaListUl, FaFont, FaExclamationCircle, FaTimes, FaEye, FaEyeSlash, 
    FaExclamationTriangle, FaClipboardList 
} from 'react-icons/fa';

function QuizEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Limpieza de ID blindada
    const cleanId = id ? id.toString().split(':').filter(Boolean).pop() : ''; 

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newQ, setNewQ] = useState({ enunciado: '', tipo: 'multiple', puntos: 2 });
    const [options, setOptions] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    const [textAnswer, setTextAnswer] = useState('');

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);

    useEffect(() => {
        if (cleanId) fetchData();
    }, [cleanId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/quizzes/${cleanId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuiz(res.data.quiz);
            setQuestions(res.data.questions);
            setLoading(false);
        } catch (error) {
            console.error("Error cargando datos:", error);
            navigate(-1);
        }
    };

    const handleOptionChange = (index, val) => {
        const newOpts = [...options];
        newOpts[index].text = val;
        setOptions(newOpts);
    };

    const handleCorrectSelect = (index) => {
        const newOpts = options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
        setOptions(newOpts);
    };

    const addOptionInput = () => setOptions([...options, { text: '', isCorrect: false }]);
    const removeOptionInput = (index) => setOptions(options.filter((_, i) => i !== index));

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        setValidationError('');
        if (!newQ.enunciado.trim()) return setValidationError('Escribe el enunciado.');

        let payloadOptions = [];
        if (newQ.tipo === 'multiple') {
            const validOptions = options.filter(o => o.text.trim() !== '');
            if (validOptions.length < 2) return setValidationError('Mínimo 2 opciones.');
            if (!options.some(o => o.isCorrect)) return setValidationError('Marca la correcta.');
            payloadOptions = options.map(o => ({ texto: o.text, es_correcta: o.isCorrect }));
        } else {
            if (!textAnswer.trim()) return setValidationError('Escribe la respuesta correcta.');
            payloadOptions = [{ texto: textAnswer, es_correcta: true }];
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`/quizzes/${cleanId}/question`, {
                ...newQ,
                orden: questions.length + 1,
                opciones: payloadOptions
            }, { headers: { Authorization: `Bearer ${token}` } });

            setShowSuccessModal(true);
            setNewQ({ enunciado: '', tipo: 'multiple', puntos: 2 });
            setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
            setTextAnswer('');
            fetchData(); 
        } catch (error) {
            setValidationError('Error al guardar la pregunta.');
        }
    };

    const handleDeleteQuestion = async () => {
        if(!questionToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/quizzes/question/${questionToDelete}`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setShowDeleteModal(false);
            setQuestionToDelete(null);
            fetchData();
        } catch (error) { console.error("Error al borrar:", error); }
    };

    const toggleStatus = async () => {
        const newStatus = quiz.estado === 'borrador' ? 'publicado' : 'borrador';
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/quizzes/${cleanId}/status`, { estado: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuiz(prev => ({ ...prev, estado: newStatus }));
        } catch (error) { console.error(error); }
    };

    if (loading) return <div style={{padding:'40px', textAlign:'center', fontFamily:"'Poppins', sans-serif"}}>Cargando editor...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: "'Poppins', sans-serif" }}>
            {/* HEADER PROFESIONAL */}
            <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'30px', background:'white', padding:'15px 25px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                    <button onClick={() => navigate(-1)} style={{ background:'#f0f0f0', border:'none', width:'40px', height:'40px', borderRadius:'50%', cursor:'pointer', color:'#666', display:'flex', alignItems:'center', justifyContent:'center' }}><FaArrowLeft /></button>
                    <div>
                        <span style={{ fontSize:'0.8rem', color:'#888', textTransform:'uppercase', letterSpacing:'1px', display:'block' }}>Editando Examen</span>
                        <h1 style={{ margin:0, color:'#211F30', fontSize:'1.5rem' }}>{quiz?.titulo}</h1>
                    </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    <div onClick={toggleStatus} style={{ cursor:'pointer', padding:'8px 18px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.85rem', background: quiz?.estado === 'publicado' ? '#E8F5E9' : '#FFF3E0', color: quiz?.estado === 'publicado' ? '#2E7D32' : '#EF6C00', userSelect:'none', border: '1px solid currentColor' }}>
                        {quiz?.estado === 'publicado' ? <><FaEye /> PUBLICADO</> : <><FaEyeSlash /> BORRADOR</>}
                    </div>
                    <div style={{ background:'#F5F5F5', color:'#555', padding:'8px 18px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.85rem', border:'1px solid #ddd' }}>{questions.length} Preguntas</div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
                {/* LISTA DE PREGUNTAS (DISEÑO CARDS) */}
                <div style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
                    {questions.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'60px', background:'white', borderRadius:'16px', border:'2px dashed #ddd', color:'#aaa' }}>
                            <FaClipboardList size={40} style={{marginBottom:'10px'}} /> 
                            <h3>No hay preguntas aún</h3>
                            <p>Usa el panel de la derecha para empezar.</p>
                        </div>
                    ) : (
                        questions.map((q, index) => (
                            <div key={q.id} style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #217CA3', position:'relative' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                                    <h4 style={{ margin:0, color:'#211F30', fontSize:'1.1rem' }}><span style={{ color:'#217CA3', marginRight:'10px' }}>#{index + 1}</span> {q.enunciado}</h4>
                                    <button onClick={() => { setQuestionToDelete(q.id); setShowDeleteModal(true); }} style={{ color:'#D32F2F', background:'#FFEBEE', border:'none', width:'35px', height:'35px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><FaTrash /></button>
                                </div>
                                <div style={{ fontSize:'0.85rem', color:'#777', marginBottom:'15px', display:'flex', gap:'15px' }}>
                                    <span><b>Tipo:</b> {q.tipo === 'multiple' ? 'Múltiple' : 'Texto'}</span>
                                    <span><b>Puntos:</b> {q.puntos}</span>
                                </div>
                                <div style={{ display:'grid', gap:'8px' }}>
                                    {q.options?.map(opt => (
                                        <div key={opt.id} style={{ padding:'10px 15px', borderRadius:'8px', fontSize:'0.9rem', background: opt.es_correcta ? '#E8F5E9' : '#f8f9fa', border: opt.es_correcta ? '1px solid #A5D6A7' : '1px solid #eee', display:'flex', alignItems:'center', gap:'10px' }}>
                                            {opt.es_correcta ? <FaCheckCircle color="#2E7D32"/> : <div style={{width:'16px', height:'16px', borderRadius:'50%', border:'2px solid #ddd'}}/>}
                                            {opt.texto_opcion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* PANEL AGREGAR PREGUNTA (STICKY) */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', position:'sticky', top:'20px', height:'fit-content' }}>
                    <h3 style={{ margin:'0 0 25px 0', color:'#211F30', fontSize:'1.3rem', display:'flex', alignItems:'center', gap:'10px' }}><FaPlus size={18} color="#217CA3"/> Agregar Pregunta</h3>
                    
                    {validationError && (
                        <div style={{ background:'#FFEBEE', color:'#C62828', padding:'12px', borderRadius:'10px', marginBottom:'20px', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'8px' }}>
                            <FaExclamationCircle /> {validationError}
                        </div>
                    )}

                    <form onSubmit={handleSaveQuestion}>
                        <div style={{ marginBottom:'20px' }}>
                            <label style={{ display:'block', fontWeight:'600', marginBottom:'8px', color:'#444', fontSize:'0.9rem' }}>Enunciado</label>
                            <textarea rows="3" value={newQ.enunciado} onChange={e => setNewQ({...newQ, enunciado: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #ddd', fontFamily:'inherit', resize:'none' }} placeholder="¿Cuál es la pregunta?" />
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 100px', gap:'15px', marginBottom:'20px' }}>
                            <div>
                                <label style={{ display:'block', fontWeight:'600', marginBottom:'8px', color:'#444', fontSize:'0.9rem' }}>Tipo</label>
                                <select value={newQ.tipo} onChange={e => setNewQ({...newQ, tipo: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #ddd', background:'white' }}>
                                    <option value="multiple">Opción Múltiple</option>
                                    <option value="texto">Texto Libre</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display:'block', fontWeight:'600', marginBottom:'8px', color:'#444', fontSize:'0.9rem' }}>Puntos</label>
                                <input type="number" min="1" value={newQ.puntos} onChange={e => setNewQ({...newQ, puntos: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #ddd', textAlign:'center' }} />
                            </div>
                        </div>
                        <div style={{ background:'#fcfcfc', padding:'20px', borderRadius:'12px', border:'1px solid #eee', marginBottom:'25px' }}>
                            <label style={{ display:'block', fontWeight:'600', marginBottom:'15px', color:'#444', fontSize:'0.9rem' }}>Respuestas</label>
                            {newQ.tipo === 'multiple' ? (
                                <div style={{ display:'grid', gap:'12px' }}>
                                    {options.map((opt, idx) => (
                                        <div key={idx} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                            <input type="radio" checked={opt.isCorrect} onChange={() => handleCorrectSelect(idx)} style={{ cursor:'pointer', width:'18px', height:'18px', accentColor:'#217CA3' }} />
                                            <input type="text" value={opt.text} onChange={e => handleOptionChange(idx, e.target.value)} style={{ flex:1, padding:'10px', borderRadius:'8px', border: opt.isCorrect ? '2px solid #217CA3' : '1px solid #ddd' }} placeholder={`Opción ${idx+1}`} />
                                            {options.length > 2 && <button type="button" onClick={() => removeOptionInput(idx)} style={{ background:'none', border:'none', color:'#ccc', cursor:'pointer' }}><FaTimes /></button>}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addOptionInput} style={{ background:'none', border:'1px dashed #217CA3', color:'#217CA3', padding:'8px', borderRadius:'8px', cursor:'pointer', fontSize:'0.8rem', fontWeight:'600', marginTop:'5px' }}>+ Agregar Opción</button>
                                </div>
                            ) : (
                                <input type="text" value={textAnswer} onChange={e => setTextAnswer(e.target.value)} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'2px solid #217CA3' }} placeholder="Respuesta exacta esperada..." />
                            )}
                        </div>
                        <button type="submit" style={{ width:'100%', background:'#217CA3', color:'white', border:'none', padding:'15px', borderRadius:'12px', fontSize:'1rem', fontWeight:'bold', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'10px', boxShadow:'0 4px 15px rgba(33, 124, 163, 0.3)' }}><FaSave /> Guardar Pregunta</button>
                    </form>
                </div>
            </div>

            {/* MODAL ÉXITO (ESTILO INNOVALAB) */}
            {showSuccessModal && (
                <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(33, 31, 48, 0.6)', backdropFilter:'blur(4px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 }}>
                    <div style={{ background:'white', padding:'40px', borderRadius:'24px', width:'350px', textAlign:'center', boxShadow:'0 20px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ width:'70px', height:'70px', background:'#E8F5E9', color:'#2E7D32', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'2rem' }}><FaCheckCircle /></div>
                        <h2 style={{ margin:'0 0 10px 0', color:'#211F30' }}>¡Guardado!</h2>
                        <button onClick={() => setShowSuccessModal(false)} style={{ background:'#217CA3', color:'white', border:'none', padding:'12px 30px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer', width:'100%' }}>Entendido</button>
                    </div>
                </div>
            )}

            {/* MODAL ELIMINAR PREGUNTA */}
            {showDeleteModal && (
                <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(33, 31, 48, 0.6)', backdropFilter:'blur(4px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 }}>
                    <div style={{ background:'white', padding:'40px', borderRadius:'24px', width:'400px', textAlign:'center', boxShadow:'0 20px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ width:'70px', height:'70px', background:'#FFF3E0', color:'#E29930', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'2.5rem' }}><FaExclamationTriangle /></div>
                        <h2 style={{ margin:'0 0 10px 0', color:'#211F30' }}>¿Eliminar Pregunta?</h2>
                        <p style={{ color:'#666', marginBottom:'30px', lineHeight:'1.5' }}>Esta acción borrará la pregunta permanentemente del examen. ¿Deseas continuar?</p>
                        <div style={{ display:'flex', gap:'15px' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ flex:1, background:'#f0f0f0', color:'#555', border:'none', padding:'15px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer' }}>No, volver</button>
                            <button onClick={handleDeleteQuestion} style={{ flex:1, background:'#E29930', color:'white', border:'none', padding:'15px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer', boxShadow:'0 4px 15px rgba(226, 153, 48, 0.3)' }}>Sí, borrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizEditor;