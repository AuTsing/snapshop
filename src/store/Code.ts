import { defineStore } from 'pinia';
import { useRecordStore } from './Record';
import { useAreaStore } from './Area';
import { useDisk } from '../plugins/Disk';

export enum GenerateActions {
    Text = 'text',
    Pointx = 'pointx',
    Pointy = 'pointy',
    Pointc = 'pointc',
    Area = 'area',
    Repeat = 'repeat',
    Delete = 'delete',
}

export enum AreaLtrb {
    Left = 'left',
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
}

export type GenerateStep =
    | TextGenerateStep
    | PointxGenerateStep
    | PointyGenerateStep
    | PointcGenerateStep
    | AreaGenerateStep
    | ReapeatGenerateStep
    | DeleteGenerateStep;

export interface BaseGenerateStep {
    action: GenerateStep['action'];
}

export interface TextGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Text;
    text: string;
}

export interface PointxGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Pointx;
    index: number | 'n';
}

export interface PointyGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Pointy;
    index: number | 'n';
}

export interface PointcGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Pointc;
    index: number | 'n';
}

export interface AreaGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Area;
    ltrb: AreaLtrb;
}

export interface ReapeatGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Repeat;
    steps: number;
    from: number | 'n';
    to: number | 'n';
}

export interface DeleteGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Delete;
    count: number;
}

export interface ICodeState {
    template1: string;
    template2: string;
    template3: string;
    template4: string;
    template5: string;
    regexp: string;
    regexpReplacement: string;
    pointDefinition: string;
    flow1: GenerateStep[];
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
    flow1: [],
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
            flow1: disk.useStorage('flow1', defaultCode.flow1),
        };
    },
    actions: {
        resetCode() {
            this.$patch(defaultCode);
        },
        addStep(step: GenerateStep) {
            this.flow1.push(step);
        },
        removeStep(index: number) {
            this.flow1.splice(index, 1);
        },
        generate(i: number) {
            const record = useRecordStore();
            const area = useAreaStore();
            const records = record.records.filter(record => record.cNative !== -1);
            const flow = this[`flow${i}` as keyof ICodeState] as GenerateStep[];

            for (const step of flow) {
                if (step.action === GenerateActions.Repeat) {
                    const index = flow.indexOf(step);
                    const flowSlice = flow.slice(index - step.steps, index);
                    const from = step.from === 'n' ? records.length : step.from;
                    const to = step.to === 'n' ? records.length : step.to;
                    const generatedSlice = [] as GenerateStep[];
                    for (let i = from; i <= to; i++) {
                        flowSlice.forEach(step => {
                            const clone = Object.assign({}, step);
                            if (clone.action === GenerateActions.Pointx || clone.action === GenerateActions.Pointy || clone.action === GenerateActions.Pointc) {
                                clone.index = i;
                            }
                            generatedSlice.push(clone);
                        });
                    }
                    flow.splice(index - step.steps, flowSlice.length + 1, ...generatedSlice);
                }
            }
            for (const step of flow) {
                if (step.action === GenerateActions.Delete) {
                    const index = flow.indexOf(step);
                    flow.splice(index - step.count, step.count + 1);
                }
            }

            console.log(flow);

            let code = '';
            for (const step of flow) {
                switch (step.action) {
                    case GenerateActions.Text:
                        code = code + step.text;
                        break;
                    case GenerateActions.Pointx:
                        if (step.index == 'n') {
                            code = code + '$p[n][x]';
                        } else {
                            code = code + (records[step.index - 1] ? records[step.index - 1].x.toString() : `$p[${step.index}][x]`);
                        }
                        break;
                    case GenerateActions.Pointy:
                        if (step.index == 'n') {
                            code = code + '$p[n][x]';
                        } else {
                            code = code + (records[step.index - 1] ? records[step.index - 1].y.toString() : `$p[${step.index}][y]`);
                        }
                        break;
                    case GenerateActions.Pointc:
                        if (step.index == 'n') {
                            code = code + '$p[n][c]';
                        } else {
                            code = code + (records[step.index - 1] ? records[step.index - 1].cNative.toString() : `$p[${step.index}][c]`);
                        }
                        break;
                    case GenerateActions.Area:
                        switch (step.ltrb) {
                            case AreaLtrb.Left:
                                code = code + area.x1.toString();
                                break;
                            case AreaLtrb.Top:
                                code = code + area.y1.toString();
                                break;
                            case AreaLtrb.Right:
                                code = code + area.x2.toString();
                                break;
                            case AreaLtrb.Bottom:
                                code = code + area.y2.toString();
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        break;
                }
            }

            console.log(code);
            return code;
        },
    },
});
