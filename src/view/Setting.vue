<script setup lang="ts">
import { reactive, toRaw, watch } from 'vue';
import { useStore } from '../store';
import { debouncedWatch } from '@vueuse/core';
import { Form, message } from 'ant-design-vue';
import { defaultConfiguration, IConfigurationState } from '../store/Configuration';
import { LoadCaptureMode } from '../store/Configuration';

const { useForm } = Form;

const store = useStore();

const configurationModelRef = reactive<IConfigurationState>({
    loadCaptureMode: store.state.configuration.loadCaptureMode,
    link: store.state.configuration.link,
    httpApi: store.state.configuration.httpApi,
});
const configurationRulesRef = reactive({});
const { resetFields, validate } = useForm(configurationModelRef);

const handleClickResetConfiguration = () => {
    for (const [key, value] of Object.entries(defaultConfiguration)) {
        configurationModelRef[key] = value;
    }
    store.commit('resetConfiguration');
};

debouncedWatch(
    configurationModelRef,
    () => {
        const configuration = toRaw(configurationModelRef);
        store.commit('setConfiguration', { key: 'loadCaptureMode', value: configuration.loadCaptureMode });
        store.commit('setConfiguration', { key: 'link', value: configuration.link });
        store.commit('setConfiguration', { key: 'httpApi', value: configuration.httpApi });
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
            <a-input v-model:value="configurationModelRef.link" />
        </a-form-item>
        <a-form-item label="HttpAPI">
            <a-input v-model:value="configurationModelRef.httpApi" />
        </a-form-item>
    </a-form>
    <a-button :style="{ margin: '0 16px' }" @click="handleClickResetConfiguration">RESET</a-button>
</template>

<style scoped></style>
