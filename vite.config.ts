import { defineConfig } from 'vite-plus';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
    lint: { options: { typeAware: true, typeCheck: true } },
    plugins: [vue()],
});
