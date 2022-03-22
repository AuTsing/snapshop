import { App, Plugin, getCurrentInstance } from 'vue';
import { Awaitable, MaybeRef, RemovableRef, StorageLikeAsync, useStorage, useStorageAsync } from '@vueuse/core';
import { VscodeMessageCommand, useVscode, VscodeMessage, Vscode } from './Vscode';

export class VscodeStorage implements StorageLikeAsync {
    private readonly vscode: Vscode;

    constructor() {
        this.vscode = useVscode();
    }

    getItem(key: string): Awaitable<any | null> {
        return new Promise((resolve, reject) => {
            const getStateHandler = (e: MessageEvent<VscodeMessage>) => {
                if (e.data.command === VscodeMessageCommand.getItem && e.data.data.key === key) {
                    resolve(e.data.data.value);
                    removeEventListener('message', getStateHandler);
                }
            };
            addEventListener('message', getStateHandler);
            this.vscode.postMessage({ command: VscodeMessageCommand.getItem, data: { key } });
        });
    }

    setItem(key: string, value: string): Awaitable<void> {
        return this.vscode.postMessage({ command: VscodeMessageCommand.setItem, data: { key, value } });
    }

    removeItem(key: string): Awaitable<void> {
        return this.vscode.postMessage({ command: VscodeMessageCommand.setItem, data: { key, value: undefined } });
    }
}

class Disk {
    private static instance: Disk;
    public useStorage: <T>(key: string, initialValue: MaybeRef<T>) => RemovableRef<T>;

    private constructor() {
        const env = import.meta.env.VITE_APP_ENV;
        if (env === 'vscode') {
            this.useStorage = <T>(key: string, initialValue: MaybeRef<T>) => useStorageAsync(key, initialValue, new VscodeStorage());
        } else {
            this.useStorage = useStorage;
        }
    }

    public static getInstance() {
        if (!Disk.instance) {
            Disk.instance = new Disk();
        }
        return Disk.instance;
    }
}

export const disk: Plugin = {
    install: (app: App) => {
        const instance = Disk.getInstance();
        app.config.globalProperties.$disk = instance;
    },
};

export const useDisk: () => Disk = () => getCurrentInstance()?.appContext.config.globalProperties.$disk ?? Disk.getInstance();
