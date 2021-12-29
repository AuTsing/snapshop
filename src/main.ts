import { createApp } from 'vue';
import App from './App.vue';
import { store, key } from './store';
import { router } from './router';
import { controlCv } from './plugins/ControlCv';

const app = createApp(App);
app.use(store, key);
app.use(router);
app.use(controlCv);
app.mount('#app');
