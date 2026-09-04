import React from 'react';
import { ProductInventoryForm } from '../../../Products/ProductInventoryForm';

export default function AbaEstoque({ p, setP }) {
  return <ProductInventoryForm product={p} onChange={setP} />;
}
