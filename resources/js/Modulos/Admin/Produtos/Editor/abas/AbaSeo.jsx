import React from 'react';
import { ProductSeoForm } from '../../../Products/ProductSeoForm';

export default function AbaSeo({ p, setP }) {
  return <ProductSeoForm product={p} onChange={setP} />;
}
