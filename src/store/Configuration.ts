import { Module } from 'vuex';
import { IRootState } from '.';
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

const Configuration: Module<IConfigurationState, IRootState> = {
    state: () => {
        const defaultConfigurationCopy = Object.assign({}, defaultConfiguration);
        const state = useDisk().useStorage('configuration', defaultConfigurationCopy);
        Object.assign(defaultConfigurationCopy, state.value);
        Object.assign(state.value, defaultConfigurationCopy);
        return state.value;
    },
    getters: {
        usingApi: state => {
            switch (state.loadCaptureMode) {
                case LoadCaptureMode.fromApi1:
                    return state.loadCaptureApi1;
                case LoadCaptureMode.fromApi2:
                    return state.loadCaptureApi2;
                case LoadCaptureMode.fromApi3:
                    return state.loadCaptureApi3;
                case LoadCaptureMode.fromTouchsrpite:
                    return UsableApis.find(api => api.pluginName === PluginName.touchsrpite)!.baseURL + 'snap';
                default:
                    return '';
            }
        },
    },
    mutations: {
        setConfiguration: <T extends keyof IConfigurationState>(state: IConfigurationState, { key, value }: { key: T; value: IConfigurationState[T] }) => {
            state[key] = value;
        },
        resetConfiguration: state => {
            Object.assign(state, defaultConfiguration);
        },
    },
    actions: {
        useNextLoadCaptureMode: ({ state, commit }) => {
            const modes = [LoadCaptureMode.fromApi1, LoadCaptureMode.fromApi2, LoadCaptureMode.fromApi3];
            let nextMode: LoadCaptureMode;
            if (modes.includes(state.loadCaptureMode)) {
                nextMode = modes[modes.indexOf(state.loadCaptureMode) + 1] ?? LoadCaptureMode.fromApi1;
            } else {
                nextMode = LoadCaptureMode.fromApi1;
            }
            commit('setConfiguration', { key: 'loadCaptureMode', value: nextMode });
        },
    },
};

export default Configuration;
