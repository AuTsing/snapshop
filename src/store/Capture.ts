import { defineStore } from 'pinia';
import Jimp from 'jimp/browser/lib/jimp';
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
    jimp: Jimp;
    base64: string;
}

export interface SnapshotCommand {
    cmd: 'snapshot';
    data: { success: boolean; message: string; file: number[] };
}

export function readFileSync(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

export async function readFileFromHttps(url: URL): Promise<ArrayBuffer> {
    try {
        return (await Axios.get(url.href, { responseType: 'arraybuffer' })).data;
    } catch (e) {
        if (e && (e as AxiosError).response) {
            const buffer = (e as AxiosError<ArrayBuffer>).response?.data;
            const msg = new TextDecoder().decode(buffer);
            throw new Error(msg);
        } else {
            throw e;
        }
    }
}

export function readFileFromWs(url: URL): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const wsc = new WebSocket(url.href);
        wsc.addEventListener('open', _ => {
            const cmd: SnapshotCommand = {
                cmd: 'snapshot',
                data: {
                    success: true,
                    message: '',
                    file: [],
                },
            };
            wsc.send(JSON.stringify(cmd));
        });
        wsc.addEventListener('message', ev => {
            const cmd = JSON.parse(ev.data) as SnapshotCommand;
            if (cmd.data.success) {
                const u8Array = Uint8Array.from(cmd.data.file);
                resolve(u8Array.buffer);
            } else {
                reject(new Error(cmd.data.message));
            }
            wsc.close();
        });
        wsc.addEventListener('error', _ => {
            wsc.close();
            reject(new Error('无法连接 WS 服务器'));
        });
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
        activeJimp(): Jimp {
            return this.captures.find(capture => capture.key === this.activeKey)!.jimp;
        },
    },
    actions: {
        setCapture(jimp: Jimp, base64: string, key?: string) {
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
        addCapture(jimp: Jimp, base64: string) {
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
        async addCaptureFromLink(link: string) {
            try {
                const url = new URL(link);
                let arrayBuffer: ArrayBuffer;
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    arrayBuffer = await readFileFromHttps(url);
                } else if (url.protocol === 'ws:') {
                    arrayBuffer = await readFileFromWs(url);
                } else {
                    throw new Error('不支持的接口协议 ' + url.protocol);
                }
                const jimp = await Jimp.read(Buffer.from(arrayBuffer));
                const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
                const capture = this.addCapture(jimp, base64);
                return capture.key;
            } catch (e) {
                if (e && (e as AxiosError).response) {
                    const buffer = (e as AxiosError<ArrayBuffer>).response?.data;
                    const msg = new TextDecoder().decode(buffer);
                    message.error('加载图片失败: ' + msg);
                } else if (e instanceof Error) {
                    message.error('加载图片失败: ' + e.message);
                } else {
                    message.error('加载图片失败: 未知错误');
                }
                return this.activeKey;
            }
        },
        async addCaptureFromFile(file: File) {
            const buffer = await readFileSync(file);
            const jimp = await Jimp.read(Buffer.from(buffer));
            const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
            const capture = this.addCapture(jimp, base64);
            return capture.key;
        },
        async rotateCapture() {
            const activeJimp = this.activeJimp;

            const bData = activeJimp.bitmap.data;
            const bDataLength = bData.length;
            const dstBuffer = Buffer.allocUnsafe(bDataLength);

            const w = activeJimp.bitmap.width;
            const h = activeJimp.bitmap.height;
            const dstOffsetStep = 4;

            let dstOffset = 0;
            for (let x = 0; x < w; x++) {
                for (let y = h - 1; y >= 0; y--) {
                    dstBuffer.writeUInt32BE(bData.readUInt32BE((w * y + x) << 2), dstOffset);
                    dstOffset += dstOffsetStep;
                }
            }

            activeJimp.bitmap.width = h;
            activeJimp.bitmap.height = w;
            activeJimp.bitmap.data = dstBuffer;

            const base64 = await activeJimp.getBase64Async(Jimp.MIME_PNG);

            this.setCapture(activeJimp, base64);
        },
    },
});
