import { defineStore } from 'pinia';
import { useRecordStore } from './Record';
import { useAreaStore } from './Area';
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

export const useCodeStore = defineStore('code', {
    state: (): ICodeState => {
        const defaultCodeCopy = Object.assign({}, defaultCode);
        const state = useDisk().useStorage('code', defaultCodeCopy);
        Object.assign(defaultCodeCopy, state.value);
        Object.assign(state.value, defaultCodeCopy);
        return state.value;
    },
    actions: {
        resetCode() {
            this.$patch(defaultCode);
        },
        generate(i: number) {
            const record = useRecordStore();
            const area = useAreaStore();

            const recordsValid = record.records.filter(record => record.cNative !== -1);
            const points = recordsValid.map(record => `{${record.x},${record.y},${record.c}}`).join(',');
            const delta = recordsValid
                .map(record => `${record.x - recordsValid[0].x}|${record.y - recordsValid[0].y}|${record.c}`)
                .slice(1)
                .join(',');
            const areaJoined = `${area.x1},${area.y1},${area.x2},${area.y2}`;

            const template = this[`template${i}` as keyof ICodeState];

            let code = template
                .replace(/\$points/g, points)
                .replace(/\$delta/g, delta)
                .replace(/\$area/g, areaJoined)
                .replace(/\$point\[([1-9])\]\[x\]/g, (_str, i) => recordsValid[parseInt(i) - 1]?.x.toString() ?? '')
                .replace(/\$point\[([1-9])\]\[y\]/g, (_str, i) => recordsValid[parseInt(i) - 1]?.y.toString() ?? '')
                .replace(/\$point\[([1-9])\]\[c\]/g, (_str, i) => recordsValid[parseInt(i) - 1]?.c.toString() ?? '')
                .replace(
                    /\$point\[([1-9])\]/g,
                    (_str, i) => `${recordsValid[parseInt(i) - 1]?.x ?? ''},${recordsValid[parseInt(i) - 1]?.y ?? ''},${recordsValid[parseInt(i) - 1]?.c ?? ''}`
                );

            if (this.regexp) {
                const regexp = new RegExp(this.regexp);
                code = code.replace(regexp, this.regexpReplacement);
            }

            return code;
        },
    },
});
