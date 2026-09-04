import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleAlert, Package, Save, ShieldCheck } from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import AbaFiscal from '../Produtos/Editor/abas/AbaFiscal';
import AbaFichaTecnica from '../Produtos/Editor/abas/AbaFichaTecnica';
import AbaLogistica from '../Produtos/Editor/abas/AbaLogistica';
import AbaMidia from '../Produtos/Editor/abas/AbaMidia';
import AbaSeo from '../Produtos/Editor/abas/AbaSeo';
import AbaEstoque from '../Produtos/Editor/abas/AbaEstoque';
import AbaVariaveis from '../Produtos/Editor/abas/AbaVariaveis';
import { toProductEditorModel } from '../Produtos/produtoContract';
import { saveProduct, validateProductSkus } from './catalogApi';
import { ProductGeneralForm } from './ProductGeneralForm';
import { errorMessage, productStatus } from './catalogUtils';

const tabs = [
  { value: 'GERAL', label: 'Geral' },
  { value: 'FICHA', label: 'Ficha técnica' },
  { value: 'ESTOQUE', label: 'Estoque' },
  { value: 'MIDIA', label: 'Mídia' },
  { value: 'VARIACOES', label: 'Variações' },
  { value: 'FISCAL', label: 'Fiscal' },
  { value: 'LOGISTICA', label: 'Logística' },
  { value: 'SEO', label: 'SEO' },
];

const validationMessage = (error) => {
  const messages = error?.response?.data?.errors;
  if (!messages) return errorMessage(error, 'Não foi possível salvar o produto.');
  const first = Object.values(messages).flat()[0];
  return first || errorMessage(error, 'Não foi possível salvar o produto.');
};

export const ProductEditor = ({ productOriginal, categories, onBack, onSuccess }) => {
  const [product, setProduct] = useState(productOriginal);
  const [tab, setTab] = useState('GERAL');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const hasChanges = useMemo(() => JSON.stringify(product) !== JSON.stringify(productOriginal), [product, productOriginal]);
  const status = productStatus({ status_vitrine: product.status, controlar_estoque: product.controlarEstoque, quantidade_estoque: product.estoque, alerta_estoque: product.alertaEstoque, pre_venda: product.preVenda });

  const back = () => {
    if (!hasChanges || window.confirm('Existem alterações não salvas. Deseja sair mesmo assim?')) onBack();
  };

  const submit = async () => {
    const nextErrors = {};
    if (!String(product.nome || '').trim()) nextErrors.nome = true;
    if (!product.categoriaPrincipal) nextErrors.categoriaPrincipal = true;
    if (!Number(product.preco) || Number(product.preco) <= 0) nextErrors.preco = true;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setTab('GERAL');
      setNotice({ tone: 'error', text: 'Preencha os campos obrigatórios antes de salvar.' });
      return;
    }

    const category = categories.find((item) => item.nome === product.categoriaPrincipal);
    if (!category) {
      setTab('GERAL');
      setNotice({ tone: 'error', text: 'Selecione uma categoria válida desta loja.' });
      return;
    }

    const itemSku = [product.skuRef, product.skuSufixo].filter(Boolean).join('-');
    const variationSkus = (product.variaveis || []).map((item) => item.sku).filter(Boolean);
    try {
      setSaving(true);
      setNotice({ tone: 'loading', text: 'Validando dados do produto...' });
      const validation = itemSku || variationSkus.length ? await validateProductSkus({
        skus: [itemSku, ...variationSkus].filter(Boolean),
        ignore_product_id: product.id || null,
      }) : null;
      if (validation?.duplicados?.length) {
        setNotice({ tone: 'error', text: 'SKU já utilizado: ' + validation.duplicados.join(', ') + '.' });
        return;
      }

      setNotice({ tone: 'loading', text: 'Salvando produto...' });
      const response = await saveProduct({ product, categoryId: category.id });
      const saved = response.data?.data ?? response.data;
      setProduct(toProductEditorModel(saved));
      setNotice({ tone: 'success', text: response.data?.message || 'Produto salvo e catálogo atualizado.' });
      await onSuccess();
    } catch (error) {
      setNotice({ tone: 'error', text: validationMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const content = {
    GERAL: <ProductGeneralForm product={product} categories={categories} errors={errors} onChange={setProduct} />,
    FICHA: <AbaFichaTecnica p={product} setP={setProduct} />,
    ESTOQUE: <AbaEstoque p={product} setP={setProduct} />,
    MIDIA: <AbaMidia p={product} setP={setProduct} />,
    VARIACOES: <AbaVariaveis p={product} setP={setProduct} />,
    FISCAL: <AbaFiscal p={product} setP={setProduct} />,
    LOGISTICA: <AbaLogistica p={product} setP={setProduct} />,
    SEO: <AbaSeo p={product} setP={setProduct} />,
  };

  return <section className="hub-catalog-editor">
    <header className="hub-catalog-editor-header">
      <div className="hub-catalog-editor-title"><IconButton icon={ArrowLeft} label="Voltar para produtos" onClick={back} /><div><p className="hub-page-eyebrow">Catálogo</p><h1>{product.isNovo ? 'Novo produto' : 'Editar produto'}</h1><span><Badge variant={status.variant}>{status.label}</Badge>{hasChanges ? <Badge variant="warning">Alterações não salvas</Badge> : null}</span></div></div>
      <div className="hub-catalog-actions"><Button variant="secondary" onClick={back}>Cancelar</Button><Button icon={Save} loading={saving} onClick={submit}>Salvar produto</Button></div>
    </header>
    {notice ? <p className="hub-catalog-editor-notice" data-tone={notice.tone} role={notice.tone === 'error' ? 'alert' : 'status'}>{notice.tone === 'success' ? <CheckCircle2 aria-hidden="true" size={17} /> : notice.tone === 'error' ? <CircleAlert aria-hidden="true" size={17} /> : <Package aria-hidden="true" size={17} />}{notice.text}</p> : null}
    <nav className="hub-catalog-editor-tabs" aria-label="Seções do editor de produto">{tabs.map((item) => <button type="button" key={item.value} data-active={tab === item.value} onClick={() => setTab(item.value)}>{item.label}</button>)}</nav>
    <div className="hub-catalog-editor-content">{content[tab]}</div>
    <footer className="hub-catalog-editor-footer"><div><ShieldCheck aria-hidden="true" size={17} /><span>Os dados são validados pela API da loja antes da gravação.</span></div><div className="hub-catalog-actions"><Button variant="secondary" onClick={back}>Cancelar</Button><Button icon={Save} loading={saving} onClick={submit}>Salvar produto</Button></div></footer>
  </section>;
};
