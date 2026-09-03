import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const sourceRoot = resolve('resources/js');
const sourceExtensions = ['.js', '.jsx', '.ts', '.tsx'];
const importPattern = /\b(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g;

const files = collectSourceFiles(sourceRoot);
const errors = [];

for (const file of files) {
    const source = readFileSync(file, 'utf8');

    for (const match of source.matchAll(importPattern)) {
        const specifier = match[1];

        if (!resolvesFrom(file, specifier)) {
            errors.push(`${relative(process.cwd(), file)} -> ${specifier}`);
        }
    }
}

if (errors.length > 0) {
    console.error('Imports locais não resolvidos:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Imports locais verificados: ${files.length} arquivos.`);
}

function collectSourceFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            return collectSourceFiles(entryPath);
        }

        return sourceExtensions.includes(extname(entry.name)) ? [entryPath] : [];
    });
}

function resolvesFrom(file, specifier) {
    const target = resolve(dirname(file), specifier);
    const candidates = [
        target,
        ...sourceExtensions.map((extension) => `${target}${extension}`),
        ...sourceExtensions.map((extension) => join(target, `index${extension}`)),
    ];

    return candidates.some((candidate) => existsSync(candidate));
}
