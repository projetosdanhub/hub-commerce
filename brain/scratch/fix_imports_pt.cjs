const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', '..', 'resources', 'js', 'Modulos', 'Admin');
const newProductsDir = path.join(adminDir, 'Produtos');

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

replaceInFile(path.join(newProductsDir, 'Painel/DashboardCatalogo.jsx'), [
    ['../shared/Shared', '../Compartilhado/ComponentesUI']
]);

replaceInFile(path.join(newProductsDir, 'Lista/ListaDeProdutos.jsx'), [
    ['../shared/Shared', '../Compartilhado/ComponentesUI']
]);

replaceInFile(path.join(newProductsDir, 'Editor/EditorDeProduto.jsx'), [
    ['../../../../../api', '../../../../api']
]);

console.log('Fixes applied');
