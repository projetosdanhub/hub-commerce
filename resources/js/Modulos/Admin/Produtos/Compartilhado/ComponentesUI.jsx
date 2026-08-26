import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icones';

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
    <div className="group relative flex items-center justify-center cursor-help">
        {children || <Icons.Info className="w-4 h-4 text-slate-400 hover:text-blue-500 transition-colors" />}
        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[99999] w-max max-w-[250px] whitespace-normal bg-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-xl flex flex-col items-center text-center leading-relaxed border border-slate-700">
            {title && <span className="text-blue-300 mb-1 border-b border-slate-600 pb-1 w-full uppercase tracking-widest text-[9px]">{title}</span>}
            <span className="font-mono text-slate-200">{text}</span>
            <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
        </div>
    </div>
);

export const PremiumSaveButton = ({ onClick, loading, text, icon: Icon = Icons.Check, disabled = false, className = '' }) => (
    <button 
        type={onClick ? "button" : "submit"} 
        onClick={onClick} 
        disabled={loading || disabled} 
        className={`group relative overflow-hidden bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 ${className}`}
    >
        {loading ? <Icons.Spinner className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4 group-hover:scale-110 transition-transform"/>}
        <span className="relative z-10">{loading ? "Processando..." : text}</span>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, ease: "linear", repeat: Infinity }} className="absolute left-0 bottom-0 h-1 bg-blue-500 z-0" />}
    </button>
);

export const CustomStyles = () => (
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
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
    `}} />
);

export const FadeIn = ({ children, className = "", ...props }) => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }} className={className} {...props}>
        {children}
    </motion.div>
);

export const AnimatedToggle = ({ active, onChange }) => (
    <button type="button" role="switch" aria-checked={active} onClick={() => onChange(!active)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

export const AnimatedNotification = ({ show, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[999999] bg-white rounded-[20px] shadow-xl border border-slate-200 p-3 flex items-center gap-4 min-w-[300px]" role="alert">
                <div className="relative w-10 h-10 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    {status === 'loading' ? <Icons.Spinner className="text-blue-500 w-5 h-5" /> : status === 'error' ? <Icons.AlertTriangle className="text-rose-500 w-5 h-5"/> : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500"><Icons.Check className="w-5 h-5"/></motion.div>}
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Processar...' : status === 'error' ? 'Atenção' : 'Concluído'}</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{titulo}</p>
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
                <section className="p-10 bg-rose-50 border border-rose-200 rounded-[24px] text-center mt-6 shadow-sm max-w-lg mx-auto">
                    <Icons.AlertTriangle />
                    <h2 className="text-2xl font-black text-rose-900 mb-2 mt-4">Ops! Falha Estrutural</h2>
                    <p className="text-sm text-rose-700 mb-6">Encontramos dados corrompidos ao carregar o catálogo. Mas nós seguramos o sistema para não travar!</p>
                    <button onClick={() => window.location.reload()} aria-label="Recarregar página" className="bg-rose-600 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-rose-700 transition-colors">
                        Tentar Novamente
                    </button>
                </section>
            );
        }
        return this.props.children;
    }
}
