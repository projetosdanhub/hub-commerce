import React from 'react';

const Badge = ({ children, variant = 'gray', className = '' }) => {
    
    const variants = {
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        danger: "bg-rose-50 text-rose-700 ring-rose-600/10",
        warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
        info: "bg-blue-50 text-blue-700 ring-blue-600/20",
        gray: "bg-slate-50 text-slate-600 ring-slate-500/10",
        indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    };

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;