import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './route/routes';
import { storage } from './plugins/Storage';
import { clipboard } from './plugins/Clipboard';
import { vscode } from './plugins/Vscode';
import App from './App.vue';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(storage);
app.use(clipboard);

if (import.meta.env.VITE_APP_ENV === 'vscode') {
    app.use(vscode);
}

app.mount('#app');
