import { defineStore } from 'pinia';
import { discover } from '../workers/discover_api';

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
                    return api.url;
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

            Promise.allSettled(
                [26000, 26001, 26002]
                    .map(port => `http://localhost:${port}/get-api`)
                    .map(async it => {
                        const r = await discover(it);
                        if (r !== null) {
                            this.addApi(r.title, r.url);
                        }
                    }),
            ).then(() => {
                this.loadingApis = false;
            });
        },
    },
});
