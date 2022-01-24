import { defineStore } from 'pinia';
import { useDisk } from '../plugins/Disk';
import { UsableApis, PluginName } from '../plugins/Axios';

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
    fromTouchsrpite = '从触动插件接口加载',
}

export interface IConfigurationState {
    loadCaptureMode: LoadCaptureMode;
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
    state: (): IConfigurationState => {
        const defaultConfigurationCopy = Object.assign({}, defaultConfiguration);
        const state = useDisk().useStorage('configuration', defaultConfigurationCopy);
        Object.assign(defaultConfigurationCopy, state.value);
        Object.assign(state.value, defaultConfigurationCopy);
        return state.value;
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
                case LoadCaptureMode.fromTouchsrpite:
                    return UsableApis.find(api => api.pluginName === PluginName.touchsrpite)!.baseURL + 'snap';
                default:
                    return '';
            }
        },
    },
    actions: {
        resetConfiguration() {
            this.$patch(defaultConfiguration);
        },
        useNextLoadCaptureMode() {
            const modes = [LoadCaptureMode.fromApi1, LoadCaptureMode.fromApi2, LoadCaptureMode.fromApi3];
            let nextMode: LoadCaptureMode;
            if (modes.includes(this.loadCaptureMode)) {
                nextMode = modes[modes.indexOf(this.loadCaptureMode) + 1] ?? LoadCaptureMode.fromApi1;
            } else {
                nextMode = LoadCaptureMode.fromApi1;
            }
            this.loadCaptureMode = nextMode;
        },
    },
});
