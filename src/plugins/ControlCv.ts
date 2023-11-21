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

    private success(text: string): void {
        text = `${text.slice(0, 30)}${text.length > 30 ? '...' : ''} 已复制到剪贴板`;
        message.success(text);
    }

    private error(text: string): void {
        message.error(text);
    }

    public ctrlC(text: string): void {
        if (!this.isSupport) {
            message.error('复制失败: 该环境下不支持复制');
            return;
        }
        this.nativeCopy(text)
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
