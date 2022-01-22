import { Module } from 'vuex';
import { IRootState } from '.';
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

const Capture: Module<ICaptureState, IRootState> = {
    state: {
        tabIndex: 1,
        captures: [],
        activeKey: 'blank',
        loading: false,
    },
    getters: {
        activeIndex: state => {
            return state.captures.findIndex(capture => capture.key === state.activeKey);
        },
        activeJimp: state => {
            return state.captures.find(capture => capture.key === state.activeKey)?.jimp;
        },
    },
    mutations: {
        setCapture: (state, { key, jimp, base64 }: { key?: string; jimp: Jimp; base64: string }) => {
            key = key ?? state.activeKey;
            const index = state.captures.findIndex(capture => capture.key === key);
            if (index > -1) {
                state.captures[index] = { ...state.captures[index], jimp, base64 };
            }
        },
        setActiveKey: (state, key: string) => {
            state.activeKey = key;
        },
        addCapture: (state, capture: ICapture) => {
            state.tabIndex++;
            state.captures.push(capture);
        },
        removeCapture: (state, key?: string) => {
            if (key) {
                state.captures = state.captures.filter(capture => capture.key !== key);
            } else {
                state.captures = [];
            }
        },
        setCaptureLoading: (state, loading: boolean) => {
            state.loading = loading;
        },
    },
    actions: {
        addCapture: ({ state, commit }, { jimp, base64 }: { jimp: Jimp; base64: string }) => {
            const capture: ICapture = {
                key: `tab${state.tabIndex}`,
                title: `图片${state.tabIndex}`,
                jimp: jimp,
                base64: base64,
            };
            commit('addCapture', capture);
            return capture;
        },
        addCaptureFromLink: async ({ state, dispatch }, link: string) => {
            try {
                const resp = await Axios.get<ArrayBuffer>(link, { responseType: 'arraybuffer' });
                const jimp = await Jimp.read(Buffer.from(resp.data));
                const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
                const capture = await dispatch('addCapture', { jimp, base64 });
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
                return state.activeKey;
            }
        },
        addCaptureFromFile: async ({ dispatch }, file: File) => {
            const buffer = await readFileSync(file);
            const jimp = await Jimp.read(Buffer.from(buffer));
            const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
            const capture = await dispatch('addCapture', { jimp, base64 });
            return capture.key;
        },
        rotateCapture: async ({ commit, getters }) => {
            const activeJimp = getters.activeJimp;

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

            commit('setCapture', { jimp: activeJimp, base64 });
        },
    },
};

export default Capture;
