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
                const resp = await Axios.get<ArrayBuffer>(link, { responseType: 'arraybuffer' });
                const jimp = await Jimp.read(Buffer.from(resp.data));
                const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
                const capture = this.addCapture(jimp, base64);
                return capture.key;
            } catch (e) {
                if (e && (e as AxiosError).response) {
                    const buffer = (e as AxiosError<ArrayBuffer>).response?.data;
                    const msg = new TextDecoder().decode(buffer);
                    message.error('加载图片失败: ' + msg);
                } else if (e instanceof Error) {
                    message.error('加载图片失败: ' + e.message + ' 这有可能是没有配置CORS导致的');
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
