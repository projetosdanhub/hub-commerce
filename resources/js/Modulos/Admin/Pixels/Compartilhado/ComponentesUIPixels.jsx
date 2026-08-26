// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Compartilhado/ComponentesUIPixels.jsx
// Componentes de UI específicos do módulo de Tracking
// ============================================================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Unlock, Loader2, Save } from 'lucide-react';

// --- Reexportar componentes compartilhados de Produtos ---
export { SafeTooltip, PremiumSaveButton, AnimatedNotification, CustomStyles, formatDateBR } from '../../Produtos/Compartilhado/ComponentesUI';

// --- Icons locais (spinner compatível com lucide) ---
export const PixelIcons = {
    Spinner: ({ className }) => <Loader2 className={`animate-spin ${className}`} />,
};

// --- Botão de salvar estilo Pixels (azul, diferente do preto de Produtos) ---
export const PixelSaveButton = ({ onClick, loading, text, icon: Icon = Save, disabled = false, className = '' }) => (
    <button 
        type={onClick ? "button" : "submit"} 
        onClick={onClick} 
        disabled={loading || disabled} 
        className={`hub-btn hub-btn-primary ${className}`}
    >
        {loading ? <PixelIcons.Spinner style={{ width: '16px', height: '16px' }} /> : <Icon style={{ width: '16px', height: '16px' }} />}
        <span className="hub-tab-label">{loading ? "Processando..." : text}</span>
    </button>
);

// --- Reexportar componentes globais ---
export { NeumorphicToggle, AnimatedToggle, SecureInput } from "../../Compartilhado/UIComponents";

// --- Botão circular com expansão hover ---
export const HoverProgressRoundButton = ({ text, onClick, loading, icon: Icon, ariaLabel, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);
    const shouldExpand = isHovered || isActive;

    return (
      <motion.button 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileTap={loading ? {} : { scale: 0.95 }} 
          onClick={onClick} 
          aria-label={ariaLabel}
          disabled={loading}
          animate={{ width: shouldExpand ? 'auto' : 48 }}
          className={`hub-btn hub-btn-round ${shouldExpand ? 'is-expanded' : ''}`}
      >
          {loading && (
             <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)', pointerEvents: 'none' }} viewBox="0 0 48 48">
                 <motion.circle cx="24" cy="24" r="22" fill="none" stroke="var(--hub-brand-primary)" strokeWidth="2" strokeDasharray="138" initial={{ strokeDashoffset: 138 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.8, ease: "linear" }} />
             </svg>
          )}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              {loading ? <PixelIcons.Spinner style={{ width: '20px', height: '20px', color: 'var(--hub-brand-primary)' }} /> : <Icon style={{ width: '20px', height: '20px', color: shouldExpand ? 'var(--hub-brand-primary)' : 'var(--hub-text-secondary)', transition: 'color 0.2s' }} />}
              <AnimatePresence>
                  {shouldExpand && !loading && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)' }}>
                          {text}
                      </motion.span>
                  )}
              </AnimatePresence>
          </div>
      </motion.button>
    );
};

// --- CustomStyles específicos de Pixels (scroll fino, flex container) ---
export const PixelCustomStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .thin-scroll { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
        .thin-scroll::-webkit-scrollbar { height: 3px; }
        .thin-scroll::-webkit-scrollbar-track { background: transparent; }
        .thin-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .thin-scroll:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
        .thin-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .smart-flex-container { display: flex; flex-wrap: wrap; width: 100%; gap: 1px; }
        .smart-flex-item { flex: 1 1 240px; min-width: 200px; }
    `}} />
);
