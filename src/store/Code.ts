import { Module } from 'vuex';
import { IRootState } from '.';
import { useDisk } from '../plugins/Disk';

export interface ICodeState {
    template1: string;
    template2: string;
    template3: string;
    template4: string;
    template5: string;
    regexp: string;
    regexpReplacement: string;
}

export const defaultCode: ICodeState = {
    template1: `{'undefined', {$points}},`,
    template2: '',
    template3: '',
    template4: '',
    template5: '',
    regexp: '',
    regexpReplacement: '',
};

const Code: Module<ICodeState, IRootState> = {
    state: () => {
        const defaultCodeCopy = Object.assign({}, defaultCode);
        const state = useDisk().useStorage('code', defaultCodeCopy);
        Object.assign(defaultCodeCopy, state.value);
        Object.assign(state.value, defaultCodeCopy);
        return state.value;
    },
    mutations: {
        setCode: <T extends keyof ICodeState>(state: ICodeState, { key, value }: { key: T; value: ICodeState[T] }) => {
            state[key] = value;
        },
        resetCode: state => {
            Object.assign(state, defaultCode);
        },
    },
    actions: {
        generate: ({ state, rootState }, i: number) => {
            const records = rootState.record.records;
            const recordsValid = records.filter(record => record.cNative !== -1);
            const points = recordsValid.map(record => `{${record.x},${record.y},${record.c}}`).join(',');
            const delta = recordsValid
                .map(record => `${record.x - recordsValid[0].x}|${record.y - recordsValid[0].y}|${record.c}`)
                .slice(1)
                .join(',');
            const area = `${rootState.area.x1},${rootState.area.y1},${rootState.area.x2},${rootState.area.y2}`;

            const template = state[`template${i}` as keyof ICodeState];

            let code = template
                .replace(/\$points/g, points)
                .replace(/\$delta/g, delta)
                .replace(/\$area/g, area)
                .replace(/\$point\[([1-9])\]\[x\]/g, (_str, i) => recordsValid[parseInt(i) - 1].x.toString())
                .replace(/\$point\[([1-9])\]\[y\]/g, (_str, i) => recordsValid[parseInt(i) - 1].y.toString())
                .replace(/\$point\[([1-9])\]\[c\]/g, (_str, i) => recordsValid[parseInt(i) - 1].c.toString())
                .replace(
                    /\$point\[([1-9])\]/g,
                    (_str, i) => `${recordsValid[parseInt(i) - 1].x},${recordsValid[parseInt(i) - 1].y},${recordsValid[parseInt(i) - 1].c}`
                );

            if (state.regexp) {
                const regexp = new RegExp(state.regexp);
                code = code.replace(regexp, state.regexpReplacement);
            }

            return code;
        },
    },
};

export default Code;
