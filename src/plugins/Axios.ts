import { App, Plugin, getCurrentInstance } from 'vue';
import { default as AxiosStatic, AxiosInstance } from 'axios';

export enum PluginName {
    touchsrpite = 'touchsprite',
}

export interface IPluginApi {
    pluginName: PluginName;
    baseURL: string;
}

export const UsableApis: IPluginApi[] = [{ pluginName: PluginName.touchsrpite, baseURL: 'http://localhost:40001/api/' }];

class Axios {
    private readonly axios: AxiosInstance;

    constructor() {
        this.axios = AxiosStatic.create({ timeout: 5000 });
    }

    public ping(name: PluginName) {
        const plugin = UsableApis.find(api => api.pluginName === name)!;
        return this.axios.get<string>('/ping', { baseURL: plugin.baseURL });
    }

    public snap(name: PluginName) {
        const plugin = UsableApis.find(api => api.pluginName === name)!;
        return this.axios.get<ArrayBuffer>('/snap', { baseURL: plugin.baseURL, responseType: 'arraybuffer' });
    }
}

export const axios: Plugin = {
    install: (app: App) => {
        const instance = new Axios();
        app.config.globalProperties.$axios = instance;
    },
};

export const useAxios: () => Axios = () => getCurrentInstance()?.appContext.config.globalProperties.$axios;
