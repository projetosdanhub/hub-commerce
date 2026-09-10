import React, { useId } from 'react';
import { CalendarDays } from 'lucide-react';

export const FilterSelect = ({
  label,
  icon: Icon = CalendarDays,
  className = '',
  children,
  ...props
}) => {
  const id = useId();

  return (
    <div className={`hub-filter-select ${className}`}>
      <Icon aria-hidden="true" size={16} />
      <label className="sr-only" htmlFor={id}>{label}</label>
      <select id={id} aria-label={label} {...props}>{children}</select>
    </div>
  );
};
