import React, { useState } from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaMidia({ p, setP }) {
    const handleMainImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("A imagem principal não pode exceder 5MB.");
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
                if (file.size > 5 * 1024 * 1024) {
                    alert(`A imagem ${file.name} excede o limite de 5MB e não será adicionada.`);
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
            if (file.size > 20 * 1024 * 1024) {
                alert("O vídeo não pode exceder 20MB.");
                return;
            }
            const url = URL.createObjectURL(file);
            setP({...p, videoObject: file, video: url});
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Imagem Principal</h3>
                </div>
                
                <div className="flex items-start gap-6">
                    <div className="w-48 h-48 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center relative group shrink-0">
                        {p.img ? (
                            <>
                                <img src={p.img} alt="Principal" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 cursor-pointer shadow-sm hover:scale-110 transition-transform">
                                        <Icons.Edit className="w-5 h-5" />
                                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleMainImageChange} />
                                    </label>
                                    <button 
                                        onClick={() => setP({...p, img: null, imgObject: null})}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-sm hover:scale-110 transition-transform"
                                    >
                                        <Icons.Trash className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors">
                                <Icons.Image className="w-10 h-10 mb-2" />
                                <span className="text-xs font-bold">Adicionar Imagem</span>
                                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleMainImageChange} />
                            </label>
                        )}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-slate-700">Dicas de formato</h4>
                            <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc list-inside">
                                <li>Formato JPG, PNG ou WEBP</li>
                                <li>Tamanho máximo: 5MB</li>
                                <li>Recomendado: 1200x1200px para zoom de qualidade</li>
                                <li>Fundo branco ou transparente</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Vídeo Principal</h3>
                        <p className="text-xs text-slate-500 mt-1">Aumente a conversão exibindo seu produto em movimento.</p>
                    </div>
                </div>
                
                <div className="flex items-start gap-6">
                    <div className="w-48 h-48 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center relative group shrink-0">
                        {p.video ? (
                            <>
                                <video src={p.video} className="w-full h-full object-cover" muted loop autoPlay />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 cursor-pointer shadow-sm hover:scale-110 transition-transform">
                                        <Icons.Edit className="w-5 h-5" />
                                        <input type="file" className="hidden" accept="video/mp4, video/webm" onChange={handleVideoChange} />
                                    </label>
                                    <button 
                                        onClick={() => setP({...p, video: null, videoObject: null})}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-sm hover:scale-110 transition-transform"
                                    >
                                        <Icons.Trash className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors">
                                <Icons.Play className="w-10 h-10 mb-2" />
                                <span className="text-xs font-bold text-center">Adicionar<br/>Vídeo</span>
                                <input type="file" className="hidden" accept="video/mp4, video/webm" onChange={handleVideoChange} />
                            </label>
                        )}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-slate-700">Dicas de formato de Vídeo</h4>
                            <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc list-inside">
                                <li>Formato MP4 ou WEBM</li>
                                <li>Tamanho máximo: 20MB</li>
                                <li>Duração sugerida: até 15 segundos</li>
                                <li>Sem áudio (ideal para autoplay na loja)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Galeria de Imagens</h3>
                        <p className="text-xs text-slate-500 mt-1">Imagens secundárias do produto (máx. 10).</p>
                    </div>
                    <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer">
                        <Icons.Plus className="w-4 h-4" /> Adicionar Fotos
                        <input type="file" multiple className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleGalleryChange} />
                    </label>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {p.galeriaObjects && p.galeriaObjects.map((item, index) => (
                        <div key={index} className="aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group">
                            <img src={item.url || URL.createObjectURL(item.file)} alt={`Galeria ${index}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    onClick={() => removeGalleryImage(index)}
                                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-700 hover:text-rose-600 shadow-sm hover:scale-110 transition-transform"
                                >
                                    <Icons.Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {(!p.galeriaObjects || p.galeriaObjects.length < 10) && (
                        <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group">
                            <Icons.Upload className="w-6 h-6 mb-2 text-slate-300 group-hover:text-blue-400 transition-colors" />
                            <span className="text-[10px] font-bold text-slate-500 text-center px-2">Adicionar<br/>mais imagens</span>
                            <input type="file" multiple className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleGalleryChange} />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}