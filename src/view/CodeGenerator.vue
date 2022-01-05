<script setup lang="ts">
import { reactive, toRaw } from 'vue';
import { useStore } from '../store';
import { debouncedWatch } from '@vueuse/core';
import { message } from 'ant-design-vue';
import { defaultCode } from '../store/Code';
import type { ICodeState } from '../store/Code';
import ResetButtonVue from '../shared/ResetButton.vue';
import { useControlCv } from '../plugins/ControlCv';

const store = useStore();
const controlCv = useControlCv();

const codeModelRef = reactive<ICodeState>(Object.assign({}, store.state.code));

const handleClickResetCode = () => {
    Object.assign(codeModelRef, defaultCode);
    store.commit('resetCode');
};
const handleClickGenerateCode = async (i: number) => {
    const code = await store.dispatch('generate', i);
    controlCv.ctrlC(code);
};

debouncedWatch(
    codeModelRef,
    () => {
        const code = toRaw(codeModelRef);
        for (const [key, value] of Object.entries(code)) {
            store.commit('setCode', { key, value });
        }
        message.success('设置保存成功!');
    },
    { debounce: 500 }
);
</script>

<template>
    <a-form :style="{ margin: '16px' }" layout="vertical">
        <a-form-item v-for="i in 5" :label="`模板${i}`">
            <a-row :gutter="8">
                <a-col :span="12">
                    <a-input v-model:value="codeModelRef[`template${i}` as keyof ICodeState]" />
                </a-col>
                <a-col>
                    <a-button @click="() => handleClickGenerateCode(i)">生成代码</a-button>
                </a-col>
            </a-row>
        </a-form-item>
        <a-form-item label="正则表达式">
            <a-input-group compact>
                <a-input v-model:value="codeModelRef.regexp" style="width: 25%" placeholder="正则表达式" />
                <a-input v-model:value="codeModelRef.regexpReplacement" style="width: 25%" placeholder="替换为" />
            </a-input-group>
        </a-form-item>
        <a-form-item>
            <ResetButtonVue :handleClick="handleClickResetCode" />
        </a-form-item>
    </a-form>
</template>

<style scoped></style>
