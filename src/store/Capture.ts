import { defineStore } from 'pinia';
import { Jimp, JimpMime, type JimpInstance } from 'jimp';
import Axios, { AxiosError } from 'axios';
import { message } from 'ant-design-vue';

export interface ICaptureState {
    tabIndex: number;
    captures: ICapture[];
    activeKey: string;
    loading: boolean;
}

export interface ICapture {
    key: string;
    title: string;
    jimp: JimpInstance;
    base64: string;
}

export interface SnapshotCommand {
    cmd: 'snapshot';
    data: { file: number[] };
}

export interface ResultCommand {
    cmd: 'result';
    data: { success: boolean; message: string };
}

async function readFromFile(file: File): Promise<ArrayBuffer> {
    const ab = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
    return ab;
}

async function readFromHttp(url: URL): Promise<ArrayBuffer> {
    try {
        const resp = await Axios.get(url.href, { responseType: 'arraybuffer' });
        const ab = resp.data;
        return ab;
    } catch (e) {
        if (e instanceof AxiosError) {
            const buffer = e.response?.data;
            const message = new TextDecoder().decode(buffer);
            throw new Error(message);
        } else {
            throw e;
        }
    }
}

export function readFromWs(url: URL): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const wsc = new WebSocket(url.href);
        wsc.addEventListener('open', _ => {
            const cmd: SnapshotCommand = {
                cmd: 'snapshot',
                data: {
                    file: [],
                },
            };
            wsc.send(JSON.stringify(cmd));
        });
        wsc.addEventListener('message', ev => {
            const cmd = JSON.parse(ev.data);
            switch (cmd.cmd) {
                case 'result':
                    const resultCommand = cmd as ResultCommand;
                    if (resultCommand.data.success === false) {
                        reject(new Error(cmd.data.message));
                        wsc.close();
                    }
                    break;
                case 'snapshot':
                    const snapshotCommand = cmd as SnapshotCommand;
                    const u8Array = Uint8Array.from(snapshotCommand.data.file);
                    resolve(u8Array.buffer);
                    wsc.close();
                    break;
                default:
                    reject(new Error('未知的命令: ' + cmd.cmd));
                    wsc.close();
                    break;
            }
        });
        wsc.addEventListener('error', _ => {
            wsc.close();
            reject(new Error('无法连接 WS 服务器'));
        });
        setTimeout(() => {
            if (wsc.readyState === wsc.OPEN) {
                wsc.close();
                reject(new Error('连接 WS 服务器超时'));
            }
        }, 10000);
    });
}

export const useCaptureStore = defineStore('capture', {
    state: (): ICaptureState => ({
        tabIndex: 1,
        captures: [],
        activeKey: 'blank',
        loading: false,
    }),
    getters: {
        activeIndex(): number {
            return this.captures.findIndex(capture => capture.key === this.activeKey);
        },
        activeJimp(): JimpInstance {
            return this.captures.find(capture => capture.key === this.activeKey)!.jimp;
        },
    },
    actions: {
        setCapture(jimp: JimpInstance, base64: string, key?: string) {
            key = key ?? this.activeKey;
            const index = this.captures.findIndex(capture => capture.key === key);
            if (index > -1) {
                this.captures[index] = { ...this.captures[index], jimp, base64 };
            }
        },
        removeCapture(key?: string) {
            if (key) {
                this.captures = this.captures.filter(capture => capture.key !== key);
            } else {
                this.captures = [];
            }
        },
        addCapture(jimp: JimpInstance, base64: string) {
            const capture: ICapture = {
                key: `tab${this.tabIndex}`,
                title: `图片${this.tabIndex}`,
                jimp: jimp,
                base64: base64,
            };
            this.tabIndex++;
            this.captures.push(capture);
            return capture;
        },
        async addCaptureFromLink(link: string): Promise<string> {
            try {
                const url = new URL(link);
                let arrayBuffer: ArrayBuffer;
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    arrayBuffer = await readFromHttp(url);
                } else if (url.protocol === 'ws:') {
                    arrayBuffer = await readFromWs(url);
                } else {
                    throw new Error('不支持的接口协议 ' + url.protocol);
                }
                const jimp = await Jimp.read(arrayBuffer);
                const base64 = await jimp.getBase64(JimpMime.png);
                const capture = this.addCapture(jimp as JimpInstance, base64);
                return capture.key;
            } catch (e) {
                if (e instanceof Error) {
                    message.error('加载图片失败: ' + e.message);
                } else {
                    message.error('加载图片失败: 未知错误');
                }
                return this.activeKey;
            }
        },
        async addCaptureFromFile(file: File): Promise<string> {
            try {
                const ab = await readFromFile(file);
                const jimp = await Jimp.read(ab);
                const base64 = await jimp.getBase64(JimpMime.png);
                const capture = this.addCapture(jimp as JimpInstance, base64);
                return capture.key;
            } catch (e) {
                if (e instanceof Error) {
                    message.error('加载图片失败: ' + e.message);
                } else {
                    message.error('加载图片失败: 未知错误');
                }
                return this.activeKey;
            }
        },
        async rotateCapture() {
            const activeJimp = this.activeJimp;

            const rotatedJimp = activeJimp.rotate(-90);
            const rotatedBase64 = await rotatedJimp.getBase64(JimpMime.png);

            this.setCapture(rotatedJimp as JimpInstance, rotatedBase64);
        },
    },
});
