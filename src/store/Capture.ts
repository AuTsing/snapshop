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

const defaultPreview =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC';
const zoomRadius = 10;
const zoomSideLength = zoomRadius * 2 + 1;
const zoomDisplayRatio = 14;
const zoomSideLengthDisplay = zoomSideLength * zoomDisplayRatio;

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
        zoomCaptureBase64: async (_state, getters, rootState, _rootGetters) => {
            const activeJimp = getters.activeJimp;
            const x0 = rootState.coordinate.x;
            const y0 = rootState.coordinate.y;
            if (activeJimp && x0 > -1 && y0 > -1) {
                const jimp = new Jimp(zoomSideLength, zoomSideLength, 0);
                for (let i = -zoomRadius; i <= zoomRadius; ++i) {
                    for (let j = -zoomRadius; j <= zoomRadius; ++j) {
                        const xx = i + x0;
                        const yy = j + y0;
                        if (xx >= 0 && xx < activeJimp.bitmap.width && yy >= 0 && yy < activeJimp.bitmap.height) {
                            jimp.setPixelColor(activeJimp.getPixelColor(xx, yy), i + 10, j + 10);
                        }
                    }
                }
                const resizedJimp = jimp.resize(zoomSideLengthDisplay, zoomSideLengthDisplay, Jimp.RESIZE_NEAREST_NEIGHBOR);
                const base64 = await resizedJimp.getBase64Async(Jimp.MIME_PNG);
                return base64;
            } else {
                return defaultPreview;
            }
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
