import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router';
import { views } from './views';

export const routes: RouteRecordRaw[] = views.map(it => ({ path: '/' + it.key, component: it.content }));

export const router = createRouter({
    history: createMemoryHistory(),
    routes: routes,
});
