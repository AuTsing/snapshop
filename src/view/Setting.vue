<script setup lang="ts">
import { reactive, toRaw, watch } from 'vue';
import { useStore } from '../store';
import { debouncedWatch } from '@vueuse/core';
import { message } from 'ant-design-vue';
import { defaultConfiguration, IConfigurationState, LoadCaptureMode, ColorMode } from '../store/Configuration';
import ResetButtonVue from '../shared/ResetButton.vue';

const store = useStore();

const configurationModelRef = reactive<IConfigurationState>(Object.assign({}, store.state.configuration));

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
</script>

<template>
    <a-form :style="{ margin: '16px' }" :wrapperCol="{ span: 12 }" layout="vertical">
        <a-form-item label="加载图片模式">
            <a-select v-model:value="configurationModelRef.loadCaptureMode">
                <a-select-option v-for="option in LoadCaptureMode" :value="option">{{ option }}</a-select-option>
            </a-select>
        </a-form-item>
        <a-form-item label="链接">
            <a-input v-model:value="configurationModelRef.link" allowClear />
        </a-form-item>
        <a-form-item label="HttpAPI">
            <a-input v-model:value="configurationModelRef.httpApi" allowClear />
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
