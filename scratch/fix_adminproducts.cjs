const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'resources', 'js', 'Modulos', 'Admin', 'AdminProducts.jsx');

let content = fs.readFileSync(file, 'utf8');

const target = `                                                    <button type="button" onClick={() => {
                                                        <option value="">Nenhuma</option>
                                                        {categorias.filter(c => c.nome !== produtoEmEdicao.categoriaPrincipal).map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                                                    </select>`;

const replacement = `                                                    <button type="button" onClick={() => {
                                                        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
                                                        setErrosForm(prev => ({...prev, skuRef: null}));
                                                        setProdutoEmEdicao(p => ({ ...p, skuRef: \`HUB-\${randomStr}\` }));
                                                    }} className="px-5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors border-l border-slate-100 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center min-w-[80px]" aria-label="Gerar SKU Automático">
                                                        Gerar
                                                    </button>
                                                </div>
                                                {errosForm.skuRef && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1"><Icons.AlertTriangle className="w-3 h-3"/> {errosForm.skuRef}</p>}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-6">
                                            <h3 className="text-sm font-black text-slate-800 mb-6">Organização e Preços</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                <div className="group">
                                                    <label htmlFor="prod-cat" className={\`text-[13px] font-bold block mb-2 transition-colors \${errosForm.categoriaPrincipal ? 'text-red-500' : 'text-slate-500 group-focus-within:text-blue-600'}\`}>Categoria Principal</label>
                                                    <select id="prod-cat" value={produtoEmEdicao.categoriaPrincipal} onChange={e => setProdutoEmEdicao({ ...produtoEmEdicao, categoriaPrincipal: e.target.value })} className={\`w-full bg-white border rounded-xl px-5 py-4 text-sm outline-none cursor-pointer focus:ring-4 font-bold text-slate-800 transition-all shadow-sm appearance-none \${errosForm.categoriaPrincipal ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'}\`}>
                                                        <option value="">Selecione...</option>
                                                        {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                                                    </select>
                                                </div>
                                                <div className="group">
                                                    <label htmlFor="prod-sub1" className="text-[13px] font-bold text-slate-500 group-focus-within:text-blue-600 block mb-2 transition-colors">Subcategoria 1</label>
                                                    <select id="prod-sub1" value={produtoEmEdicao.categoriasSecundarias?.[0] || ''} onChange={e => {
                                                        const newSec = [...(produtoEmEdicao.categoriasSecundarias || [])];
                                                        if (e.target.value) newSec[0] = e.target.value; else newSec.splice(0, 1);
                                                        setProdutoEmEdicao({ ...produtoEmEdicao, categoriasSecundarias: newSec });
                                                    }} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm outline-none cursor-pointer focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800 transition-all shadow-sm appearance-none">
                                                        <option value="">Nenhuma</option>
                                                        {categorias.filter(c => c.nome !== produtoEmEdicao.categoriaPrincipal).map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                                                    </select>`;

if (content.indexOf(target) !== -1) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed!");
} else {
    console.log("Target not found!");
    // check with regex ignoring whitespace
    const targetRegex = /<button type="button" onClick=\{\(\) => \{\s*<option value="">Nenhuma<\/option>\s*\{categorias\.filter\(c => c\.nome !== produtoEmEdicao\.categoriaPrincipal\)\.map\(c => <option key=\{c\.id\} value=\{c\.nome\}>\{c\.nome\}<\/option>\)\}\s*<\/select>/g;
    
    if (targetRegex.test(content)) {
        content = content.replace(targetRegex, replacement);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Fixed with Regex!");
    } else {
        console.log("Not found with Regex either.");
    }
}
