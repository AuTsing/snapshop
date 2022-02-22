import { defineStore } from 'pinia';

export interface ILoadCaptureApi {
    title: string;
    url: string;
}

export interface ILoadCaptureApiState {
    apis: ILoadCaptureApi[];
}

export const useLoadCaptureApi = defineStore('loadCaptureApi', {
    state: (): ILoadCaptureApiState => ({ apis: [] }),
    getters: {
        snapUrl(): (title: string) => string {
            const apis = this.apis;
            return title => {
                const api = apis.find(api => api.title === title);
                if (api) {
                    return api.url + '/snap';
                } else {
                    return '';
                }
            };
        },
    },
    actions: {
        addApi(title: string, url: string) {
            if (this.apis.find(api => api.title === title)) {
                return;
            }
            this.apis.push({ title, url });
        },
    },
});
