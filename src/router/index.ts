import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { IRoute } from './IRoute';
import Picker from './Picker';
import Setting from './Setting';
import Help from './Help';
import CodeGenerator from './CodeGenerator';
import Comparer from './Comparer';
import FontLab from './FontLab';

export const views: IRoute[] = [Picker, CodeGenerator, Comparer, FontLab, Setting, Help];

export const routes: RouteRecordRaw[] = [{ path: '/', component: Picker.view }, ...views.map(view => ({ path: '/' + view.key, component: view.view }))];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
