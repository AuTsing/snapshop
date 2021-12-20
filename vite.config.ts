import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        target: 'esnext',
        assetsInlineLimit: 100000000,
        chunkSizeWarningLimit: 100000000,
        cssCodeSplit: false,
        reportCompressedSize: false,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                manualChunks: undefined,
            },
        },
    },
});
