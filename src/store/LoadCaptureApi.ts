import { defineStore } from 'pinia';

import ApiSearcher from '../workers/ApiSearcher?worker&inline';

export interface ILoadCaptureApi {
    title: string;
    url: string;
}

export interface ILoadCaptureApiState {
    apis: ILoadCaptureApi[];
    loadingApis: boolean;
    loadedApis: boolean;
}

export const useLoadCaptureApiStore = defineStore('loadCaptureApi', {
    state: (): ILoadCaptureApiState => ({
        apis: [],
        loadingApis: false,
        loadedApis: false,
    }),
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
        loadApis() {
            this.loadedApis = true;
            this.loadingApis = true;
            const apiSearcher = new ApiSearcher();
            apiSearcher.onmessage = ev => {
                if (ev.data === 'done') {
                    this.loadingApis = false;
                    return;
                }

                if (ev.data.title && ev.data.url) {
                    this.addApi(ev.data.title, ev.data.url);
                    return;
                }
            };
        },
    },
});
