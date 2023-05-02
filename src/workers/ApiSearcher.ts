import { promiseTimeout } from '@vueuse/core';
import Axios from 'axios';

(async () => {
    const axios = Axios.create({ timeout: 5000 });

    let port = 26000;
    let urls = Array.from(Array(10), () => port++).map(port => `http://localhost:${++port}/api`);
    for (let i = 0; i < 5; i++) {
        urls.forEach(url => {
            axios
                .get(url + '/ping')
                .then(resp => {
                    if (resp.data === 'pong') {
                        return axios.get(url + '/title');
                    } else {
                        throw new Error('no pong');
                    }
                })
                .then(resp => {
                    if (resp.data) {
                        const title = resp.data;
                        self.postMessage({ title, url });
                    }
                })
                .then(() => (urls = urls.filter(u => u !== url)))
                .catch(e => {});
        });
        await promiseTimeout(1000);
    }
    await promiseTimeout(5000);

    self.postMessage('done');
    self.close();
})();
