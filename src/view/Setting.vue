<script setup lang="ts">
import { computed, onMounted, reactive, toRaw } from 'vue';
import { useConfigurationStore, defaultConfiguration, IConfigurationState, LoadCaptureMode, ColorMode } from '../store/Configuration';
import { useLoadCaptureApiStore } from '../store/LoadCaptureApi';
import { debouncedWatch } from '@vueuse/core';
import ResetButtonVue from '../shared/ResetButton.vue';

import { AppstoreAddOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const configurationStore = useConfigurationStore();
const loadCaptureApiStore = useLoadCaptureApiStore();

const configurationModelRef = reactive<IConfigurationState>(Object.assign({}, configurationStore.$state));
const loadingOtherCaptureMode = computed<boolean>(() => loadCaptureApiStore.loadingApis);
const usableLoadCaptureMode = computed<{ value: string }[]>(() => {
    const modes: { value: string }[] = [{ value: LoadCaptureMode.fromApi1 }, { value: LoadCaptureMode.fromApi2 }, { value: LoadCaptureMode.fromApi3 }];
    const externalModes = loadCaptureApiStore.apis.map(api => ({ value: api.title }));
    return modes.concat(externalModes);
});

const handleClickResetConfiguration = () => {
    Object.assign(configurationModelRef, defaultConfiguration);
    configurationStore.resetConfiguration();
};

debouncedWatch(
    configurationModelRef,
    () => {
        const configuration = toRaw(configurationModelRef);
        configurationStore.$patch(configuration);
        message.success('设置保存成功!');
    },
    { debounce: 500 }
);

onMounted(() => {
    if (!loadCaptureApiStore.loadingApis) {
        loadCaptureApiStore.loadApis();
    }
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
