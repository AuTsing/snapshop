import { defineStore } from 'pinia';
import Jimp from 'jimp/browser/lib/jimp';
import Axios, { AxiosError } from 'axios';
import { message } from 'ant-design-vue';
import { encode } from 'cbor-x/encode';
import { decode } from 'cbor-x/decode';

export interface CaptureState {
    tabIndex: number;
    captures: Capture[];
    activeKey: string;
    loading: boolean;
}

export interface Capture {
    key: string;
    title: string;
    jimp: Jimp;
    base64: string;
}

type WsMessageData = SnapshotData | SnapshotResultData;

interface SnapshotData {}

interface SnapshotResultData {
    readonly success: boolean;
    readonly message: string;
    readonly file: Uint8Array;
}

type Cbor = ['Snapshot', Snapshot] | ['SnapshotResult', SnapshotResult];

type EncodedCbor = ['Snapshot', Map<string, any>] | ['SnapshotResult', Map<string, any>];

interface WsMessage {
    readonly id: string;
    readonly data: WsMessageData;
    toCBOR(): EncodedCbor;
}

class Snapshot implements WsMessage {
    static readonly cmd: string = 'Snapshot';

    readonly id: string;
    readonly data: SnapshotData;

    constructor(id: string, data: SnapshotData) {
        this.id = id;
        this.data = data;
    }

    toCBOR(): EncodedCbor {
        return ['Snapshot', new Map(Object.entries(this))];
    }
}

class SnapshotResult implements WsMessage {
    static readonly cmd: string = 'SnapshotResult';

    readonly id: string;
    readonly data: SnapshotResultData;

    constructor(id: string, data: SnapshotResultData) {
        this.id = id;
        this.data = data;
    }

    toCBOR(): EncodedCbor {
        return ['SnapshotResult', new Map(Object.entries(this))];
    }
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

function createDeferred<T>(): [Promise<T>, (value: T | PromiseLike<T>) => void, (reason?: any) => void] {
    let resolve, reject;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return [promise, resolve!!, reject!!];
}

async function readFromWs(url: URL): Promise<ArrayBuffer> {
    const [opened, resolveOpened, rejectOpened] = createDeferred<void>();
    const [gotMessage, resolveGotMessage, rejectGotMessage] = createDeferred<ArrayBuffer>();

    const id = crypto.randomUUID();
    const conn = new WebSocket(url.href);
    conn.binaryType = 'arraybuffer';
    conn.addEventListener('open', _ => {
        resolveOpened();
    });
    conn.addEventListener('message', ev => {
        resolveGotMessage(ev.data);
    });
    conn.addEventListener('error', _ => {
        const e = new Error('连接 WS 服务器失败');
        rejectOpened(e);
        rejectGotMessage(e);
    });
    setTimeout(() => {
        if (conn.readyState === conn.OPEN) {
            const e = new Error('连接 WS 服务器超时');
            rejectOpened(e);
            rejectGotMessage(e);
        }
    }, 10000);

    try {
        const message = new Snapshot(id, {});
        const messageBytes = encode(message.toCBOR());

        await opened;
        conn.send(messageBytes);

        const newMessage = await gotMessage;
        const cbor = decode(new Uint8Array(newMessage)) as Cbor;

        switch (cbor[0]) {
            case 'SnapshotResult':
                const message = new SnapshotResult(cbor[1].id, cbor[1].data);
                if (message.id !== id) {
                    throw new Error(`消息ID不匹配: ${message.id} ${id}`);
                }
                if (message.data.success !== true) {
                    throw new Error(`截图失败: ${message.data.message.split(/\r?\n/)[0]}`);
                }
                return message.data.file.slice().buffer;
            default:
                throw new Error(`未知类型: ${cbor}`);
        }
    } catch (e) {
        rejectOpened(e);
        rejectGotMessage(e);
        throw e;
    } finally {
        conn.close();
    }
}

export const useCaptureStore = defineStore('capture', {
    state: (): CaptureState => ({
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
            const capture: Capture = {
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
                const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
                const capture = this.addCapture(jimp, base64);
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
                const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
                const capture = this.addCapture(jimp, base64);
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

            const bData = activeJimp.bitmap.data;
            const bDataLength = bData.length;
            const dstBuffer = new ArrayBuffer(bDataLength);
            const dstView = new DataView(dstBuffer);

            const w = activeJimp.bitmap.width;
            const h = activeJimp.bitmap.height;
            const dstOffsetStep = 4;

            let dstOffset = 0;
            for (let x = 0; x < w; x++) {
                for (let y = h - 1; y >= 0; y--) {
                    dstView.setUint32(dstOffset, bData.readUInt32BE((w * y + x) << 2));
                    dstOffset += dstOffsetStep;
                }
            }

            activeJimp.bitmap.width = h;
            activeJimp.bitmap.height = w;
            activeJimp.bitmap.data = dstBuffer;
            const rotatedBase64 = await activeJimp.getBase64Async(Jimp.MIME_PNG);

            this.setCapture(activeJimp, rotatedBase64);
        },
    },
});
