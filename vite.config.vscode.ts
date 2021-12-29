import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { getThemeVariables } from 'ant-design-vue/dist/theme';

export default defineConfig(({ mode }) => ({
    plugins: [
        vue(),
        Components({
            resolvers: [AntDesignVueResolver({ importStyle: 'less' })],
            directoryAsNamespace: true,
        }),
    ],
    build: {
        outDir: '../../dist/snapshop',
        emptyOutDir: true,
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
        watch: mode === 'development' ? {} : null,
    },
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: getThemeVariables({
                    dark: true, // 开启暗黑模式
                }),
                javascriptEnabled: true,
            },
        },
    },
}));
