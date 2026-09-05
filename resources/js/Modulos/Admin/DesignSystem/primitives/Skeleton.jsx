import React from 'react';

export const Skeleton = ({ className = '', label = 'Carregando conteúdo' }) => (
  <span className={`hub-skeleton ${className}`} role="status" aria-label={label} />
);
