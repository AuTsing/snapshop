import { App, Plugin, getCurrentInstance, watch } from 'vue';
import { MaybeRef, RemovableRef, StorageLike, useStorage } from '@vueuse/core';
import { VscodeMessageCommand, useVscode, VscodeMessage } from './Vscode';

class VscodeStorage implements StorageLike {
    private readonly vscode = useVscode();

    constructor() {
        const state = this.vscode.getState();
        if (state === undefined) {
            this.vscode.setState({});
        }
    }

    getItem(key: string): string | null {
        const state = this.vscode.getState();
        return state[key];
    }

    setItem(key: string, value: string): void {
        const state = this.vscode.getState();
        state[key] = value;
        this.vscode.setState(state);
    }

    removeItem(key: string): void {
        const state = this.vscode.getState();
        state[key] = null;
        this.vscode.setState(state);
    }

    initState(key: string, state: RemovableRef<any>): void {
        this.vscode.postMessage({ command: VscodeMessageCommand.getState, data: {} });
        const getStateHandler = (e: MessageEvent<VscodeMessage>) => {
            if (e.data.command === VscodeMessageCommand.getState) {
                const vscodeState = this.vscode.getState();
                Object.assign(vscodeState, e.data.data);
                this.vscode.setState(vscodeState);
                state.value = Object.assign(state.value, JSON.parse(vscodeState[key]));
                watch(state, () => this.vscode.postMessage({ command: VscodeMessageCommand.setState, data: this.vscode.getState() }), { deep: true });
                removeEventListener('message', getStateHandler);
            }
        };
        addEventListener('message', getStateHandler);
    }
}

class Disk {
    private static instance: Disk;
    public useStorage: <T>(key: string, initialValue: MaybeRef<T>) => RemovableRef<T>;

    private constructor() {
        const env = import.meta.env.VITE_APP_ENV;
        if (env === 'vscode') {
            this.useStorage = <T>(key: string, initialValue: MaybeRef<T>) => {
                const vscodeStorage = new VscodeStorage();
                const state = useStorage(key, initialValue, vscodeStorage);
                vscodeStorage.initState(key, state);
                return state;
            };
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
