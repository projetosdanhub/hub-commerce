import React from 'react';
import { ProductVariantsForm } from '../../../Products/ProductVariantsForm';

export default function AbaVariaveis({ p, setP }) {
  return <ProductVariantsForm product={p} onChange={setP} />;
}
