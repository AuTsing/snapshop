import { App, Plugin, getCurrentInstance } from 'vue';
import { useClipboard } from '@vueuse/core';
import { message } from 'ant-design-vue';

class ControlCv {
    public readonly nativeCopy: (text: string) => Promise<void>;
    public readonly isSupport: boolean;

    constructor() {
        const { copy, isSupported } = useClipboard();
        this.nativeCopy = copy;
        this.isSupport = isSupported;
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

    public ctrlC(text: string) {
        if (!this.isSupport) {
            message.error('复制失败: 该环境下不支持复制');
            return;
        }

        this.nativeCopy(text)
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

export const controlCv: Plugin = {
    install: (app: App) => {
        const instance = new ControlCv();
        app.config.globalProperties.$controlCv = instance;
    },
};

export const useControlCv: () => ControlCv = () => getCurrentInstance()?.appContext.config.globalProperties.$controlCv;
