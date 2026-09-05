import React from 'react';
import { ProductLogisticsForm } from '../../../Products/ProductLogisticsForm';

export default function AbaLogistica({ p, setP }) {
  return <ProductLogisticsForm product={p} onChange={setP} />;
}
