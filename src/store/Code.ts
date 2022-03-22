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
    pointDefinition: string;
}

export const defaultCode: ICodeState = {
    template1: `{'undefined', {$points}},`,
    template2: '',
    template3: '',
    template4: '',
    template5: '',
    regexp: '',
    regexpReplacement: '',
    pointDefinition: '{$point[n][x],$point[n][y],$point[n][c]}',
};

export const useCodeStore = defineStore('code', {
    state: () => {
        const disk = useDisk();
        return {
            template1: disk.useStorage('template1', defaultCode.template1),
            template2: disk.useStorage('template2', defaultCode.template2),
            template3: disk.useStorage('template3', defaultCode.template3),
            template4: disk.useStorage('template4', defaultCode.template4),
            template5: disk.useStorage('template5', defaultCode.template5),
            regexp: disk.useStorage('regexp', defaultCode.regexp),
            regexpReplacement: disk.useStorage('regexpReplacement', defaultCode.regexpReplacement),
            pointDefinition: disk.useStorage('pointDefinition', defaultCode.pointDefinition),
        };
    },
    actions: {
        resetCode() {
            this.$patch(defaultCode);
        },
        generate(i: number) {
            const record = useRecordStore();
            const area = useAreaStore();

            const validRecords = record.records.filter(record => record.cNative !== -1);
            const points = validRecords
                .map(record =>
                    this.pointDefinition
                        .replace(/\$point\[n\]\[x\]/g, record.x.toString())
                        .replace(/\$point\[n\]\[y\]/g, record.y.toString())
                        .replace(/\$point\[n\]\[c\]/g, record.c.toString())
                )
                .join(',');

            const delta = validRecords
                .map(record => `${record.x - validRecords[0].x}|${record.y - validRecords[0].y}|${record.c}`)
                .slice(1)
                .join(',');
            const areaJoined = `${area.x1},${area.y1},${area.x2},${area.y2}`;

            const template = this[`template${i}` as keyof ICodeState];

            let code = template
                .replace(/\$points/g, points)
                .replace(/\$delta/g, delta)
                .replace(/\$area/g, areaJoined)
                .replace(/\$point\[([1-9])\]\[x\]/g, (_str, i) => validRecords[parseInt(i) - 1]?.x.toString() ?? '')
                .replace(/\$point\[([1-9])\]\[y\]/g, (_str, i) => validRecords[parseInt(i) - 1]?.y.toString() ?? '')
                .replace(/\$point\[([1-9])\]\[c\]/g, (_str, i) => validRecords[parseInt(i) - 1]?.c.toString() ?? '')
                .replace(
                    /\$point\[([1-9])\]/g,
                    (_str, i) => `${validRecords[parseInt(i) - 1]?.x ?? ''},${validRecords[parseInt(i) - 1]?.y ?? ''},${validRecords[parseInt(i) - 1]?.c ?? ''}`
                );

            if (this.regexp) {
                const regexp = new RegExp(this.regexp);
                code = code.replace(regexp, this.regexpReplacement);
            }

            return code;
        },
    },
});
