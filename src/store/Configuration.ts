import { defineStore } from 'pinia';
import { useDisk } from '../plugins/Disk';
import { useLoadCaptureApi } from './LoadCaptureApi';

export enum ColorMode {
    dec = '十进制',
    hex = '十六进制',
    hexWith0x = '0x前缀十六进制',
    hexWithPound = '#前缀十六进制',
    rgb = 'RGB',
}

export enum LoadCaptureMode {
    fromApi1 = '从接口1加载',
    fromApi2 = '从接口2加载',
    fromApi3 = '从接口3加载',
}

export interface IConfigurationState {
    loadCaptureMode: string;
    loadCaptureApi1: string;
    loadCaptureApi2: string;
    loadCaptureApi3: string;
    colorMode: ColorMode;
    showSameCoordinate: boolean;
}

export const defaultConfiguration: IConfigurationState = {
    loadCaptureMode: LoadCaptureMode.fromApi1,
    loadCaptureApi1: '',
    loadCaptureApi2: '',
    loadCaptureApi3: '',
    colorMode: ColorMode.hexWith0x,
    showSameCoordinate: false,
};

export const useConfigurationStore = defineStore('configuration', {
    state: () => {
        const disk = useDisk();
        return {
            loadCaptureMode: disk.useStorage('loadCaptureMode', defaultConfiguration.loadCaptureMode),
            loadCaptureApi1: disk.useStorage('loadCaptureApi1', defaultConfiguration.loadCaptureApi1),
            loadCaptureApi2: disk.useStorage('loadCaptureApi2', defaultConfiguration.loadCaptureApi2),
            loadCaptureApi3: disk.useStorage('loadCaptureApi3', defaultConfiguration.loadCaptureApi3),
            colorMode: disk.useStorage('colorMode', defaultConfiguration.colorMode),
            showSameCoordinate: disk.useStorage('showSameCoordinate', defaultConfiguration.showSameCoordinate),
        };
    },
    getters: {
        usingApi(): string {
            switch (this.loadCaptureMode) {
                case LoadCaptureMode.fromApi1:
                    return this.loadCaptureApi1;
                case LoadCaptureMode.fromApi2:
                    return this.loadCaptureApi2;
                case LoadCaptureMode.fromApi3:
                    return this.loadCaptureApi3;
                default:
                    const loadCaptureApiStore = useLoadCaptureApi();
                    return loadCaptureApiStore.snapUrl(this.loadCaptureMode);
            }
        },
    },
    actions: {
        resetConfiguration() {
            this.$patch(defaultConfiguration);
        },
        useNextLoadCaptureMode() {
            const loadCaptureApiStore = useLoadCaptureApi();

            const internalModes: string[] = [LoadCaptureMode.fromApi1, LoadCaptureMode.fromApi2, LoadCaptureMode.fromApi3];
            const externalModes: string[] = loadCaptureApiStore.apis.map(api => api.title);
            const modes: string[] = internalModes.concat(externalModes);

            this.loadCaptureMode = modes[modes.indexOf(this.loadCaptureMode) + 1] ?? modes[0];
        },
    },
});
