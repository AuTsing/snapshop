import { defineStore } from 'pinia';
import { useConfigurationStore } from './Configuration';
import { useCaptureStore } from './Capture';
import Jimp from 'jimp/browser/lib/jimp';
import { ColorMode } from './Configuration';

export interface ICoordinateState {
    x: number;
    y: number;
}

export function displayColor(c: number, mode: ColorMode): string {
    switch (mode) {
        case ColorMode.dec:
            return c.toString();
        case ColorMode.hex:
            return `000000${c.toString(16).slice(0, -2)}`.slice(-6);
        case ColorMode.hexWith0x:
            return '0x' + `000000${c.toString(16).slice(0, -2)}`.slice(-6);
        case ColorMode.hexWithPound:
            return '#' + `000000${c.toString(16).slice(0, -2)}`.slice(-6);
        case ColorMode.rgb:
            const rgba = Jimp.intToRGBA(c);
            return `${rgba.r},${rgba.g},${rgba.b}`;
    }
}

export const useCoordinateStore = defineStore('coordinate', {
    state: (): ICoordinateState => ({
        x: -1,
        y: -1,
    }),
    getters: {
        cNative(): number {
            const capture = useCaptureStore();
            if (this.x > -1 && this.y > -1) {
                const jimp = capture.activeJimp;
                const c = jimp.getPixelColor(this.x, this.y);
                return c;
            } else {
                return -1;
            }
        },
        c(): () => string {
            const configuration = useConfigurationStore();
            return (mode: ColorMode = configuration.colorMode) => {
                const cNative: number = this.cNative;
                if (cNative === -1) {
                    return '-1';
                }
                const display = displayColor(cNative, mode);
                return display;
            };
        },
        xyLegal(): (x?: number, y?: number) => boolean {
            const capture = useCaptureStore();
            return (x?: number, y?: number) => {
                x = x ?? this.x;
                y = y ?? this.y;
                if (x < 0 || y < 0) {
                    return false;
                } else {
                    const jimp: Jimp = capture.activeJimp;
                    if (!jimp || x > jimp.bitmap.width - 1 || y > jimp.bitmap.height - 1) {
                        return false;
                    } else {
                        return true;
                    }
                }
            };
        },
    },
    actions: {
        updateCoordinate(x: number, y: number) {
            this.x = x;
            this.y = y;
        },
        resetCoordinate() {
            this.x = -1;
            this.y = -1;
        },
    },
});
