import { Module } from 'vuex';
import { IRootState } from '.';
import Jimp from 'jimp/browser/lib/jimp';

export interface ICaptureState {
    tabIndex: number;
    captures: ICapture[];
    activeKey: string;
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
    },
};

export default Capture;
