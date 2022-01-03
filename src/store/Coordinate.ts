import { Module } from 'vuex';
import { IRootState } from '.';
import Jimp from 'jimp/browser/lib/jimp';
import { ColorMode } from './Configuration';

export interface ICoordinateState {
    x: number;
    y: number;
}

const Coordinate: Module<ICoordinateState, IRootState> = {
    state: {
        x: -1,
        y: -1,
    },
    getters: {
        c:
            (_state, getters, rootState, _rootGetters) =>
            (display: ColorMode = rootState.configuration.colorMode) => {
                const cNative: number = getters.cNative;
                if (cNative === -1) {
                    return '-1';
                }
                switch (display) {
                    case ColorMode.dec:
                        return cNative.toString();
                    case ColorMode.hex:
                        return `000000${cNative.toString(16).slice(0, -2)}`.slice(-6);
                    case ColorMode.hexWith0x:
                        return '0x' + `000000${cNative.toString(16).slice(0, -2)}`.slice(-6);
                    case ColorMode.hexWithPound:
                        return '#' + `000000${cNative.toString(16).slice(0, -2)}`.slice(-6);
                    case ColorMode.rgb:
                        const rgba = Jimp.intToRGBA(cNative);
                        return `${rgba.r},${rgba.g},${rgba.b}`;
                }
            },
        cNative: (state, _getters, _rootState, rootGetters) => {
            if (state.x > -1 && state.y > -1) {
                const jimp: Jimp = rootGetters.activeJimp;
                const c = jimp.getPixelColor(state.x, state.y);
                return c;
            } else {
                return -1;
            }
        },
        xyLegal: (state, _getters, _rootState, rootGetters) => (x?: number, y?: number) => {
            x = x ?? state.x;
            y = y ?? state.y;
            if (x < 0 || y < 0) {
                return false;
            } else {
                const jimp: Jimp = rootGetters.activeJimp;
                if (!jimp || x > jimp.bitmap.width - 1 || y > jimp.bitmap.height - 1) {
                    return false;
                } else {
                    return true;
                }
            }
        },
    },
    mutations: {
        updateCoordinate: (state, payload: { x: number; y: number }) => {
            state.x = payload.x;
            state.y = payload.y;
        },
        resetCoordinate: state => {
            state.x = -1;
            state.y = -1;
        },
    },
};

export default Coordinate;
