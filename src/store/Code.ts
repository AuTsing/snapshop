import { defineStore } from 'pinia';
import Jimp from 'jimp/browser/lib/jimp';
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

export enum ColorFormat {
    Dec = 'dec',
    UpperHex = 'UpperHex',
    LowerHex = 'LowerHex',
    Rgb = 'rgb',
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
    deltaIndex: number;
}

export interface PointyGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Pointy;
    index: number | 'n';
    deltaIndex: number;
}

export interface PointcGenerateStep extends BaseGenerateStep {
    action: GenerateActions.Pointc;
    index: number | 'n';
    format: ColorFormat;
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
    flow1: GenerateStep[];
    flow2: GenerateStep[];
    flow3: GenerateStep[];
    flow4: GenerateStep[];
    flow5: GenerateStep[];
    flow6: GenerateStep[];
    flow7: GenerateStep[];
    flow8: GenerateStep[];
}

export const defaultCode: ICodeState = {
    flow1: [
        { action: GenerateActions.Text, text: `{'undefined', {` },
        { action: GenerateActions.Text, text: `{` },
        { action: GenerateActions.Pointx, index: 'n', deltaIndex: 0 },
        { action: GenerateActions.Text, text: `, ` },
        { action: GenerateActions.Pointy, index: 'n', deltaIndex: 0 },
        { action: GenerateActions.Text, text: `, 0x` },
        { action: GenerateActions.Pointc, index: 'n', format: ColorFormat.LowerHex },
        { action: GenerateActions.Text, text: `}, ` },
        { action: GenerateActions.Repeat, steps: 7, from: 1, to: 'n' },
        { action: GenerateActions.Text, text: `}}, ` },
    ],
    flow2: [
        { action: GenerateActions.Text, text: `{'undefined', ` },
        { action: GenerateActions.Text, text: `{0x` },
        { action: GenerateActions.Pointc, index: 1, format: ColorFormat.LowerHex },
        { action: GenerateActions.Text, text: `,'` },
        { action: GenerateActions.Pointx, index: 'n', deltaIndex: 1 },
        { action: GenerateActions.Text, text: `,` },
        { action: GenerateActions.Pointy, index: 'n', deltaIndex: 1 },
        { action: GenerateActions.Text, text: `,0x` },
        { action: GenerateActions.Pointc, index: 'n', format: ColorFormat.LowerHex },
        { action: GenerateActions.Text, text: `|` },
        { action: GenerateActions.Repeat, steps: 6, from: 2, to: 'n' },
        { action: GenerateActions.Delete, count: 1 },
        { action: GenerateActions.Text, text: `'}, ` },
        { action: GenerateActions.Text, text: `}, ` },
    ],
    flow3: [],
    flow4: [],
    flow5: [],
    flow6: [],
    flow7: [],
    flow8: [],
};

export const useCodeStore = defineStore('code', {
    state: () => {
        const disk = useDisk();
        return {
            flow1: disk.useStorage('flow1', defaultCode.flow1),
            flow2: disk.useStorage('flow2', defaultCode.flow2),
            flow3: disk.useStorage('flow3', defaultCode.flow3),
            flow4: disk.useStorage('flow4', defaultCode.flow4),
            flow5: disk.useStorage('flow5', defaultCode.flow5),
            flow6: disk.useStorage('flow6', defaultCode.flow6),
            flow7: disk.useStorage('flow7', defaultCode.flow7),
            flow8: disk.useStorage('flow8', defaultCode.flow8),
        };
    },
    actions: {
        resetCode() {
            this.$patch(defaultCode);
        },
        addStep(flowName: string, step: GenerateStep) {
            this[flowName as keyof ICodeState].push(step);
        },
        removeStep(flowName: string, index: number) {
            this[flowName as keyof ICodeState].splice(index, 1);
        },
        generate(flowName: string) {
            const record = useRecordStore();
            const area = useAreaStore();
            const records = record.records.filter(record => record.cNative !== -1);
            const flow = Array.from(this[flowName as keyof ICodeState] as GenerateStep[]);

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

            let code = '';
            for (const step of flow) {
                switch (step.action) {
                    case GenerateActions.Text:
                        code = code + step.text;
                        break;

                    case GenerateActions.Pointx:
                        if (step.index == 'n') {
                            code = code + '$p[n][x]';
                        } else if (records[step.index - 1] == null) {
                            code = code + `$p[${step.index}][x]`;
                        } else {
                            if (records[step.deltaIndex - 1] != null) {
                                code = code + (records[step.index - 1].x - records[step.deltaIndex - 1].x).toString();
                            } else {
                                code = code + records[step.index - 1].x.toString();
                            }
                        }
                        break;

                    case GenerateActions.Pointy:
                        if (step.index == 'n') {
                            code = code + '$p[n][x]';
                        } else if (records[step.index - 1] == null) {
                            code = code + `$p[${step.index}][y]`;
                        } else {
                            if (records[step.deltaIndex - 1] != null) {
                                code = code + (records[step.index - 1].y - records[step.deltaIndex - 1].y).toString();
                            } else {
                                code = code + records[step.index - 1].y.toString();
                            }
                        }
                        break;

                    case GenerateActions.Pointc:
                        if (step.index == 'n') {
                            code = code + '$p[n][c]';
                        } else if (records[step.index - 1] == null) {
                            code = code + `$p[${step.index}][c]`;
                        } else {
                            const cNative = records[step.index - 1].cNative;
                            let c: string;
                            switch (step.format) {
                                case ColorFormat.Dec:
                                    c = cNative.toString();
                                    break;
                                case ColorFormat.LowerHex:
                                    c = `000000${cNative.toString(16).slice(0, -2)}`.slice(-6).toLowerCase();
                                    break;
                                case ColorFormat.UpperHex:
                                    c = `000000${cNative.toString(16).slice(0, -2)}`.slice(-6).toUpperCase();
                                    break;
                                case ColorFormat.Rgb:
                                    const rgba = Jimp.intToRGBA(cNative);
                                    c = `${rgba.r},${rgba.g},${rgba.b}`;
                                    break;
                            }
                            code = code + c;
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
                }
            }

            return code;
        },
    },
});
