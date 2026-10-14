export interface Api {
    title: string;
    url: string;
}

export interface GetApiRespData {
    code: number;
    message: string;
    data: Api;
}

export async function discover(url: string): Promise<Api | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);

    try {
        const resp = await fetch(url, { signal: controller.signal });

        if (!resp.ok) {
            return null;
        }

        const respData = (await resp.json()) as GetApiRespData;

        if (respData.code !== 0) {
            return null;
        }

        const api = respData.data;

        return api;
    } catch (e) {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}
