import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ title, description, action, className = '' }) => (
    <div className={`px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
        <div>
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

export const CardContent = ({ children, className = '', noPadding = false }) => (
    <div className={`${noPadding ? '' : 'p-6'} ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3 ${className}`}>
        {children}
    </div>
);

export default Card;