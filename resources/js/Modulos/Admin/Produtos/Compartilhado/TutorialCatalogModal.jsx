import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, X, Info } from 'lucide-react';

export const TutorialCatalogModal = ({ isOpen, onClose, title = "Catálogo de Funcionalidades", catalogData }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[500px]">
                
                <div className="flex-1 flex flex-col border-r border-slate-200">
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 m-0"><BookMarked size={20} className="text-blue-600" /> {title}</h2>
                        <button onClick={onClose} className="md:hidden p-1 text-slate-500 bg-transparent border-none cursor-pointer rounded-full hover:bg-slate-200 transition-colors"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        {catalogData && catalogData.map(group => (
                            <div key={group.groupName}>
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2 m-0">{group.groupName}</h3>
                                <div className="flex flex-col gap-2">
                                    {group.items.map(item => (
                                        <div 
                                            key={item.id} 
                                            onMouseEnter={() => setHoveredItem(item)}
                                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                            <span className="text-sm font-bold flex-1 text-slate-800">{item.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-slate-50 p-8 hidden md:flex flex-col justify-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 bg-transparent border-none cursor-pointer rounded-full hover:bg-slate-200 transition-colors"><X size={20}/></button>
                    <AnimatePresence mode="wait">
                        {hoveredItem ? (
                            <motion.div key={hoveredItem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-200 bg-white">
                                    <BookMarked size={28} className="text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2 m-0">{hoveredItem.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm mb-6 m-0">{hoveredItem.desc}</p>
                                {hoveredItem.formula && (
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest block mb-1">Cálculo / Lógica</span>
                                        <span className="font-mono text-xs text-blue-900 font-bold">{hoveredItem.formula}</span>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center flex flex-col items-center opacity-50">
                                <Info size={48} className="text-slate-400 mb-4" />
                                <p className="text-slate-500 font-medium m-0">Passe o mouse sobre um item do catálogo para ver sua definição detalhada.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
