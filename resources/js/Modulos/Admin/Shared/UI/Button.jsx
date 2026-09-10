import React from 'react';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    icon: Icon, 
    className = '', 
    disabled = false,
    ...props 
}) => {
    
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/30",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
        danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/30",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
    };

    const classes = `
        inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
    `;

    return (
        <button className={classes} disabled={disabled} {...props}>
            {Icon && <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />}
            {children}
        </button>
    );
};

export default Button;