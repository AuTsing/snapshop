import { type App, type Plugin, inject } from 'vue';

export const VscodeMessageCommand = {
    GetItem: 'GetItem',
    SetItem: 'SetItem',
} as const;

export type VscodeMessageCommand = (typeof VscodeMessageCommand)[keyof typeof VscodeMessageCommand];

export interface VscodeMessage {
    command: VscodeMessageCommand;
    data: { key: string; value?: string };
}

export interface VsCodeApi {
    getState: () => { [key: string]: string } | undefined;
    setState: (value: { [key: string]: string }) => void;
    postMessage: (message: VscodeMessage) => void;
}

declare function acquireVsCodeApi(): VsCodeApi;

export class Vscode implements VsCodeApi {
    private static instance: Vscode;

    static getInstance() {
        if (!Vscode.instance) {
            Vscode.instance = new Vscode();
        }
        return Vscode.instance;
    }

    getState: () => { [key: string]: string } | undefined;
    setState: (value: { [key: string]: string }) => void;
    postMessage: (message: VscodeMessage) => void;

    private constructor() {
        const vscode = acquireVsCodeApi();
        this.getState = vscode.getState;
        this.setState = vscode.setState;
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
