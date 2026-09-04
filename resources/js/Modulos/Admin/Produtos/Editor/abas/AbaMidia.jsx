import React from 'react';
import { ProductMediaForm } from '../../../Products/ProductMediaForm';

export default function AbaMidia({ p, setP }) {
  return <ProductMediaForm product={p} onChange={setP} />;
}
