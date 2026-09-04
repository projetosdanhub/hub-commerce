import React from 'react';
import { ProductGeneralForm } from '../../../Products/ProductGeneralForm';

export default function AbaGeral({ p, setP, erros, setErros, categorias }) {
  return <ProductGeneralForm
    product={p}
    categories={categorias}
    errors={erros}
    onChange={setP}
    onClearError={(field) => setErros((current) => ({ ...current, [field]: false }))}
  />;
}
