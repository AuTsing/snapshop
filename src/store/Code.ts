import { defineStore } from 'pinia';
import { intToRGBA } from 'jimp/browser/lib/jimp';
import { useRecordStore } from './Record';
import { useAreaStore } from './Area';
import { useStorage } from '../plugins/Storage';

export const GenerateActions = {
    Text: 'text',
    Pointx: 'pointx',
    Pointy: 'pointy',
    Pointc: 'pointc',
    Area: 'area',
    Repeat: 'repeat',
    Delete: 'delete',
} as const;

export type GenerateActions = (typeof GenerateActions)[keyof typeof GenerateActions];

export const AreaLtrb = {
    Left: 'left',
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
} as const;

export type AreaLtrb = (typeof AreaLtrb)[keyof typeof AreaLtrb];

export const ColorFormat = {
    Dec: 'dec',
    UpperHex: 'upperHex',
    LowerHex: 'lowerHex',
    Rgb: 'rgb',
} as const;

export type ColorFormat = (typeof ColorFormat)[keyof typeof ColorFormat];

export type GenerateStep =
    | TextGenerateStep
    | PointxGenerateStep
    | PointyGenerateStep
    | PointcGenerateStep
    | AreaGenerateStep
    | ReapeatGenerateStep
    | DeleteGenerateStep;

export type TextGenerateStep = {
    action: 'text';
    text: string;
};

export type PointxGenerateStep = {
    action: 'pointx';
    index: number | 'n';
    deltaIndex: number;
};

export type PointyGenerateStep = {
    action: 'pointy';
    index: number | 'n';
    deltaIndex: number;
};

export type PointcGenerateStep = {
    action: 'pointc';
    index: number | 'n';
    format: ColorFormat;
};

export type AreaGenerateStep = {
    action: 'area';
    ltrb: AreaLtrb;
};

export type ReapeatGenerateStep = {
    action: 'repeat';
    steps: number;
    from: number | 'n';
    to: number | 'n';
};

export type DeleteGenerateStep = {
    action: 'delete';
    count: number;
};

export type GenerateFlow = GenerateStep[];

export interface CodeState {
    flow1: GenerateFlow;
    flow2: GenerateFlow;
    flow3: GenerateFlow;
    flow4: GenerateFlow;
    flow5: GenerateFlow;
    flow6: GenerateFlow;
    flow7: GenerateFlow;
    flow8: GenerateFlow;
    flow9: GenerateFlow;
    flow10: GenerateFlow;
}

export type CodeStateName = keyof CodeState;

export const defaultCode: CodeState = {
    flow1: [
        { action: GenerateActions.Text, text: `{'undefined',{` },
        { action: GenerateActions.Text, text: `{` },
        { action: GenerateActions.Pointx, index: 'n', deltaIndex: 0 },
        { action: GenerateActions.Text, text: `,` },
        { action: GenerateActions.Pointy, index: 'n', deltaIndex: 0 },
        { action: GenerateActions.Text, text: `,0x` },
        { action: GenerateActions.Pointc, index: 'n', format: ColorFormat.LowerHex },
        { action: GenerateActions.Text, text: `},` },
        { action: GenerateActions.Repeat, steps: 7, from: 1, to: 'n' },
        { action: GenerateActions.Text, text: `},},` },
    ],
    flow2: [
        { action: GenerateActions.Text, text: `{'undefined',` },
        { action: GenerateActions.Text, text: `{0x` },
        { action: GenerateActions.Pointc, index: 1, format: ColorFormat.LowerHex },
        { action: GenerateActions.Text, text: `,'` },
        { action: GenerateActions.Pointx, index: 'n', deltaIndex: 1 },
        { action: GenerateActions.Text, text: `|` },
        { action: GenerateActions.Pointy, index: 'n', deltaIndex: 1 },
        { action: GenerateActions.Text, text: `|0x` },
        { action: GenerateActions.Pointc, index: 'n', format: ColorFormat.LowerHex },
        { action: GenerateActions.Text, text: `,` },
        { action: GenerateActions.Repeat, steps: 6, from: 2, to: 'n' },
        { action: GenerateActions.Delete, count: 1 },
        { action: GenerateActions.Text, text: `'},` },
        { action: GenerateActions.Text, text: `}, ` },
    ],
    flow3: [],
    flow4: [],
    flow5: [],
    flow6: [],
    flow7: [],
    flow8: [],
    flow9: [],
    flow10: [],
};

export async function readFileToText(file: File): Promise<string> {
    const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(`不支持的文件内容: ${reader.result}`);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
    return text;
}

export const useCodeStore = defineStore('code', {
    state: () => {
        const storage = useStorage();
        return {
            flow1: storage.useState('flow1', defaultCode.flow1),
            flow2: storage.useState('flow2', defaultCode.flow2),
            flow3: storage.useState('flow3', defaultCode.flow3),
            flow4: storage.useState('flow4', defaultCode.flow4),
            flow5: storage.useState('flow5', defaultCode.flow5),
            flow6: storage.useState('flow6', defaultCode.flow6),
            flow7: storage.useState('flow7', defaultCode.flow7),
            flow8: storage.useState('flow8', defaultCode.flow8),
            flow9: storage.useState('flow9', defaultCode.flow9),
            flow10: storage.useState('flow10', defaultCode.flow10),
        };
    },
    actions: {
        setFlow(flowName: CodeStateName, flow: GenerateFlow) {
            this[flowName] = flow;
        },
        resetFlow(flowName: CodeStateName) {
            const flow = Array.from(defaultCode[flowName]);
            this[flowName] = flow;
        },
        addStep(flowName: CodeStateName, toStep: number, step: GenerateStep) {
            this[flowName].splice(toStep - 1, 0, step);
        },
        removeStep(flowName: CodeStateName, index: number) {
            this[flowName].splice(index, 1);
        },
        generate(flowName: CodeStateName): string {
            const record = useRecordStore();
            const area = useAreaStore();
            const records = record.records.filter(record => record.cNative !== -1);
            const flow = Array.from(this[flowName]);

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
                            if (
                                clone.action === GenerateActions.Pointx ||
                                clone.action === GenerateActions.Pointy ||
                                clone.action === GenerateActions.Pointc
                            ) {
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
                        if (step.index === 'n') {
                            code = code + '$p[n][x]';
                        } else if (records[step.index - 1] === undefined) {
                            code = code + `$p[${step.index}][x]`;
                        } else {
                            if (records[step.deltaIndex - 1] !== undefined) {
                                code = code + (records[step.index - 1].x - records[step.deltaIndex - 1].x).toString();
                            } else {
                                code = code + records[step.index - 1].x.toString();
                            }
                        }
                        break;

                    case GenerateActions.Pointy:
                        if (step.index === 'n') {
                            code = code + '$p[n][x]';
                        } else if (records[step.index - 1] === undefined) {
                            code = code + `$p[${step.index}][y]`;
                        } else {
                            if (records[step.deltaIndex - 1] !== undefined) {
                                code = code + (records[step.index - 1].y - records[step.deltaIndex - 1].y).toString();
                            } else {
                                code = code + records[step.index - 1].y.toString();
                            }
                        }
                        break;

                    case GenerateActions.Pointc:
                        if (step.index === 'n') {
                            code = code + '$p[n][c]';
                        } else if (records[step.index - 1] === undefined) {
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
                                    const rgba = intToRGBA(cNative);
                                    c = `${rgba.r},${rgba.g},${rgba.b}`;
                                    break;
                                default:
                                    throw Error('Unknown ColorFormat:', step.format);
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
