import React, { useState } from 'react';
import { CircleAlert, FileImage, Images, ImagePlus, Play, Trash2, Upload, Video } from 'lucide-react';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4'];
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 12 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 10;

const revokePreview = (value) => {
  if (typeof value === 'string' && value.startsWith('blob:')) URL.revokeObjectURL(value);
};

const imageError = (file) => {
  if (!IMAGE_TYPES.includes(file.type)) return 'Use apenas imagens JPG, PNG ou WEBP.';
  if (file.size > MAX_IMAGE_BYTES) return 'Cada imagem deve ter no máximo 4 MB.';
  return '';
};

const videoError = (file) => {
  if (!VIDEO_TYPES.includes(file.type)) return 'Use um vídeo MP4.';
  if (file.size > MAX_VIDEO_BYTES) return 'O vídeo deve ter no máximo 12 MB.';
  return '';
};

const MediaCard = ({ icon: Icon, title, description, children }) => <section className="hub-surface hub-product-media-card">
  <header>
    <span className="hub-orders-metric-icon"><Icon aria-hidden="true" size={18} /></span>
    <div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
  </header>
  {children}
</section>;

const UploadControl = ({ accept, multiple = false, onSelect, children }) => {
  const handleChange = (event) => {
    const files = Array.from(event.currentTarget.files || []);
    onSelect(files);
    event.currentTarget.value = '';
  };

  return <label className="hub-product-media-upload">
    <Upload aria-hidden="true" size={16} />
    <span>{children}</span>
    <input type="file" accept={accept} multiple={multiple} onChange={handleChange} />
  </label>;
};

const EmptyPreview = ({ icon: Icon, text }) => <div className="hub-product-media-empty">
  <Icon aria-hidden="true" size={30} />
  <span>{text}</span>
</div>;

export const ProductMediaForm = ({ product, onChange }) => {
  const [notice, setNotice] = useState(null);
  const gallery = product.galeria || [];
  const galleryObjects = product.galeriaObjects || [];
  const galleryCount = gallery.length + galleryObjects.length;
  const set = (changes) => onChange((current) => ({ ...current, ...changes }));

  const chooseImage = ([file]) => {
    if (!file) return;
    const error = imageError(file);
    if (error) {
      setNotice({ tone: 'error', text: error });
      return;
    }

    revokePreview(product.img);
    set({ imgObject: file, img: URL.createObjectURL(file) });
    setNotice({ tone: 'success', text: 'Nova imagem selecionada. Salve o produto para publicá-la.' });
  };

  const chooseVideo = ([file]) => {
    if (!file) return;
    const error = videoError(file);
    if (error) {
      setNotice({ tone: 'error', text: error });
      return;
    }

    revokePreview(product.video);
    set({ videoObject: file, video: URL.createObjectURL(file) });
    setNotice({ tone: 'success', text: 'Novo vídeo selecionado. Salve o produto para publicá-lo.' });
  };

  const chooseGallery = (files) => {
    const slots = MAX_GALLERY_IMAGES - galleryCount;
    if (slots <= 0) {
      setNotice({ tone: 'error', text: 'A galeria já atingiu o limite de 10 imagens.' });
      return;
    }

    const validFiles = files.filter((file) => !imageError(file)).slice(0, slots);
    const hasInvalidFile = files.some((file) => Boolean(imageError(file)));
    const hasExcess = files.length > validFiles.length;

    if (!validFiles.length) {
      setNotice({ tone: 'error', text: 'Nenhuma imagem foi adicionada. Use JPG, PNG ou WEBP de até 4 MB.' });
      return;
    }

    set({ galeriaObjects: [...galleryObjects, ...validFiles.map((file) => ({ file, url: URL.createObjectURL(file) }))] });
    setNotice({
      tone: hasInvalidFile || hasExcess ? 'error' : 'success',
      text: hasInvalidFile || hasExcess
        ? 'As imagens compatíveis foram adicionadas. Verifique o formato, o tamanho e o limite de 10 itens.'
        : 'Imagens adicionadas à galeria. Salve o produto para publicá-las.',
    });
  };

  const removeSavedGalleryImage = (index) => {
    set({ galeria: gallery.filter((_, itemIndex) => itemIndex !== index) });
    setNotice({ tone: 'success', text: 'A imagem será removida da galeria ao salvar o produto.' });
  };

  const removeNewGalleryImage = (index) => {
    const item = galleryObjects[index];
    revokePreview(item?.url);
    set({ galeriaObjects: galleryObjects.filter((_, itemIndex) => itemIndex !== index) });
    setNotice({ tone: 'success', text: 'A imagem pendente foi removida.' });
  };

  return <div className="hub-product-media-layout">
    {notice ? <p className="hub-product-media-notice" data-tone={notice.tone} role={notice.tone === 'error' ? 'alert' : 'status'}>
      {notice.tone === 'error' ? <CircleAlert aria-hidden="true" size={17} /> : <Upload aria-hidden="true" size={17} />}
      {notice.text}
    </p> : null}

    <MediaCard icon={ImagePlus} title="Imagem principal" description="JPG, PNG ou WEBP de até 4 MB.">
      <div className="hub-product-media-row">
        <div className="hub-product-media-preview">
          {product.img ? <img src={product.img} alt="Imagem principal atual do produto" /> : <EmptyPreview icon={FileImage} text="Nenhuma imagem selecionada" />}
        </div>
        <div className="hub-product-media-actions">
          <p>Selecione a imagem que será exibida como principal na vitrine. A alteração só é publicada ao salvar o produto.</p>
          <UploadControl accept="image/jpeg,image/png,image/webp" onSelect={chooseImage}>{product.img ? 'Substituir imagem' : 'Selecionar imagem'}</UploadControl>
          <small>A API atual permite substituir o arquivo; a remoção definitiva requer um contrato específico.</small>
        </div>
      </div>
    </MediaCard>

    <MediaCard icon={Video} title="Vídeo principal" description="MP4 de até 12 MB.">
      <div className="hub-product-media-row">
        <div className="hub-product-media-preview" data-video="true">
          {product.video ? <video src={product.video} controls preload="metadata">Seu navegador não suporta a reprodução de vídeo.</video> : <EmptyPreview icon={Play} text="Nenhum vídeo selecionado" />}
        </div>
        <div className="hub-product-media-actions">
          <p>Um vídeo pode complementar a apresentação do produto na vitrine quando a loja o utilizar.</p>
          <UploadControl accept="video/mp4" onSelect={chooseVideo}>{product.video ? 'Substituir vídeo' : 'Selecionar vídeo'}</UploadControl>
          <small>A API atual permite substituir o arquivo; a remoção definitiva requer um contrato específico.</small>
        </div>
      </div>
    </MediaCard>

    <MediaCard icon={Images} title="Galeria" description={`Imagens secundárias do produto (${galleryCount}/${MAX_GALLERY_IMAGES}).`}>
      <div className="hub-product-media-gallery-header">
        <p>Adicione apenas imagens reais do produto. Cada arquivo deve ser JPG, PNG ou WEBP de até 4 MB.</p>
        <UploadControl accept="image/jpeg,image/png,image/webp" multiple onSelect={chooseGallery}>Adicionar imagens</UploadControl>
      </div>
      <div className="hub-product-media-gallery">
        {gallery.map((url, index) => <article className="hub-product-media-gallery-item" key={`saved-${url}-${index}`}>
          <img src={url} alt={`Imagem ${index + 1} da galeria`} />
          <button type="button" className="hub-product-media-remove" onClick={() => removeSavedGalleryImage(index)} aria-label={`Remover imagem ${index + 1} da galeria`}><Trash2 aria-hidden="true" size={16} /></button>
        </article>)}
        {galleryObjects.map((item, index) => <article className="hub-product-media-gallery-item" key={`new-${item.url}`}>
          <img src={item.url} alt={`Nova imagem ${gallery.length + index + 1} da galeria`} />
          <span className="hub-product-media-pending">Pendente</span>
          <button type="button" className="hub-product-media-remove" onClick={() => removeNewGalleryImage(index)} aria-label={`Remover nova imagem ${gallery.length + index + 1} da galeria`}><Trash2 aria-hidden="true" size={16} /></button>
        </article>)}
        {!galleryCount ? <div className="hub-product-media-gallery-empty"><Images aria-hidden="true" size={26} /><span>Sem imagens adicionais</span></div> : null}
      </div>
    </MediaCard>
  </div>;
};
