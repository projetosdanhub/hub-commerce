import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Unlock, Loader2, Save } from 'lucide-react';

export const UIIcons = {
    Spinner: ({ className }) => <Loader2 className={`animate-spin ${className}`} />,
};

// --- Botão de salvar estilo Animado (azul) ---
export const AnimatedSaveButton = ({ onClick, loading, text, icon: Icon = Save, disabled = false, className = '' }) => (
    <button 
        type={onClick ? "button" : "submit"} 
        onClick={onClick} 
        disabled={loading || disabled} 
        className={`group relative overflow-hidden bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
        {loading ? <UIIcons.Spinner className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4" />}
        <span className="relative z-10">{loading ? "Processando..." : text}</span>
    </button>
);

// --- Neumorphic Toggle Circular (Afunda ao clicar) ---
export const NeumorphicToggle = ({ active, onChange }) => (
    <motion.button
        type="button"
        onClick={() => onChange(!active)}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 focus:outline-none ${
            active 
                ? 'bg-blue-50 border border-blue-200/50 shadow-[inset_4px_4px_8px_rgba(191,219,254,0.7),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]' 
                : 'bg-slate-50 border border-slate-200/50 shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_8px_rgba(0,0,0,0.04),-4px_-4px_8px_rgba(255,255,255,0.9)]'
        }`}
        whileTap={{ scale: 0.95 }}
        role="switch"
        aria-checked={active}
    >
        <div className={`w-6 h-6 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center ${active ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]' : 'bg-slate-300'}`}>
            <div className={`w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
        </div>
    </motion.button>
);

// --- Toggle animado ON/OFF ---
export const AnimatedToggle = ({ active, onChange }) => (
    <button 
        type="button" 
        onClick={() => onChange(!active)} 
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}
        role="switch"
        aria-checked={active}
    >
        <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

// --- Input seguro para tokens/credenciais ---
export const SecureInput = ({ value, onChange, placeholder, isToken = true }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [showText, setShowText] = useState(false);
    return (
        <div className="relative flex items-center w-full group">
            <input 
                type={showText || !isToken ? "text" : "password"} 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                placeholder={placeholder} 
                disabled={isLocked} 
                className={`w-full border rounded-lg pl-3 pr-20 h-10 text-sm outline-none transition-all font-mono ${isLocked ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-blue-400 ring-4 ring-blue-50 text-slate-900'}`} 
            />
            <div className="absolute right-2 flex items-center gap-1">
                {isToken && (
                    <button type="button" onClick={() => setShowText(!showText)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors" aria-label={showText ? 'Ocultar token' : 'Mostrar token'}>
                        {showText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
                <button type="button" onClick={() => setIsLocked(!isLocked)} className={`p-1 transition-colors ${isLocked ? 'text-slate-400 hover:text-blue-600' : 'text-emerald-600 hover:text-slate-500'}`} aria-label={isLocked ? 'Desbloquear campo' : 'Bloquear campo'}>
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};