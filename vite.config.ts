import { defineConfig } from 'vite-plus';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import { getThemeVariables } from 'ant-design-vue/dist/theme';

export default defineConfig({
    staged: {
        '*': 'vp check --fix',
    },
    lint: { options: { typeAware: true, typeCheck: true } },
    plugins: [
        vue(),
        Components({
            resolvers: [AntDesignVueResolver({ importStyle: 'less' })],
        }),
    ],
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
    css: {
        preprocessorOptions: {
            less: {
                modifyVars: getThemeVariables({
                    dark: true,
                }),
                javascriptEnabled: true,
            },
        },
    },
});
