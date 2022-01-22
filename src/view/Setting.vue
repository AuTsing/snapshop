<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRaw } from 'vue';
import { useStore } from '../store';
import { debouncedWatch, promiseTimeout } from '@vueuse/core';
import { useAxios, PluginName, UsableApis } from '../plugins/Axios';
import { defaultConfiguration, IConfigurationState, LoadCaptureMode, ColorMode } from '../store/Configuration';
import ResetButtonVue from '../shared/ResetButton.vue';

import { AppstoreAddOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const store = useStore();
const axios = useAxios();

const configurationModelRef = reactive<IConfigurationState>(Object.assign({}, store.state.configuration));
const loadingOtherCaptureMode = ref<boolean>(false);
const loadCaptureModeTouchspriteUsable = ref<boolean>(false);
const usableLoadCaptureMode = computed(() => {
    const mode: { value: LoadCaptureMode }[] = [];
    mode.push({ value: LoadCaptureMode.fromApi1 });
    mode.push({ value: LoadCaptureMode.fromApi2 });
    mode.push({ value: LoadCaptureMode.fromApi3 });
    if (loadCaptureModeTouchspriteUsable.value) {
        mode.push({ value: LoadCaptureMode.fromTouchsrpite });
    }
    return mode;
});

const handleClickResetConfiguration = () => {
    Object.assign(configurationModelRef, defaultConfiguration);
    store.commit('resetConfiguration');
};

debouncedWatch(
    configurationModelRef,
    () => {
        const configuration = toRaw(configurationModelRef);
        for (const [key, value] of Object.entries(configuration)) {
            store.commit('setConfiguration', { key, value });
        }
        message.success('设置保存成功!');
    },
    { debounce: 500 }
);

onMounted(async () => {
    loadingOtherCaptureMode.value = true;
    let apis = [...UsableApis];
    for (let i = 0; i < 5; i++) {
        apis.map(async api => {
            try {
                const resp = await axios.ping(api.pluginName);
                if (resp.data === 'pong') {
                    apis = apis.filter(a => a !== api);
                    switch (api.pluginName) {
                        case PluginName.touchsrpite:
                            loadCaptureModeTouchspriteUsable.value = true;
                            break;
                        default:
                            break;
                    }
                }
            } catch (e) {}
        });
        await promiseTimeout(1000);
    }
    await promiseTimeout(5000);
    loadingOtherCaptureMode.value = false;
});
</script>

<template>
    <a-form :style="{ margin: '16px' }" :wrapperCol="{ span: 12 }" layout="vertical">
        <a-form-item>
            <template #label>
                <a-space>
                    <div>加载图片模式</div>
                    <a-tooltip v-if="usableLoadCaptureMode.length > 3" title="有新的模式可用"><EllipsisOutlined /></a-tooltip>
                </a-space>
            </template>
            <a-select v-model:value="configurationModelRef.loadCaptureMode" :options="usableLoadCaptureMode" :loading="loadingOtherCaptureMode">
                <template v-if="!loadingOtherCaptureMode && usableLoadCaptureMode.length > 3" #suffixIcon><AppstoreAddOutlined /></template>
            </a-select>
        </a-form-item>
        <a-form-item label="加载图片接口1">
            <a-input v-model:value="configurationModelRef.loadCaptureApi1" allowClear />
        </a-form-item>
        <a-form-item label="加载图片接口2">
            <a-input v-model:value="configurationModelRef.loadCaptureApi2" allowClear />
        </a-form-item>
        <a-form-item label="加载图片接口3">
            <a-input v-model:value="configurationModelRef.loadCaptureApi3" allowClear />
        </a-form-item>
        <a-form-item label="颜色模式">
            <a-select v-model:value="configurationModelRef.colorMode">
                <a-select-option v-for="option in ColorMode" :value="option">{{ option }}</a-select-option>
            </a-select>
        </a-form-item>
        <a-form-item label="预览显示相同颜色的像素点">
            <a-switch v-model:checked="configurationModelRef.showSameCoordinate" />
        </a-form-item>
        <a-form-item>
            <ResetButtonVue :handleClick="handleClickResetConfiguration" />
        </a-form-item>
    </a-form>
</template>

<style scoped></style>
