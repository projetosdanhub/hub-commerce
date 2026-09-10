import React, { useState } from 'react';
import { ArrowLeft, Building2, Car, MapPin, Save, Truck, Upload } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';

const emptyCarrier = {
  id: null, nome: '', tempo_entrega: '', status: 'ATIVA', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', referencia: '', vehicle_plate: '', vehicle_model: '', vehicle_type: '', file: null, document_cnh_file: null, document_rg_front_file: null, document_rg_back_file: null,
};

const FileField = ({ accept, label, file, onChange }) => (
  <label className="hub-carriers-file">
    <Upload aria-hidden="true" size={16} />
    <span>{label}</span>
    <span className="hub-carriers-file-name">{file?.name || 'Nenhum arquivo selecionado'}</span>
    <input type="file" accept={accept} onChange={(event) => onChange(event.target.files?.[0] || null)} />
  </label>
);

const TextField = ({ label, name, value, onChange, required = false, type = 'text', span, ...props }) => (
  <label className="hub-carriers-field" data-span={span}>
    <span>{label}{required ? ' *' : ''}</span>
    <input type={type} name={name} value={value} onChange={onChange} required={required} {...props} />
  </label>
);

export const CarrierForm = ({ carrier, saving, onCancel, onSave }) => {
  const [form, setForm] = useState(() => (carrier ? { ...emptyCarrier, ...carrier, file: null, document_cnh_file: null, document_rg_front_file: null, document_rg_back_file: null } : emptyCarrier));
  const [error, setError] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateFile = (name) => (value) => setForm((current) => ({ ...current, [name]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.nome.trim() || !form.tempo_entrega.trim()) {
      setError('Informe o nome e o prazo operacional da transportadora.');
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') data.append(key, value);
    });
    if (form.file) data.set('arquivo', form.file);
    if (form.document_cnh_file) data.set('file_cnh', form.document_cnh_file);
    if (form.document_rg_front_file) data.set('file_rg_front', form.document_rg_front_file);
    if (form.document_rg_back_file) data.set('file_rg_back', form.document_rg_back_file);
    onSave(data);
  };

  return (
    <form className="hub-carriers-form" onSubmit={submit}>
      <header>
        <Truck aria-hidden="true" size={22} />
        <div><h2>{form.id ? 'Editar transportadora própria' : 'Nova transportadora própria'}</h2><p>Preencha apenas informações verificáveis da operação de despacho desta loja.</p></div>
      </header>

      <section className="hub-carriers-form-section">
        <h3><Building2 aria-hidden="true" size={18} /> Identificação operacional</h3>
        <div className="hub-carriers-form-grid">
          <TextField label="Nome" name="nome" value={form.nome} onChange={update} required />
          <TextField label="Prazo operacional informado" name="tempo_entrega" value={form.tempo_entrega} onChange={update} required />
          <label className="hub-carriers-field"><span>Status</span><select name="status" value={form.status} onChange={update}><option value="ATIVA">Ativa</option><option value="INATIVA">Inativa</option></select></label>
          <div className="hub-carriers-field"><span>Logo opcional</span><FileField label="Selecionar logo" accept="image/jpeg,image/png,image/svg+xml,image/webp" file={form.file} onChange={updateFile('file')} /></div>
        </div>
      </section>

      <section className="hub-carriers-form-section">
        <h3><MapPin aria-hidden="true" size={18} /> Endereço da operação</h3>
        <div className="hub-carriers-form-grid" data-columns="3">
          <TextField label="CEP" name="cep" value={form.cep} onChange={update} inputMode="numeric" maxLength={8} />
          <TextField label="Logradouro" name="rua" value={form.rua} onChange={update} />
          <TextField label="Número" name="numero" value={form.numero} onChange={update} />
          <TextField label="Complemento" name="complemento" value={form.complemento} onChange={update} />
          <TextField label="Bairro" name="bairro" value={form.bairro} onChange={update} />
          <TextField label="Cidade" name="cidade" value={form.cidade} onChange={update} />
          <TextField label="UF" name="uf" value={form.uf} onChange={update} maxLength={2} />
          <TextField label="Referência" name="referencia" value={form.referencia} onChange={update} span="2" />
        </div>
      </section>

      <section className="hub-carriers-form-section">
        <h3><Car aria-hidden="true" size={18} /> Veículo e documentos opcionais</h3>
        <div className="hub-carriers-form-grid" data-columns="3">
          <TextField label="Placa" name="vehicle_plate" value={form.vehicle_plate} onChange={update} />
          <TextField label="Modelo" name="vehicle_model" value={form.vehicle_model} onChange={update} />
          <label className="hub-carriers-field"><span>Tipo de veículo</span><select name="vehicle_type" value={form.vehicle_type} onChange={update}><option value="">Não informado</option><option value="MOTO">Motocicleta</option><option value="CARRO">Carro</option><option value="VAN">Van</option><option value="CAMINHAO">Caminhão</option></select></label>
          <div className="hub-carriers-field"><span>CNH</span><FileField label="Anexar documento" accept="image/jpeg,image/png,application/pdf" file={form.document_cnh_file} onChange={updateFile('document_cnh_file')} /></div>
          <div className="hub-carriers-field"><span>RG — frente</span><FileField label="Anexar documento" accept="image/jpeg,image/png,application/pdf" file={form.document_rg_front_file} onChange={updateFile('document_rg_front_file')} /></div>
          <div className="hub-carriers-field"><span>RG — verso</span><FileField label="Anexar documento" accept="image/jpeg,image/png,application/pdf" file={form.document_rg_back_file} onChange={updateFile('document_rg_back_file')} /></div>
        </div>
      </section>

      {error ? <p className="hub-carriers-inline-notice" role="alert">{error}</p> : null}
      <footer className="hub-carriers-form-footer"><Button variant="secondary" onClick={onCancel} icon={ArrowLeft}>Voltar</Button><Button type="submit" loading={saving} icon={Save}>{form.id ? 'Salvar alterações' : 'Cadastrar transportadora'}</Button></footer>
    </form>
  );
};
