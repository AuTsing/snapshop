import { type App, type Plugin, type MaybeRefOrGetter, inject } from 'vue';
import { type Awaitable, type RemovableRef, type StorageLikeAsync, useStorage as vueUseStorage } from '@vueuse/core';
import { type VscodeMessage, VscodeMessageCommand, useVscode, Vscode } from './Vscode';

export class VscodeStorage implements StorageLikeAsync {
    private readonly vscode: Vscode;

    constructor() {
        this.vscode = useVscode();
    }

    getItem(key: string): Awaitable<any | null> {
        return new Promise((resolve, _) => {
            const getStateHandler = (e: MessageEvent<VscodeMessage>) => {
                if (e.data.command === VscodeMessageCommand.getItem && e.data.data.key === key) {
                    removeEventListener('message', getStateHandler);
                    resolve(e.data.data.value);
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
            this.useState = <T>(key: string, initialValue: MaybeRefOrGetter<T>) =>
                vueUseStorage(key, initialValue, new VscodeStorage());
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
