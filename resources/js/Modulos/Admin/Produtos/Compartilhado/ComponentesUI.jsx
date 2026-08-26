import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icones';
import { Loader2, Check, AlertTriangle } from 'lucide-react';

export const formatDateBR = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
};

export const gerarCSV = (dados) => {
    let csv = "Produto,Vendas,Receita Bruta,Receita Liquida,Status\n";
    dados.forEach(row => {
        csv += `"${row.nome}",${row.vendas || 0},${row.receitaGerada || 0},${row.receitaLiquida || 0},${row.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_produtos.csv";
    link.click();
};

export const SafeTooltip = ({ children, text, title }) => (
    <div className="group" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'help' }}>
        {children || <Icons.Info style={{ width: '16px', height: '16px', color: 'var(--hub-text-muted)', transition: 'color 0.2s' }} className="group-hover:text-[var(--hub-primary)]" />}
        <div className="hub-hover-show" style={{ position: 'absolute', bottom: '100%', marginBottom: '8px', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none', zIndex: 99999, width: 'max-content', maxWidth: '250px', whiteSpace: 'normal', backgroundColor: 'var(--hub-text)', color: '#fff', fontSize: '11px', fontWeight: '500', padding: '8px 12px', borderRadius: 'var(--hub-radius-md)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', lineHeight: 1.5, border: '1px solid var(--hub-border-strong)' }}>
            {title && <span style={{ color: 'var(--hub-primary-soft)', marginBottom: '4px', borderBottom: '1px solid var(--hub-border-strong)', paddingBottom: '4px', width: '100%', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', fontWeight: '600' }}>{title}</span>}
            <span style={{ fontFamily: 'monospace', color: 'var(--hub-surface-subtle)' }}>{text}</span>
            <svg style={{ position: 'absolute', color: 'var(--hub-text)', height: '8px', width: '100%', left: 0, top: '100%' }} x="0px" y="0px" viewBox="0 0 255 255"><polygon style={{ fill: 'currentColor' }} points="0,0 127.5,127.5 255,0"/></svg>
        </div>
    </div>
);

export const PremiumSaveButton = ({ onClick, loading, text, icon: Icon, disabled = false, className = '' }) => (
    <button 
        type={onClick ? "button" : "submit"} 
        onClick={onClick} 
        disabled={loading || disabled} 
        style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--hub-text)', color: 'var(--hub-text-on-color)', fontWeight: '600', padding: '12px 24px', borderRadius: 'var(--hub-radius-md)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap', transition: 'opacity 0.2s', opacity: (loading || disabled) ? 0.5 : 1, cursor: (loading || disabled) ? 'not-allowed' : 'pointer' }}
        className={`group hub-button-hover ${className}`}
    >
        {loading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: '#fff' }} />
        ) : Icon ? (
            <Icon style={{ width: '16px', height: '16px', transition: 'transform 0.2s' }} className="group-hover:scale-110" />
        ) : (
            <Check size={16} style={{ transition: 'transform 0.2s' }} className="group-hover:scale-110" />
        )}
        <span style={{ position: 'relative', zIndex: 10 }}>{loading ? "Processando..." : text}</span>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, ease: "linear", repeat: Infinity }} style={{ position: 'absolute', left: 0, bottom: 0, height: '4px', backgroundColor: 'var(--hub-primary)', zIndex: 0 }} />}
    </button>
);

/**
 * CustomStyles is now a no-op — all scrollbar, flex-container, and number-input
 * styles have been moved to admin-design-system.css. This export is kept for
 * backward compatibility with existing imports.
 */
export const CustomStyles = () => null;

export const FadeIn = ({ children, className = "", ...props }) => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className={className} {...props}>
        {children}
    </motion.div>
);

export const AnimatedToggle = ({ active, onChange }) => (
    <button 
        type="button" 
        role="switch" 
        aria-checked={active} 
        onClick={() => onChange(!active)} 
        style={{ position: 'relative', display: 'inline-flex', height: '24px', width: '44px', flexShrink: 0, cursor: 'pointer', borderRadius: '9999px', border: '2px solid transparent', transition: 'background-color 0.2s ease-in-out', outline: 'none', backgroundColor: active ? 'var(--hub-success)' : 'var(--hub-border-strong)' }}
    >
        <span aria-hidden="true" style={{ pointerEvents: 'none', display: 'inline-block', height: '20px', width: '20px', transform: active ? 'translateX(20px)' : 'translateX(0)', borderRadius: '9999px', backgroundColor: '#fff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', transition: 'transform 0.2s ease-in-out' }} />
    </button>
);

export const AnimatedNotification = ({ show, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div 
                initial={{ opacity: 0, y: -50, scale: 0.9 }} 
                animate={{ opacity: 1, y: 20, scale: 1 }} 
                exit={{ opacity: 0, y: -50, scale: 0.9 }} 
                style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 999999, backgroundColor: 'var(--hub-surface)', borderRadius: 'var(--hub-radius-lg)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid var(--hub-border-subtle)', padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '300px' }} 
                role="alert"
            >
                <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0, backgroundColor: 'var(--hub-surface-subtle)', border: '1px solid var(--hub-border-subtle)', borderRadius: 'var(--hub-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {status === 'loading' ? (
                        <Loader2 size={18} className="animate-spin" style={{ color: 'var(--hub-primary)' }} />
                    ) : status === 'error' ? (
                        <AlertTriangle size={18} style={{ color: 'var(--hub-danger)' }} />
                    ) : (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'var(--hub-success)' }}>
                            <Check size={18} />
                        </motion.div>
                    )}
                </div>
                <div style={{ paddingRight: '16px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--hub-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                        {status === 'loading' ? 'A Processar...' : status === 'error' ? 'Atenção' : 'Concluído'}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--hub-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

export class ProductErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, errorInfo: null }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { this.setState({ errorInfo: error.toString() }); }
    render() {
        if (this.state.hasError) {
            return (
                <section style={{ padding: '40px', backgroundColor: 'var(--hub-danger-subtle)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--hub-radius-lg)', textAlign: 'center', marginTop: '24px', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}>
                    <AlertTriangle size={32} style={{ margin: '0 auto', color: 'var(--hub-danger)' }} />
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--hub-danger)', marginBottom: '8px', marginTop: '16px' }}>Ops! Falha Estrutural</h2>
                    <p style={{ fontSize: '14px', color: 'var(--hub-text-secondary)', marginBottom: '24px' }}>Encontramos dados corrompidos ao carregar o catálogo. Mas nós seguramos o sistema para não travar!</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        aria-label="Recarregar página" 
                        style={{ backgroundColor: 'var(--hub-danger)', color: '#fff', fontWeight: '600', padding: '12px 32px', borderRadius: 'var(--hub-radius-md)', cursor: 'pointer', border: 'none' }}
                        className="hub-button-hover"
                    >
                        Tentar Novamente
                    </button>
                </section>
            );
        }
        return this.props.children;
    }
}
