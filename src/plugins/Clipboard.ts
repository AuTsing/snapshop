import { type App, type Plugin, inject } from 'vue';
import { useClipboard as vueUseClipboard, type UseClipboardReturn } from '@vueuse/core';
import { message } from 'ant-design-vue';

class Clipboard {
    static instance: Clipboard;

    static getInstance(): Clipboard {
        if (!Clipboard.instance) {
            Clipboard.instance = new Clipboard();
        }
        return Clipboard.instance;
    }

    readonly clipboard: UseClipboardReturn<false>;

    constructor() {
        this.clipboard = vueUseClipboard();
    }

    private success(text: string) {
        text = `${text.slice(0, 30)}${text.length > 30 ? '...' : ''} 已复制到剪贴板`;
        message.success(text);
    }

    private error(text: string) {
        message.error(text);
    }

    private legacyCopy(value: string) {
        const ta = document.createElement('textarea');
        ta.value = value ?? '';
        ta.style.position = 'absolute';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
    }

    copy(text: string) {
        if (!this.clipboard.isSupported) {
            message.error('复制失败: 该环境下不支持复制');
            return;
        }

        this.clipboard
            .copy(text)
            .catch(it => {
                if (it instanceof Error && it.message === 'Write permission denied.') {
                    return this.legacyCopy(text);
                } else {
                    throw it;
                }
            })
            .then(() => this.success(text))
            .catch(it => {
                if (it instanceof Error) {
                    this.error(`复制失败: ${it.message}`);
                } else {
                    this.error(`复制失败: ${it}`);
                }
            });
    }
}

export const clipboard: Plugin = {
    install: (app: App) => {
        const instance = new Clipboard();
        app.provide('clipboard', instance);
    },
};

export const useClipboard: () => Clipboard = () => inject('clipboard') ?? Clipboard.getInstance();
