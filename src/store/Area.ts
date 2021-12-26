import { Module } from 'vuex';
import { IRootState } from '.';

export interface IAreaState {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const Area: Module<IAreaState, IRootState> = {
    state: {
        x1: -1,
        y1: -1,
        x2: -1,
        y2: -1,
    },
    mutations: {
        updateArea: (state, payload: { x1: number; y1: number; x2: number; y2: number }) => {
            state.x1 = payload.x1;
            state.y1 = payload.y1;
            state.x2 = payload.x2;
            state.y2 = payload.y2;
        },
        resetArea: state => {
            state.x1 = -1;
            state.y1 = -1;
            state.x2 = -1;
            state.y2 = -1;
        },
    },
};

export default Area;
