import React from 'react';
import { ProductFiscalForm } from '../../../Products/ProductFiscalForm';

export default function AbaFiscal({ p, setP }) {
  return <ProductFiscalForm product={p} onChange={setP} />;
}
