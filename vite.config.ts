import { defineConfig } from 'vite-plus';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// https://vite.dev/config/
export default defineConfig({
    lint: { options: { typeAware: true, typeCheck: true } },
    plugins: [
        vue(),
        Components({
            resolvers: [AntDesignVueResolver({ importStyle: false })],
        }),
    ],
});
