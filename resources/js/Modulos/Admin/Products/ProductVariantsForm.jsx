import React, { useId } from 'react';
import { Image, Layers3, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';

const blankVariation = () => ({
  id: null,
  tipo: '',
  nome: '',
  sku: '',
  estoque: '',
  img: null,
  imgObject: null,
});

export const ProductVariantsForm = ({ product, onChange }) => {
  const uploadId = useId();
  const variations = product.variaveis || [];

  const updateVariations = (next) => onChange({ ...product, variaveis: next });
  const updateVariation = (index, field, value) => updateVariations(variations.map((variation, current) => (
    current === index ? { ...variation, [field]: value } : variation
  )));

  const addVariation = () => updateVariations([...variations, blankVariation()]);

  const removeVariation = (index) => {
    const removed = variations[index];
    if (String(removed?.img || '').startsWith('blob:')) URL.revokeObjectURL(removed.img);
    updateVariations(variations.filter((_, current) => current !== index));
  };

  const selectImage = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const current = variations[index];
    if (String(current?.img || '').startsWith('blob:')) URL.revokeObjectURL(current.img);
    const previewUrl = URL.createObjectURL(file);
    updateVariations(variations.map((variation, currentIndex) => (
      currentIndex === index ? { ...variation, img: previewUrl, imgObject: file } : variation
    )));
  };

  return (
    <div className="hub-product-form-stack">
      <section className="hub-surface hub-product-form-card">
        <header className="hub-product-form-header">
          <div>
            <span className="hub-product-form-icon"><Layers3 aria-hidden="true" size={19} /></span>
            <div>
              <h2>Variações</h2>
              <p>Cadastre cada opção real do produto manualmente. O preço é definido na aba Geral.</p>
            </div>
          </div>
          <Button icon={Plus} onClick={addVariation}>Adicionar variação</Button>
        </header>

        {!variations.length ? (
          <div className="hub-product-form-empty">
            <Layers3 aria-hidden="true" size={28} />
            <strong>Este produto não possui variações</strong>
            <span>Adicione uma opção somente quando ela existir no catálogo da loja.</span>
          </div>
        ) : (
          <div className="hub-variation-list">
            {variations.map((variation, index) => (
              <article className="hub-variation-row" key={variation.id || `new-${index}`}>
                <label className="hub-variation-image-control" htmlFor={`${uploadId}-${index}`}>
                  {variation.img ? <img src={variation.img} alt={variation.nome ? `Imagem da variação ${variation.nome}` : 'Imagem da variação'} /> : <Image aria-hidden="true" size={20} />}
                  <span><Upload aria-hidden="true" size={14} /> Imagem</span>
                  <input id={`${uploadId}-${index}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage(index, event)} />
                </label>

                <label>
                  <span>Grupo</span>
                  <input type="text" value={variation.tipo ?? ''} onChange={(event) => updateVariation(index, 'tipo', event.target.value)} />
                </label>

                <label>
                  <span>Opção <b aria-hidden="true">*</b></span>
                  <input type="text" value={variation.nome ?? ''} onChange={(event) => updateVariation(index, 'nome', event.target.value)} />
                </label>

                <label>
                  <span>SKU</span>
                  <input className="hub-product-code-input" type="text" value={variation.sku ?? ''} onChange={(event) => updateVariation(index, 'sku', event.target.value.toUpperCase())} />
                </label>

                <label>
                  <span>Estoque <b aria-hidden="true">*</b></span>
                  <input type="number" min="0" step="1" inputMode="numeric" value={variation.estoque ?? ''} onChange={(event) => updateVariation(index, 'estoque', event.target.value)} />
                </label>

                <IconButton icon={Trash2} variant="danger" label={variation.nome ? `Remover variação ${variation.nome}` : 'Remover variação'} onClick={() => removeVariation(index)} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
