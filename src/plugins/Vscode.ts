import { type App, type Plugin, inject } from 'vue';

export const VscodeMessageCommand = {
    getItem: 'getItem',
    setItem: 'setItem',
} as const;

export type VscodeMessageCommand = (typeof VscodeMessageCommand)[keyof typeof VscodeMessageCommand];

export interface VscodeMessage {
    command: VscodeMessageCommand;
    data: { key: string; value?: unknown };
}

declare function acquireVsCodeApi(): VsCodeApi;

export interface VsCodeApi {
    setState: (newState: unknown) => void;
    getState: () => unknown;
    postMessage: (message: VscodeMessage) => void;
}

export class Vscode {
    private static instance: Vscode;

    static getInstance() {
        if (!Vscode.instance) {
            Vscode.instance = new Vscode();
        }
        return Vscode.instance;
    }

    readonly setState: VsCodeApi['setState'];
    readonly getState: VsCodeApi['getState'];
    readonly postMessage: VsCodeApi['postMessage'];

    private constructor() {
        const vscode = acquireVsCodeApi();
        this.setState = vscode.setState;
        this.getState = vscode.getState;
        this.postMessage = vscode.postMessage;
    }
}

export const vscode: Plugin = {
    install: (app: App) => {
        const instance = Vscode.getInstance();
        app.provide('vscode', instance);
    },
};

export const useVscode: () => Vscode = () => inject('vscode') ?? Vscode.getInstance();
