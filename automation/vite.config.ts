import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    root: path.resolve(__dirname, 'src/renderer'),
    build: {
        outDir: path.resolve(__dirname, 'dist'),
    },
    server: {
        port: 5180,
        watch: {
            // Ignore data folder to prevent HMR reloads when browser writes profile data
            ignored: [
                '**/data/**',
                '**/node_modules/**',
                '**/.git/**',
            ],
        },
    },
});
