import React from 'react';

export const PageHeader = ({ title, description, actions, icon: Icon }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-[24px] md:text-[28px] font-bold text-[var(--hub-text)] leading-[36px] tracking-tight flex items-center gap-2">
          {Icon && (
            <span aria-hidden="true" className="text-[var(--hub-primary)] flex items-center justify-center">
              <Icon size={24} strokeWidth={1.8} />
            </span>
          )}
          {title}
        </h1>
        {description && (
          <p className="text-[14px] text-[var(--hub-text-secondary)] mt-1 max-w-3xl leading-[21px]">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};
