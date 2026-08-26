const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', '..', 'resources', 'js', 'Modulos', 'Admin');
const oldProductsDir = path.join(adminDir, 'Products');
const newProductsDir = path.join(adminDir, 'Produtos');

if (fs.existsSync(newProductsDir)) {
    fs.rmSync(newProductsDir, { recursive: true, force: true });
}

fs.renameSync(oldProductsDir, newProductsDir);

const renames = [
    { old: 'shared/Icons.jsx', new: 'Compartilhado/Icones.jsx' },
    { old: 'shared/Shared.jsx', new: 'Compartilhado/ComponentesUI.jsx' },
    { old: 'shared', new: 'Compartilhado' }, // directory
    { old: 'dashboard/CatalogDashboard.jsx', new: 'Painel/DashboardCatalogo.jsx' },
    { old: 'dashboard', new: 'Painel' }, // directory
    { old: 'products/ProductsList.jsx', new: 'Lista/ListaDeProdutos.jsx' },
    { old: 'products', new: 'Lista' }, // directory
    { old: 'editor/ProductEditor.jsx', new: 'Editor/EditorDeProduto.jsx' },
    { old: 'editor/tabs/GeralTab.jsx', new: 'Editor/abas/AbaGeral.jsx' },
    { old: 'editor/tabs/FichaTecnicaTab.jsx', new: 'Editor/abas/AbaFichaTecnica.jsx' },
    { old: 'editor/tabs/EstoqueTab.jsx', new: 'Editor/abas/AbaEstoque.jsx' },
    { old: 'editor/tabs/MidiaTab.jsx', new: 'Editor/abas/AbaMidia.jsx' },
    { old: 'editor/tabs/VariaveisTab.jsx', new: 'Editor/abas/AbaVariaveis.jsx' },
    { old: 'editor/tabs/FiscalTab.jsx', new: 'Editor/abas/AbaFiscal.jsx' },
    { old: 'editor/tabs/LogisticaTab.jsx', new: 'Editor/abas/AbaLogistica.jsx' },
    { old: 'editor/tabs/SeoTab.jsx', new: 'Editor/abas/AbaSeo.jsx' },
    { old: 'editor/tabs', new: 'Editor/abas' }, // directory
    { old: 'editor', new: 'Editor' }, // directory
];

// Perform file renames first, then directory renames
const fileRenames = renames.filter(r => r.old.endsWith('.jsx'));
const dirRenames = renames.filter(r => !r.old.endsWith('.jsx'));

// create new directories
dirRenames.forEach(r => {
    const dir = path.join(newProductsDir, r.new);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// move files
fileRenames.forEach(r => {
    const oldPath = path.join(newProductsDir, r.old);
    const newPath = path.join(newProductsDir, r.new);
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
    }
});

// delete old empty directories
const oldDirs = ['shared', 'dashboard', 'products', 'editor/tabs', 'editor'];
oldDirs.forEach(d => {
    const p = path.join(newProductsDir, d);
    if (fs.existsSync(p)) fs.rmdirSync(p, { recursive: true });
});

// Update imports
function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [search, replace] of replacements) {
        if (content.includes(search)) {
            content = content.split(search).join(replace);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

// AdminProducts.jsx (entry point)
replaceInFile(path.join(adminDir, 'AdminProducts.jsx'), [
    ["import { CustomStyles } from './Products/shared/Shared';", "import { CustomStyles } from './Produtos/Compartilhado/ComponentesUI';"],
    ["import CatalogDashboard from './Products/dashboard/CatalogDashboard';", "import DashboardCatalogo from './Produtos/Painel/DashboardCatalogo';"],
    ["import ProductsList from './Products/products/ProductsList';", "import ListaDeProdutos from './Produtos/Lista/ListaDeProdutos';"],
    ["import ProductEditor from './Products/editor/ProductEditor';", "import EditorDeProduto from './Produtos/Editor/EditorDeProduto';"],
    ["<CatalogDashboard />", "<DashboardCatalogo />"],
    ["<ProductsList onEditProduct={onEditProduct} onCreateProduct={onCreateProduct} />", "<ListaDeProdutos onEditProduct={onEditProduct} onCreateProduct={onCreateProduct} />"],
    ["<ProductEditor", "<EditorDeProduto"],
    ["</ProductEditor>", "</EditorDeProduto>"]
]);

// ListaDeProdutos.jsx
replaceInFile(path.join(newProductsDir, 'Lista/ListaDeProdutos.jsx'), [
    ["import { Icons } from '../shared/Icons';", "import { Icons } from '../Compartilhado/Icones';"],
    ["export default function ProductsList", "export default function ListaDeProdutos"]
]);

// DashboardCatalogo.jsx
replaceInFile(path.join(newProductsDir, 'Painel/DashboardCatalogo.jsx'), [
    ["import { Icons } from '../shared/Icons';", "import { Icons } from '../Compartilhado/Icones';"],
    ["export default function CatalogDashboard", "export default function DashboardCatalogo"]
]);

// ComponentesUI.jsx
replaceInFile(path.join(newProductsDir, 'Compartilhado/ComponentesUI.jsx'), [
    ["import { Icons } from './Icons';", "import { Icons } from './Icones';"]
]);

// EditorDeProduto.jsx
replaceInFile(path.join(newProductsDir, 'Editor/EditorDeProduto.jsx'), [
    ["import { Icons } from '../shared/Icons';", "import { Icons } from '../Compartilhado/Icones';"],
    ["import { PremiumSaveButton, AnimatedNotification } from '../shared/Shared';", "import { PremiumSaveButton, AnimatedNotification } from '../Compartilhado/ComponentesUI';"],
    ["import GeralTab from './tabs/GeralTab';", "import AbaGeral from './abas/AbaGeral';"],
    ["import FichaTecnicaTab from './tabs/FichaTecnicaTab';", "import AbaFichaTecnica from './abas/AbaFichaTecnica';"],
    ["import EstoqueTab from './tabs/EstoqueTab';", "import AbaEstoque from './abas/AbaEstoque';"],
    ["import MidiaTab from './tabs/MidiaTab';", "import AbaMidia from './abas/AbaMidia';"],
    ["import VariaveisTab from './tabs/VariaveisTab';", "import AbaVariaveis from './abas/AbaVariaveis';"],
    ["import FiscalTab from './tabs/FiscalTab';", "import AbaFiscal from './abas/AbaFiscal';"],
    ["import LogisticaTab from './tabs/LogisticaTab';", "import AbaLogistica from './abas/AbaLogistica';"],
    ["import SeoTab from './tabs/SeoTab';", "import AbaSeo from './abas/AbaSeo';"],
    ["export default function ProductEditor", "export default function EditorDeProduto"],
    ["<GeralTab", "<AbaGeral"],
    ["<FichaTecnicaTab", "<AbaFichaTecnica"],
    ["<EstoqueTab", "<AbaEstoque"],
    ["<MidiaTab", "<AbaMidia"],
    ["<VariaveisTab", "<AbaVariaveis"],
    ["<FiscalTab", "<AbaFiscal"],
    ["<LogisticaTab", "<AbaLogistica"],
    ["<SeoTab", "<AbaSeo"]
]);

// Abas (AbaGeral, etc)
replaceInFile(path.join(newProductsDir, 'Editor/abas/AbaGeral.jsx'), [
    ["import { Icons } from '../../shared/Icons';", "import { Icons } from '../../Compartilhado/Icones';"],
    ["export default function GeralTab", "export default function AbaGeral"]
]);

const outrasAbas = ['FichaTecnica', 'Estoque', 'Midia', 'Variaveis', 'Fiscal', 'Logistica', 'Seo'];
outrasAbas.forEach(aba => {
    replaceInFile(path.join(newProductsDir, 'Editor/abas/Aba' + aba + '.jsx'), [
        [aba + 'Tab', 'Aba' + aba]
    ]);
});

console.log('Renaming and syncing complete.');
