import React from 'react';

const Table = ({ headers, children, emptyState }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-y border-slate-100">
                        {headers.map((header, index) => (
                            <th key={index} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {children ? children : emptyState && (
                        <tr>
                            <td colSpan={headers.length} className="px-6 py-12 text-center">
                                {emptyState}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export const TableRow = ({ children, className = '' }) => (
    <tr className={`hover:bg-slate-50/50 transition-colors ${className}`}>
        {children}
    </tr>
);

export const TableCell = ({ children, className = '' }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-slate-600 ${className}`}>
        {children}
    </td>
);

export default Table;
