import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'; // 1. Importação do plugin adicionada aqui

export default defineConfig({
    plugins: [
        laravel({
            // 2. Extensão alterada de app.js para app.jsx
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(), // 3. Plugin do React ativado aqui
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});