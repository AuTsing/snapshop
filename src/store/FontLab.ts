import { defineStore } from 'pinia';
import { useRecordStore } from './Record';
import { useAreaStore } from './Area';
import { useCaptureStore } from './Capture';
import Jimp from 'jimp/browser/lib/jimp';
import { displayColor } from './Coordinate';
import { ColorMode } from './Configuration';

export enum ICastMode {
    auto = '自动生成',
    custom = '自定义',
}

export interface IFontLabState {
    tolerance: number;
    customCast: string;
    castMode: ICastMode;
    previewJimp?: Jimp;
    previewBase64: string;
    fonts: IFont[];
}

export interface IFont {
    key: string;
    definition: string;
    code: string;
}

export type TCastRgb = {
    r: number[];
    g: number[];
    b: number[];
};

export const useFontLabStore = defineStore('fontLab', {
    state: (): IFontLabState => ({
        tolerance: 0,
        customCast: '',
        castMode: ICastMode.auto,
        previewJimp: undefined,
        previewBase64: '',
        fonts: [],
    }),
    getters: {
        castRgb(): TCastRgb {
            const record = useRecordStore();
            const rgbs = record.records
                .map(record => Jimp.intToRGBA(record.cNative))
                .reduce(
                    (last: TCastRgb, rgb) => {
                        last.r.push(rgb.r);
                        last.g.push(rgb.g);
                        last.b.push(rgb.b);
                        return last;
                    },
                    { r: [], g: [], b: [] }
                );
            const range = {
                r: [Math.min(...rgbs.r), Math.max(...rgbs.r)],
                g: [Math.min(...rgbs.g), Math.max(...rgbs.g)],
                b: [Math.min(...rgbs.b), Math.max(...rgbs.b)],
            };
            const castRgb: TCastRgb = {
                r: [Math.floor((range.r[0] + range.r[1]) / 2), Math.ceil((range.r[1] - range.r[0]) / 2) || 1],
                g: [Math.floor((range.g[0] + range.g[1]) / 2), Math.ceil((range.g[1] - range.g[0]) / 2) || 1],
                b: [Math.floor((range.b[0] + range.b[1]) / 2), Math.ceil((range.b[1] - range.b[0]) / 2) || 1],
            };
            const castRgbTolerance = {
                r: castRgb.r[0] + this.tolerance > 255 ? 255 - castRgb.r[0] : this.tolerance,
                g: castRgb.g[0] + this.tolerance > 255 ? 255 - castRgb.g[0] : this.tolerance,
                b: castRgb.b[0] + this.tolerance > 255 ? 255 - castRgb.b[0] : this.tolerance,
            };
            const castRgbWithTolerance: TCastRgb = {
                r: [castRgb.r[0] + castRgbTolerance.r, castRgb.r[1] + castRgbTolerance.r],
                g: [castRgb.g[0] + castRgbTolerance.g, castRgb.g[1] + castRgbTolerance.g],
                b: [castRgb.b[0] + castRgbTolerance.b, castRgb.b[1] + castRgbTolerance.b],
            };
            return castRgbWithTolerance;
        },
        cast(): string {
            const record = useRecordStore();
            if (record.records.length > 0) {
                const castRgb = this.castRgb;

                const cast1 = Jimp.rgbaToInt(castRgb.r[0], castRgb.g[0], castRgb.b[0], 255);
                const cast2 = Jimp.rgbaToInt(castRgb.r[1], castRgb.g[1], castRgb.b[1], 255);
                const c1 = displayColor(cast1, ColorMode.hex).toUpperCase();
                const c2 = displayColor(cast2, ColorMode.hex).toUpperCase();
                return `${c1} , ${c2}`;
            } else {
                return '';
            }
        },
        customCastRgb(): TCastRgb {
            if (this.customCast === '') {
                return { r: [], g: [], b: [] } as TCastRgb;
            }
            const hex1 = parseInt(this.customCast.slice(0, 6), 16);
            const hex2 = parseInt(this.customCast.slice(-6), 16);
            const rgba1 = Jimp.intToRGBA(hex1);
            const rgba2 = Jimp.intToRGBA(hex2);
            const customCastRgb: TCastRgb = {
                r: [rgba1.r, rgba2.r],
                g: [rgba1.g, rgba2.g],
                b: [rgba1.b, rgba2.b],
            };
            return customCastRgb;
        },
    },
    actions: {
        addFont(font: IFont) {
            this.fonts.push(font);
        },
        removeFont(key: string) {
            const filtered = this.fonts.filter(font => font.key !== key);
            const recognized = filtered.map((font, i) => ({ ...font, key: i.toString() }));
            this.fonts = recognized;
        },
        async updateFontLabPreview() {
            const record = useRecordStore();
            const area = useAreaStore();
            const capture = useCaptureStore();

            if (record.records.length === 0 || Object.values(area).some(p => p === -1)) {
                this.previewJimp = undefined;
                this.previewBase64 = '';
                return;
            }
            const rgb: TCastRgb = this.castMode === ICastMode.custom && this.customCast !== '' ? this.customCastRgb : this.castRgb;
            const calcRgb: TCastRgb = {
                r: [rgb.r[0] - rgb.r[1], rgb.r[0] + rgb.r[1]],
                g: [rgb.g[0] - rgb.g[1], rgb.g[0] + rgb.g[1]],
                b: [rgb.b[0] - rgb.b[1], rgb.b[0] + rgb.b[1]],
            };
            const activeJimp: Jimp = capture.activeJimp;
            const xMin = Math.min(area.x1, area.x2);
            const yMin = Math.min(area.y1, area.y2);
            const xD = Math.abs(area.x1 - area.x2);
            const yD = Math.abs(area.y1 - area.y2);
            const jimp = new Jimp(xD + 1, yD + 1, 0);
            jimp.scan(0, 0, jimp.bitmap.width, jimp.bitmap.height, (x, y) => {
                const rgba = Jimp.intToRGBA(activeJimp.getPixelColor(x + xMin, y + yMin));
                if (
                    calcRgb.r[0] <= rgba.r &&
                    calcRgb.r[1] >= rgba.r &&
                    calcRgb.g[0] <= rgba.g &&
                    calcRgb.g[1] >= rgba.g &&
                    calcRgb.b[0] <= rgba.b &&
                    calcRgb.b[1] >= rgba.b
                ) {
                    jimp.setPixelColor(0x000000ff, x, y);
                } else {
                    jimp.setPixelColor(0xffffffff, x, y);
                }
            });
            const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
            this.previewJimp = jimp;
            this.previewBase64 = base64;
        },
    },
});
