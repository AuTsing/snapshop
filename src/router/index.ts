import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router';
import { routes } from './routes';

const routeRecords: RouteRecordRaw[] = routes.map(it => ({ path: '/' + it.key, component: it.view }));

export const router = createRouter({
    history: createMemoryHistory(),
    routes: routeRecords,
});
