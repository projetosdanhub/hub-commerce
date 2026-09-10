import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from './Button';

export const FilterButton = ({
  activeCount = 0,
  children = 'Filtros',
  ...props
}) => (
  <Button variant="secondary" icon={SlidersHorizontal} {...props}>
    {children}{activeCount ? ` (${activeCount})` : ''}
  </Button>
);
