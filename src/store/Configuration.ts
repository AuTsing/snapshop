import { Module } from 'vuex';
import { IRootState } from '.';
import { useStorage } from '@vueuse/core';

export enum LoadCaptureMode {
    fromLink = '从链接加载',
    fromHttpApi = '从HttpAPI加载',
}

export interface IConfigurationState {
    loadCaptureMode: LoadCaptureMode;
    link: string;
    httpApi: string;
    [key: string]: any;
}

export const defaultConfiguration: IConfigurationState = {
    loadCaptureMode: LoadCaptureMode.fromLink,
    link: '',
    httpApi: '',
};

const state = useStorage('configuration', defaultConfiguration);
const Configuration: Module<IConfigurationState, IRootState> = {
    state: () => state.value,
    mutations: {
        setConfiguration: (state, { key, value }: { key: string; value: any }) => {
            state[key] = value;
        },
        resetConfiguration: state => {
            for (const [key, value] of Object.entries(defaultConfiguration)) {
                state[key] = value;
            }
        },
    },
};

export default Configuration;
