import { Module } from 'vuex';
import { IRootState } from '.';

import { message } from 'ant-design-vue';
import 'ant-design-vue/es/message/style/index';

export interface IRecord {
    key: string;
    x: number;
    y: number;
    c: string;
}

export interface IRecordState {
    records: IRecord[];
}

const Record: Module<IRecordState, IRootState> = {
    state: {
        records: [],
    },
    mutations: {
        addRecord: (state, payload: { x: number; y: number; c: string; key?: string }) => {
            if (state.records.length >= 9) {
                message.warning('最大取点数为9个');
                return;
            }
            if (!payload.key) {
                const key = (state.records.length + 1).toString();
                const { x, y, c } = payload;
                state.records.push({ key, x, y, c });
            } else {
                const { key, x, y, c } = payload;
                const index = parseInt(key) - 1;
                for (let i = 0; i < index; i++) {
                    if (!state.records[i]) {
                        state.records[i] = { key: (i + 1).toString(), x: -1, y: -1, c: '0x' };
                    }
                }
                state.records[index] = { key, x, y, c };
            }
        },
        removeRecord: (state, key?: string) => {
            if (key) {
                const filtered = state.records.filter(record => record.key !== key);
                const recognized = filtered.map((record, i) => ({ ...record, key: i.toString() }));
                state.records = recognized;
            } else {
                state.records = [];
            }
        },
    },
};

export default Record;
