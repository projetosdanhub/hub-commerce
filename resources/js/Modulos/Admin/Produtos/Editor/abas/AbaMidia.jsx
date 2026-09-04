import React, { useState } from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaMidia({ p, setP }) {
    const handleMainImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 4 * 1024 * 1024) {
                alert("A imagem principal não pode exceder 4MB.");
                return;
            }
            const url = URL.createObjectURL(file);
            setP({...p, imgObject: file, img: url});
        }
    };

    const handleGalleryChange = (e) => {
        if (e.target.files) {
            const currentGaleria = p.galeriaObjects || [];
            const files = Array.from(e.target.files);
            
            let validFiles = [];
            for (let file of files) {
                if (file.size > 4 * 1024 * 1024) {
                    alert(`A imagem ${file.name} excede o limite de 4MB e não será adicionada.`);
                    continue;
                }
                validFiles.push({ file, url: URL.createObjectURL(file) });
            }

            if (currentGaleria.length + validFiles.length > 10) {
                alert("Você pode adicionar no máximo 10 imagens à galeria.");
                validFiles = validFiles.slice(0, 10 - currentGaleria.length);
            }

            setP({ ...p, galeriaObjects: [...currentGaleria, ...validFiles] });
        }
    };

    const removeGalleryImage = (index) => {
        const newGaleria = [...(p.galeriaObjects || [])];
        newGaleria.splice(index, 1);
        setP({ ...p, galeriaObjects: newGaleria });
    };

    const handleVideoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 12 * 1024 * 1024) {
                alert("O vídeo não pode exceder 12MB.");
                return;
            }
            const url = URL.createObjectURL(file);
            setP({...p, videoObject: file, video: url});
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1024px', margin: '0 auto' }}>
            <div className="hub-card">
                <div style={{ marginBottom: '16px' }}>
                    <h3 className="hub-card-title">Imagem Principal</h3>
                </div>
                
                <div className="md-flex" style={{ gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{ width: '192px', height: '192px', borderRadius: 'var(--hub-radius-lg)', border: '1px solid var(--hub-border-subtle)', overflow: 'hidden', backgroundColor: 'var(--hub-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                        {p.img ? (
                            <>
                                <img src={p.img} alt="Principal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                    <label style={{ width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hub-text-secondary)', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.color = 'var(--hub-primary)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'var(--hub-text-secondary)'}}>
                                        <Icons.Edit style={{ width: '20px', height: '20px' }} />
                                        <input type="file" style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" onChange={handleMainImageChange} />
                                    </label>
                                    <button 
                                        onClick={() => setP({...p, img: null, imgObject: null})}
                                        style={{ width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hub-text-secondary)', cursor: 'pointer', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => {e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.color = 'var(--hub-danger)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'var(--hub-text-secondary)'}}
                                    >
                                        <Icons.Trash style={{ width: '20px', height: '20px' }} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--hub-text-muted)', transition: 'colors 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--hub-primary)'; e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--hub-text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'}}>
                                <Icons.Image style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Adicionar Imagem</span>
                                <input type="file" style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" onChange={handleMainImageChange} />
                            </label>
                        )}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>Dicas de formato</h4>
                            <ul style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', listStyleType: 'disc', listStylePosition: 'inside' }}>
                                <li>Formato JPG, PNG ou WEBP</li>
                                <li>Tamanho máximo: 4MB</li>
                                <li>Recomendado: 1200x1200px para zoom de qualidade</li>
                                <li>Fundo branco ou transparente</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hub-card">
                <div style={{ marginBottom: '16px' }}>
                    <div>
                        <h3 className="hub-card-title">Vídeo Principal</h3>
                        <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginTop: '4px' }}>Aumente a conversão exibindo seu produto em movimento.</p>
                    </div>
                </div>
                
                <div className="md-flex" style={{ gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{ width: '192px', height: '192px', borderRadius: 'var(--hub-radius-lg)', border: '1px solid var(--hub-border-subtle)', overflow: 'hidden', backgroundColor: 'var(--hub-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                        {p.video ? (
                            <>
                                <video src={p.video} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop autoPlay />
                                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                                    <label style={{ width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hub-text-secondary)', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.color = 'var(--hub-primary)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'var(--hub-text-secondary)'}}>
                                        <Icons.Edit style={{ width: '20px', height: '20px' }} />
                                        <input type="file" style={{ display: 'none' }} accept="video/mp4" onChange={handleVideoChange} />
                                    </label>
                                    <button 
                                        onClick={() => setP({...p, video: null, videoObject: null})}
                                        style={{ width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hub-text-secondary)', cursor: 'pointer', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                                        onMouseEnter={(e) => {e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.color = 'var(--hub-danger)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'var(--hub-text-secondary)'}}
                                    >
                                        <Icons.Trash style={{ width: '20px', height: '20px' }} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--hub-text-muted)', transition: 'colors 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--hub-primary)'; e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'}} onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--hub-text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'}}>
                                <Icons.Play style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>Adicionar<br/>Vídeo</span>
                                <input type="file" style={{ display: 'none' }} accept="video/mp4" onChange={handleVideoChange} />
                            </label>
                        )}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>Dicas de formato de Vídeo</h4>
                            <ul style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', listStyleType: 'disc', listStylePosition: 'inside' }}>
                                <li>Formato MP4 ou WEBM</li>
                                <li>Tamanho máximo: 12MB</li>
                                <li>Duração sugerida: até 15 segundos</li>
                                <li>Sem áudio (ideal para autoplay na loja)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hub-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                        <h3 className="hub-card-title">Galeria de Imagens</h3>
                        <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginTop: '4px' }}>Imagens secundárias do produto (máx. 10).</p>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--hub-surface)', color: 'var(--hub-text-primary)', borderRadius: 'var(--hub-radius-lg)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'background-color 0.2s', border: '1px solid var(--hub-border)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hub-surface-subtle)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--hub-surface)'}>
                        <Icons.Plus style={{ width: '16px', height: '16px' }} /> Adicionar Fotos
                        <input type="file" multiple style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" onChange={handleGalleryChange} />
                    </label>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                    {p.galeriaObjects && p.galeriaObjects.map((item, index) => (
                        <div key={index} style={{ aspectRatio: '1 / 1', borderRadius: 'var(--hub-radius-lg)', border: '1px solid var(--hub-border-subtle)', overflow: 'hidden', backgroundColor: 'var(--hub-surface-subtle)', position: 'relative' }} onMouseEnter={(e) => {e.currentTarget.querySelector('.overlay').style.opacity = '1'}} onMouseLeave={(e) => {e.currentTarget.querySelector('.overlay').style.opacity = '0'}}>
                            <img src={item.url || URL.createObjectURL(item.file)} alt={`Galeria ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                <button 
                                    onClick={() => removeGalleryImage(index)}
                                    style={{ width: '32px', height: '32px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hub-text-secondary)', cursor: 'pointer', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => {e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.color = 'var(--hub-danger)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = 'var(--hub-text-secondary)'}}
                                >
                                    <Icons.Trash style={{ width: '16px', height: '16px' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {(!p.galeriaObjects || p.galeriaObjects.length < 10) && (
                        <label style={{ aspectRatio: '1 / 1', border: '2px dashed var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--hub-surface-subtle)', color: 'var(--hub-text-muted)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = 'var(--hub-surface)'; e.currentTarget.style.borderColor = 'var(--hub-primary-light)'}} onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = 'var(--hub-surface-subtle)'; e.currentTarget.style.borderColor = 'var(--hub-border-subtle)'}}>
                            <Icons.Upload style={{ width: '24px', height: '24px', marginBottom: '8px', color: 'var(--hub-border-dark)' }} />
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textAlign: 'center', padding: '0 8px' }}>Adicionar<br/>mais imagens</span>
                            <input type="file" multiple style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" onChange={handleGalleryChange} />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}