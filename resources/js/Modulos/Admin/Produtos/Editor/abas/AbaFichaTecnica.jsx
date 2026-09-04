import React from 'react';
import { ProductSpecificationForm } from '../../../Products/ProductSpecificationForm';

export default function AbaFichaTecnica({ p, setP }) {
  return <ProductSpecificationForm product={p} onChange={setP} />;
}
