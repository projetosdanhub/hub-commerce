import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaFiscal({ p, setP }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Classificação Fiscal</h3>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group/input">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">NCM *</label>
                                <input 
                                    type="text" 
                                    placeholder="0000.00.00"
                                    value={p.ncm || ''} 
                                    onChange={e => setP({...p, ncm: e.target.value.replace(/\\D/g, '')})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                            <div className="group/input">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">CEST</label>
                                <input 
                                    type="text" 
                                    placeholder="Opcional"
                                    value={p.cest || ''} 
                                    onChange={e => setP({...p, cest: e.target.value.replace(/\\D/g, '')})} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">GTIN/EAN (Código de Barras)</label>
                            <input 
                                type="text" 
                                placeholder="EAN-13, EAN-8, UPCE..."
                                value={p.gtin || ''} 
                                onChange={e => setP({...p, gtin: e.target.value.replace(/\\D/g, '')})} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>

                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Origem da Mercadoria *</label>
                            <select 
                                value={p.origem || '0'} 
                                onChange={e => setP({...p, origem: e.target.value})} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            >
                                <option value="0">0 - Nacional</option>
                                <option value="1">1 - Estrangeira (Importação Direta)</option>
                                <option value="2">2 - Estrangeira (Mercado Interno)</option>
                                <option value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%</option>
                                <option value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos</option>
                                <option value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</option>
                                <option value="6">6 - Estrangeira (Importação Direta, sem similar nacional, CAMEX)</option>
                                <option value="7">7 - Estrangeira (Mercado Interno, sem similar nacional, CAMEX)</option>
                                <option value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Tributação (ICMS Padrão)</h3>
                    
                    <div className="space-y-4">
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">CST / CSOSN Padrão</label>
                            <select 
                                value={p.cst || '102'} 
                                onChange={e => setP({...p, cst: e.target.value})} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            >
                                <option value="101">101 - Tributada pelo Simples Nacional com permissão de crédito</option>
                                <option value="102">102 - Tributada pelo Simples Nacional sem permissão de crédito</option>
                                <option value="500">500 - ICMS cobrado anteriormente por substituição tributária (ST)</option>
                                <option value="00">00 - Tributada Integralmente (Regime Normal)</option>
                                <option value="40">40 - Isenta (Regime Normal)</option>
                                <option value="60">60 - ICMS cobrado anteriormente por substituição tributária (Regime Normal)</option>
                            </select>
                        </div>
                        
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">CFOP Padrão (Venda)</label>
                            <input 
                                type="text" 
                                placeholder="Ex: 5102"
                                value={p.cfop || ''} 
                                onChange={e => setP({...p, cfop: e.target.value.replace(/\\D/g, '')})} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                    <Icons.AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-800">Reforma Tributária (IBS/CBS)</h4>
                        <p className="text-xs text-amber-700 mt-1">Esteja preparado para as futuras NFs usando as novas regras do Portal Nacional da NF-e. Consulte sua contabilidade sobre cClassTrib e validações por versão de Nota Técnica.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}