import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import Coordinate, { ICoordinateState } from './Coordinate';
import Capture, { ICaptureState } from './Capture';

export interface IRootState {
    coordinate: ICoordinateState;
    capture: ICaptureState;
}

export const key: InjectionKey<Store<IRootState>> = Symbol();

export const store = createStore<IRootState>({
    modules: {
        coordinate: Coordinate,
        capture: Capture,
    },
});

export function useStore() {
    return baseUseStore(key);
}
