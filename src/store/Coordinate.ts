import { Module } from 'vuex';
import { IRootState } from '.';
import Jimp from 'jimp/browser/lib/jimp';

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
        c: (state, getters, rootState, rootGetters) => {
            if (state.x > -1 && state.y > -1) {
                const jimp: Jimp = rootGetters.activeJimp;
                const c = `0x` + `000000${jimp.getPixelColor(state.x, state.y).toString(16).slice(0, -2)}`.slice(-6);
                return c;
            } else {
                return `0x`;
            }
        },
        xyLegal: (_state, _getters, _rootState, rootGetters) => (x: number, y: number) => {
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
