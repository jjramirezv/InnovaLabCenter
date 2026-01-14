import React, { useState } from 'react';
import { FaWhatsapp, FaTimes, FaMobileAlt, FaMoneyBillWave, FaUniversity, FaArrowLeft, FaCopy, FaCheck } from 'react-icons/fa';

// --- TUS DATOS REALES SINCRONIZADOS ---
const DATA = {
    wspNumber: "51987564941", 
    yapeNumber: "950705734",
    plinNumber: "950705734",
    bbvaAccount: "898 3310032214",
    bbvaCCI: "00389801331003221447",
    holderName: "Luis Damian Damian",
    // Rutas de imágenes (deben estar en la carpeta public)
    qrYape: "/qr-yape.png",
    qrPlin: "/qr-plin.png"
};

const PaymentModal = ({ course, onClose, onConfirm }) => {
    const [step, setStep] = useState(1); // 1: Selección, 2: Mostrar Datos
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [copiedField, setCopiedField] = useState(null); 

    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
        setStep(2);
    };

    const handleFinalize = () => {
        // 1. Guardar en Base de Datos
        onConfirm(selectedMethod);

        // 2. Redirigir a WhatsApp con formato profesional
        const message = `Hola InnovaLab, ya realicé el pago de *S/ ${course.precio}* por *${selectedMethod.toUpperCase()}* para el curso *${course.titulo}*. Adjunto mi comprobante.`;
        const url = `https://wa.me/${DATA.wspNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="custom-modal-overlay" style={{
            position:'fixed', top:0, left:0, width:'100%', height:'100%', 
            background:'rgba(33, 31, 48, 0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="custom-modal" style={{
                background:'white', borderRadius:'24px', width:'420px', maxWidth:'95%', 
                boxShadow:'0 25px 50px rgba(0,0,0,0.4)', overflow:'hidden', position:'relative',
                animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                
                {/* CABECERA */}
                <div style={{background:'#211F30', padding:'20px 25px', color:'white', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    {step === 2 ? (
                        <button onClick={() => setStep(1)} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px', padding:0, opacity: 0.8}}>
                            <FaArrowLeft /> Atrás
                        </button>
                    ) : <div style={{width:'40px'}}></div>}
                    
                    <h3 style={{margin:0, fontSize:'1.1rem', flex:1, textAlign:'center', fontWeight:'600'}}>
                        {step === 1 ? 'Método de Pago' : `Pago con ${selectedMethod?.toUpperCase()}`}
                    </h3>
                    
                    <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.2rem', padding:0, opacity: 0.8}}><FaTimes/></button>
                </div>

                {/* CUERPO DEL MODAL */}
                <div style={{padding:'30px'}}>
                    
                    {/* PASO 1: SELECCIÓN DE MÉTODO */}
                    {step === 1 && (
                        <>
                            <div style={{textAlign:'center', marginBottom:'30px'}}>
                                <p style={{color:'#888', fontSize:'0.85rem', margin: '0 0 5px 0', textTransform:'uppercase', letterSpacing:'1px'}}>Estás adquiriendo</p>
                                <h4 style={{margin:'0 0 15px 0', color:'#333', fontSize:'1.2rem', fontWeight:'700', lineHeight:'1.3'}}>{course.titulo}</h4>
                                <div style={{fontSize:'2.8rem', fontWeight:'800', color:'#217CA3', lineHeight:'1'}}>
                                    S/ {course.precio}
                                </div>
                            </div>

                            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                <button onClick={() => handleSelectMethod('yape')} className="payment-btn" style={{borderColor:'#742284', color:'#742284'}}>
                                    <div className="icon-box" style={{background:'#742284'}}><FaMobileAlt/></div>
                                    <span>Yape</span>
                                </button>

                                <button onClick={() => handleSelectMethod('plin')} className="payment-btn" style={{borderColor:'#00C3E3', color:'#008AA1'}}>
                                    <div className="icon-box" style={{background:'#00C3E3'}}><FaMoneyBillWave/></div>
                                    <span>Plin</span>
                                </button>

                                <button onClick={() => handleSelectMethod('bbva')} className="payment-btn" style={{borderColor:'#003485', color:'#003485'}}>
                                    <div className="icon-box" style={{background:'#003485'}}><FaUniversity/></div>
                                    <span>Transferencia BBVA</span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* PASO 2: MOSTRAR QR Y DATOS */}
                    {step === 2 && (
                        <div style={{textAlign:'center', animation:'fadeIn 0.4s'}}>
                            
                            <div style={{background:'#F8F9FA', padding:'25px', borderRadius:'16px', border:'1px solid #eee', marginBottom:'25px'}}>
                                <p style={{fontSize:'0.8rem', color:'#888', marginBottom:'20px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:'700'}}>
                                    {selectedMethod === 'bbva' ? 'Datos para Transferencia' : 'Escanea el QR o usa el número'}
                                </p>

                                {selectedMethod !== 'bbva' ? (
                                    <>
                                        {/* IMAGEN QR DINÁMICA */}
                                        <div style={{width:'220px', height:'220px', background:'white', border:'1px solid #eee', margin:'0 auto 15px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'16px', padding:'10px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
                                            <img 
                                                src={selectedMethod === 'yape' ? DATA.qrYape : DATA.qrPlin} 
                                                alt={`QR ${selectedMethod}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=QR+No+Encontrado"; }}
                                            />
                                        </div>
                                        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'10px'}}>
                                            <h2 style={{margin:0, color:'#333', fontSize:'1.8rem', letterSpacing:'1px'}}>{selectedMethod === 'yape' ? DATA.yapeNumber : DATA.plinNumber}</h2>
                                            <FaCopy 
                                                className="copy-icon" 
                                                onClick={() => copyToClipboard(selectedMethod === 'yape' ? DATA.yapeNumber : DATA.plinNumber, 'phone')}
                                            />
                                        </div>
                                        {copiedField === 'phone' && <div style={{fontSize:'0.75rem', color:'#28a745', fontWeight:'bold'}}><FaCheck/> ¡Número copiado!</div>}
                                    </>
                                ) : (
                                    <div style={{textAlign:'left', background:'white', padding:'20px', borderRadius:'12px', border:'1px solid #eee', boxShadow:'0 2px 10px rgba(0,0,0,0.03)'}}>
                                        
                                        {/* CUENTA BBVA */}
                                        <div style={{marginBottom:'20px', paddingBottom:'15px', borderBottom:'1px solid #f0f0f0'}}>
                                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                                <label style={{fontSize:'0.75rem', color:'#888'}}>Cuenta Corriente:</label>
                                                {copiedField === 'acc' && <span style={{fontSize:'0.75rem', color:'#28a745', fontWeight:'bold', display:'flex', alignItems:'center', gap:'4px'}}><FaCheck/> ¡Copiado!</span>}
                                            </div>
                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                <span style={{fontWeight:'bold', color:'#333', fontSize:'1.1rem'}}>{DATA.bbvaAccount}</span>
                                                <FaCopy 
                                                    className="copy-icon" 
                                                    onClick={() => copyToClipboard(DATA.bbvaAccount, 'acc')}
                                                />
                                            </div>
                                        </div>

                                        {/* CCI BBVA */}
                                        <div>
                                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                                <label style={{fontSize:'0.75rem', color:'#888'}}>CCI (Interbancario):</label>
                                                {copiedField === 'cci' && <span style={{fontSize:'0.75rem', color:'#28a745', fontWeight:'bold', display:'flex', alignItems:'center', gap:'4px'}}><FaCheck/> ¡Copiado!</span>}
                                            </div>
                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                <span style={{fontWeight:'bold', color:'#333', fontSize:'1.1rem'}}>{DATA.bbvaCCI}</span>
                                                <FaCopy 
                                                    className="copy-icon" 
                                                    onClick={() => copyToClipboard(DATA.bbvaCCI, 'cci')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div style={{marginTop:'20px', fontSize:'0.85rem', color:'#555', borderTop:'1px dashed #ddd', paddingTop:'15px'}}>
                                    Titular: <strong>{DATA.holderName}</strong>
                                </div>
                            </div>

                            <button 
                                onClick={handleFinalize}
                                style={{
                                    width:'100%', padding:'16px', background:'#25D366', color:'white', border:'none', 
                                    borderRadius:'50px', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer',
                                    display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
                                    boxShadow:'0 8px 20px rgba(37, 211, 102, 0.3)', transition:'transform 0.2s'
                                }}
                                onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                <FaWhatsapp size={26} /> Ya pagué, enviar comprobante
                            </button>
                            <p style={{fontSize:'0.8rem', color:'#999', marginTop:'15px', marginBottom:0, lineHeight:'1.4'}}>
                                Se abrirá WhatsApp para validar tu pago y activar el curso.
                            </p>
                        </div>
                    )}
                </div>
                
                {/* ESTILOS INTERNOS */}
                <style>{`
                    .payment-btn {
                        width: 100%;
                        padding: 14px 20px; 
                        border: 2px solid #eee; 
                        border-radius: 16px;
                        background: white;
                        cursor: pointer;
                        display: flex;
                        align-items: center; 
                        gap: 20px; 
                        transition: all 0.2s ease-in-out;
                        font-weight: 700;
                        font-size: 1.1rem; 
                        text-align: left;
                    }
                    .payment-btn:hover {
                        background: #f8f9fa;
                        transform: translateY(-3px); 
                        box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                    }
                    .icon-box {
                        width: 48px; 
                        height: 48px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 1.5rem; 
                        flex-shrink: 0;
                    }
                    .copy-icon {
                        cursor: pointer;
                        color: #217CA3;
                        font-size: 1.2rem;
                        transition: all 0.2s;
                        padding: 5px;
                        border-radius: 50%;
                    }
                    .copy-icon:hover {
                        background: #eef7fb;
                        transform: scale(1.1);
                    }
                    @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                `}</style>
            </div>
        </div>
    );
};

export default PaymentModal;