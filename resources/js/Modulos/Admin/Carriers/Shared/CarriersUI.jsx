import React from 'react';
import { motion } from 'framer-motion';

export const CarriersIcons = {
    Truck: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    Plus: (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    Edit: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: ({className="w-4 h-4"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    ArrowLeft: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    ExternalLink: ({className="w-5 h-5"}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>,
    Upload: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    Spinner: ({className="w-5 h-5"}) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Refresh: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    MapPin: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Lock: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    CheckCircle: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    PowerOff: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" /></svg>,
    Key: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    Box: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    User: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    History: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    AlertTriangle: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    FileText: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Package: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Clock: ({className="w-5 h-5"}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export const TableSkeleton = () => (
    <div className="animate-pulse w-full">
        {[1,2,3].map(i => (
            <div key={i} className="h-[90px] border-b border-slate-100 flex items-center px-8 gap-6 last:border-0">
                <div className="h-14 w-14 bg-slate-100 rounded-xl shrink-0"></div>
                <div className="flex flex-col gap-2 w-1/3">
                    <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-lg ml-auto mr-12"></div>
                <div className="flex gap-2">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
                    <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
                </div>
            </div>
        ))}
    </div>
);

export const CardsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full animate-pulse mt-6">
        {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="aspect-square rounded-[24px] bg-slate-100 border border-slate-200 flex flex-col justify-end p-6">
                <div className="h-3 w-1/3 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 w-1/2 bg-slate-200 rounded mb-2"></div>
                <div className="w-12 h-6 bg-slate-200 rounded-full mt-2"></div>
            </div>
        ))}
    </div>
);

export const FormSkeleton = () => (
    <div className="animate-pulse space-y-6 max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-14 bg-slate-100 rounded-xl"></div>
            <div className="h-14 bg-slate-100 rounded-xl"></div>
            <div className="h-14 bg-slate-100 rounded-xl"></div>
            <div className="h-14 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 pt-6 border-t border-slate-100">
            <div className="md:col-span-2 h-14 bg-slate-100 rounded-xl"></div>
            <div className="md:col-span-3 h-14 bg-slate-100 rounded-xl"></div>
            <div className="md:col-span-1 h-14 bg-slate-100 rounded-xl"></div>
            <div className="md:col-span-3 h-14 bg-slate-100 rounded-xl"></div>
            <div className="md:col-span-2 h-14 bg-slate-100 rounded-xl"></div>
            <div className="md:col-span-1 h-14 bg-slate-100 rounded-xl"></div>
        </div>
    </div>
);

export const screenTransition = {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
    transition: { type: "spring", stiffness: 300, damping: 25 }
};

export const SuccessOverlay = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-[32px] p-10 max-w-md w-full text-center shadow-2xl flex flex-col items-center relative overflow-hidden">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6"><CarriersIcons.CheckCircle className="w-10 h-10" /></div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Conectado com Sucesso!</h2>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">A sua loja virtual já está sincronizada e autorizada a realizar cotações automatizadas.</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.2, ease: "linear" }} className="h-full bg-emerald-500" /></div>
        </motion.div>
    </motion.div>
);

export const Pagination = ({ currentPage, lastPage, onPageChange }) => {
    if (lastPage <= 1) return null;

    const pages = [];
    for (let i = 1; i <= lastPage; i++) {
        if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            pages.push('...');
        }
    }
    
    // Remove duplicate dots
    const visiblePages = pages.filter((p, index) => {
        return p !== '...' || pages[index - 1] !== '...';
    });

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
            >
                <CarriersIcons.ArrowLeft className="w-4 h-4" />
            </button>
            
            {visiblePages.map((p, i) => (
                p === '...' ? (
                    <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold">...</span>
                ) : (
                    <button 
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${p === currentPage ? 'bg-blue-600 text-white border border-blue-600' : 'bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200'}`}
                    >
                        {p}
                    </button>
                )
            ))}

            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === lastPage}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm rotate-180"
            >
                <CarriersIcons.ArrowLeft className="w-4 h-4" />
            </button>
        </div>
    );
};
