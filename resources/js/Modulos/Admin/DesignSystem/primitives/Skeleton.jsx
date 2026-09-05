import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <span className={`hub-skeleton ${className}`} aria-hidden="true" />
);
