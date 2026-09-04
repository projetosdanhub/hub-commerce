import api from '../../../api';

const unwrap = (response) => response.data?.data ?? response.data;

export const fetchProducts = async (filters) => {
  const response = await api.get('/admin/products', {
    params: {
      page: filters.page,
      per_page: filters.perPage,
      busca: filters.search || undefined,
      categoria: filters.category !== 'TODAS' ? filters.category : undefined,
      status: filters.status !== 'TODOS' ? filters.status : undefined,
    },
  });
  return unwrap(response);
};

export const fetchProductCategories = async () => {
  const response = await api.get('/admin/categories');
  return unwrap(response);
};

export const fetchProductAudits = async () => {
  const response = await api.get('/admin/products/audits');
  return unwrap(response);
};

export const validateProductSkus = async (payload) => unwrap(await api.post('/admin/products/validate-skus', payload));

const append = (body, key, value) => {
  if (value !== undefined && value !== null) body.append(key, value);
};

export const saveProduct = async ({ product, categoryId }) => {
  const body = new FormData();
  append(body, 'id', product.id || '');
  append(body, 'nome', product.nome || '');
  append(body, 'categoria_id', categoryId);
  append(body, 'descricao', product.descricao || '');
  append(body, 'preco', Number(product.preco));
  append(body, 'preco_promo', product.precoPromo === '' || product.precoPromo === undefined ? '' : product.precoPromo);
  append(body, 'quantidade_estoque', Number.isFinite(Number(product.estoque)) ? Number(product.estoque) : 0);
  append(body, 'status_vitrine', product.status || 'INATIVO');
  append(body, 'sku_ref', product.skuRef || '');
  append(body, 'sku_sufixo', product.skuSufixo || '');
  append(body, 'slug', product.slug || '');
  append(body, 'controlar_estoque', product.controlarEstoque ? '1' : '0');
  append(body, 'alerta_estoque', product.alertaEstoque || 0);
  append(body, 'alerta_moderado', product.alertaModerado || 0);
  append(body, 'alerta_alto', product.alertaAlto || 0);
  append(body, 'pre_venda', product.preVenda ? '1' : '0');
  append(body, 'ficha_tecnica', JSON.stringify(product.fichaTecnica || []));
  append(body, 'badges', JSON.stringify(product.badges || []));
  append(body, 'categorias_secundarias', JSON.stringify(product.categoriasSecundarias || []));
  append(body, 'ncm', product.ncm || '');
  append(body, 'cest', product.cest || '');
  append(body, 'gtin', product.gtin || '');
  append(body, 'origem', product.origem || '');
  append(body, 'csosn', product.csosn || product.cst || '');
  append(body, 'cst', product.cst || '');
  append(body, 'cfop_dentro', product.cfopDentro || product.cfop || '');
  append(body, 'cfop_fora', product.cfopFora || '');
  append(body, 'unidade_medida', product.unidade || '');
  append(body, 'icms_perc', product.icmsPerc === '' ? '' : product.icmsPerc);
  append(body, 'ipi_perc', product.ipiPerc === '' ? '' : product.ipiPerc);
  append(body, 'peso', product.peso === '' ? '' : product.peso);
  append(body, 'altura', product.altura === '' ? '' : product.altura);
  append(body, 'largura', product.largura === '' ? '' : product.largura);
  append(body, 'comprimento', product.comp === '' ? '' : product.comp);
  append(body, 'agrupavel', product.agrupavel ? '1' : '0');
  append(body, 'meta_title', product.metaTitle || '');
  append(body, 'meta_desc', product.metaDesc || '');

  if (product.imgObject) append(body, 'img', product.imgObject);
  if (product.videoObject) append(body, 'video', product.videoObject);
  (product.galeria || []).filter((url) => !String(url).startsWith('blob:')).forEach((url) => body.append('galeria_urls[]', url));
  (product.galeriaObjects || []).forEach((item, index) => body.append('galeria[' + index + ']', item));

  if ((product.variaveis || []).length) {
    const variations = product.variaveis.map((item) => ({ ...item, img: item.imgObject ? null : item.img || null }));
    append(body, 'variaveis_json', JSON.stringify(variations));
    product.variaveis.forEach((item, index) => {
      if (item.imgObject) body.append('variaveis_img_' + index, item.imgObject);
    });
  }

  return api.post('/admin/products', body, { headers: { 'Content-Type': 'multipart/form-data' } });
};
