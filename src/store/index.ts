import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';
import Coordinate, { ICoordinateState } from './Coordinate';
import Capture, { ICaptureState } from './Capture';
import Record, { IRecordState } from './Record';
import Area, { IAreaState } from './Area';

export interface IRootState {
    coordinate: ICoordinateState;
    capture: ICaptureState;
    record: IRecordState;
    area: IAreaState;
}

export const key: InjectionKey<Store<IRootState>> = Symbol();

export const store = createStore<IRootState>({
    modules: {
        coordinate: Coordinate,
        capture: Capture,
        record: Record,
        area: Area,
    },
});

export function useStore() {
    return baseUseStore(key);
}
