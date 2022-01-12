/// <reference types="vite/client" />

declare module '*.vue' {
    import { DefineComponent } from 'vue';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare interface VsCodeApi {
    setState: (newState: any) => void;
    getState: () => any;
    postMessage: (message: import('./plugins/Vscode').VscodeMessage) => void;
}

declare function acquireVsCodeApi(): VsCodeApi;
