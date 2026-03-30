import { type App, type Plugin, type MaybeRefOrGetter, inject } from 'vue';
import {
    type Awaitable,
    type RemovableRef,
    type StorageLikeAsync,
    useStorage as vueUseStorage,
    useStorageAsync as vueUseStorageAsync,
} from '@vueuse/core';
import { type VscodeMessage, VscodeMessageCommand, Vscode } from './Vscode';

export class VscodeStorage implements StorageLikeAsync {
    private readonly vscode: Vscode;

    constructor() {
        this.vscode = Vscode.getInstance();
    }

    getItem(key: string): Awaitable<string | null> {
        return new Promise((resolve, _) => {
            const handler = (e: MessageEvent<VscodeMessage>) => {
                if (e.data.command === VscodeMessageCommand.GetItem && e.data.data.key === key) {
                    removeEventListener('message', handler);
                    resolve(e.data.data.value ?? null);
                }
            };
            addEventListener('message', handler);
            this.vscode.postMessage({ command: VscodeMessageCommand.GetItem, data: { key } });
        });
    }

    setItem(key: string, value: string): Awaitable<void> {
        return this.vscode.postMessage({ command: VscodeMessageCommand.SetItem, data: { key, value } });
    }

    removeItem(key: string): Awaitable<void> {
        return this.vscode.postMessage({ command: VscodeMessageCommand.SetItem, data: { key, value: undefined } });
    }
}

class Storage {
    private static instance: Storage;

    static getInstance() {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }
        return Storage.instance;
    }

    useState: <T>(key: string, initialValue: MaybeRefOrGetter<T>) => RemovableRef<T>;

    private constructor() {
        const env = import.meta.env.VITE_APP_ENV;
        if (env === 'vscode') {
            const vscodeStorage = new VscodeStorage();
            this.useState = <T>(key: string, initialValue: MaybeRefOrGetter<T>) =>
                vueUseStorageAsync(key, initialValue, vscodeStorage);
        } else {
            this.useState = <T>(key: string, initialValue: MaybeRefOrGetter<T>) => vueUseStorage(key, initialValue);
        }
    }
}

export const storage: Plugin = {
    install: (app: App) => {
        const instance = Storage.getInstance();
        app.provide('storage', instance);
    },
};

export const useStorage: () => Storage = () => inject('storage') ?? Storage.getInstance();
