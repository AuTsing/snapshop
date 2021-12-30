import { Module, GetterTree } from 'vuex';
import { IRootState } from '.';
import Jimp from 'jimp/browser/lib/jimp';

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
        addCaptureFromUrl: async ({ state, commit }, url: string) => {
            const jimp = await Jimp.read(url);
            const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
            const capture: ICapture = {
                key: `tab${state.tabIndex}`,
                title: `图片${state.tabIndex}`,
                jimp: jimp,
                base64: base64,
            };
            commit('addCapture', capture);
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
