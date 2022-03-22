import { App, Plugin, getCurrentInstance } from 'vue';

export enum VscodeMessageCommand {
    getItem = 'getItem',
    setItem = 'setItem',
}

export interface VscodeMessage {
    command: VscodeMessageCommand;
    data: any;
}

export class Vscode {
    private static instance: Vscode;
    public readonly setState: VsCodeApi['setState'];
    public readonly getState: VsCodeApi['getState'];
    public readonly postMessage: VsCodeApi['postMessage'];

    private constructor() {
        const vscode = acquireVsCodeApi();
        this.setState = vscode.setState;
        this.getState = vscode.getState;
        this.postMessage = vscode.postMessage;
    }

    public static getInstance() {
        if (!Vscode.instance) {
            Vscode.instance = new Vscode();
        }
        return Vscode.instance;
    }
}

export const vscode: Plugin = {
    install: (app: App) => {
        const instance = Vscode.getInstance();
        app.config.globalProperties.$vscode = instance;
    },
};

export const useVscode: () => Vscode = () => getCurrentInstance()?.appContext.config.globalProperties.$vscode ?? Vscode.getInstance();
