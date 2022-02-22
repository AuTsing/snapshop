import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { router } from './router';
import { controlCv } from './plugins/ControlCv';
import { vscode } from './plugins/Vscode';
import { disk } from './plugins/Disk';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(controlCv);
app.use(disk);

if (import.meta.env.VITE_APP_ENV === 'vscode') {
    app.use(vscode);
}

app.mount('#app');
