import { Module } from 'vuex';
import { IRootState } from '.';

export interface ICoordinateState {
    x: number;
    y: number;
}

const Coordinate: Module<ICoordinateState, IRootState> = {
    state: {
        x: -1,
        y: -1,
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
