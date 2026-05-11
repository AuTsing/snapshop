import { promiseTimeout } from '@vueuse/core';

interface Api {
    title: string;
    url: string;
}

const port = 26000;
const urls = Array.from(Array(10), (_, i) => port + i).map(port => `http://localhost:${port}/get-api`);

for (const url of urls) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    try {
        const resp = await fetch(url, { signal: controller.signal });
        if (!resp.ok) {
            throw Error(`Http failed: ${resp.status}`);
        }
        const api = (await resp.json()) as Api;
        self.postMessage(api);
    } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
        } else {
            console.error(e);
        }
    } finally {
        clearTimeout(timeout);
    }
}

await promiseTimeout(1000);
self.postMessage('done');
self.close();
