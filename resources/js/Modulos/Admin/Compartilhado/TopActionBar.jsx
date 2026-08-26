import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TopActionBar = ({ 
    onSave, 
    onCancel, 
    isSaving, 
    saveText = "Salvar Alterações", 
    cancelText = "Cancelar",
    showCancel = true,
    children 
}) => {
    return (
        <div className="sticky top-0 z-50 w-full mb-6 backdrop-blur-xl bg-white/70 border-b border-slate-200/50 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] rounded-b-3xl sm:rounded-b-[2rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
                <div className="flex-1 w-full sm:w-auto">
                    {children}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {showCancel && (
                        <button 
                            onClick={onCancel}
                            disabled={isSaving}
                            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-slate-200 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button 
                        onClick={onSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSaving ? (
                            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        )}
                        {saveText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-xl border border-blue-100 flex items-center justify-center hover:bg-blue-50 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
};
