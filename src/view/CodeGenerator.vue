<script setup lang="ts">
import { computed, reactive, ref, toRaw } from 'vue';
import { debouncedWatch } from '@vueuse/core';
import { message } from 'ant-design-vue';

import { GenerateActions, useCodeStore } from '../store/Code';
import { defaultCode } from '../store/Code';
import { AreaLtrb, ICodeState } from '../store/Code';
import { useControlCv } from '../plugins/ControlCv';
import ResetButtonVue from '../shared/ResetButton.vue';

const codeStore = useCodeStore();
const controlCv = useControlCv();

const codeModelRef = reactive<ICodeState>(Object.assign({}, codeStore.$state));
const addingGenerateAction = ref<GenerateActions>(GenerateActions.Text);
const addingTextActionText = ref<string>('');
const addingPointxActionMode = ref<'指定点' | '自动填充点 N'>('自动填充点 N');
const addingPointxActionIndex = ref<number>(1);
const addingPointyActionMode = ref<'指定点' | '自动填充点 N'>('自动填充点 N');
const addingPointyActionIndex = ref<number>(1);
const addingPointcActionMode = ref<'指定点' | '自动填充点 N'>('自动填充点 N');
const addingPointcActionIndex = ref<number>(1);
const addingAreaActionLtrb = ref<AreaLtrb>(AreaLtrb.Left);
const addingRepeatActionSteps = ref<number>(1);
const addingRepeatActionFromMode = ref<'指定开始' | '自动填充点列表长度'>('自动填充点列表长度');
const addingRepeatActionFrom = ref<number>(1);
const addingRepeatActionToMode = ref<'指定结束' | '自动填充点列表长度'>('自动填充点列表长度');
const addingRepeatActionTo = ref<number>(1);
const addingDeleteActionCount = ref<number>(1);
const flow1 = computed<string[]>(() =>
    codeModelRef.flow1.map(step => {
        switch (step.action) {
            case GenerateActions.Text:
                return `添加文本: ${step.text}`;
            case GenerateActions.Pointx:
                return `添加点 ${step.index} 的 X 值`;
            case GenerateActions.Pointy:
                return `添加点 ${step.index} 的 Y 值`;
            case GenerateActions.Pointc:
                return `添加点 ${step.index} 的 颜色值`;
            case GenerateActions.Area:
                return `添加范围 ${step.ltrb} 的值`;
            case GenerateActions.Repeat:
                return `重复以上 ${step.steps} 个步骤 从 ${step.from} 到 ${step.to}`;
            case GenerateActions.Delete:
                return `重复完成后 删除以上 ${step.count} 个步骤`;
        }
    })
);

const handleClickAddStep = () => {
    switch (addingGenerateAction.value) {
        case GenerateActions.Text:
            codeStore.addStep({ action: GenerateActions.Text, text: addingTextActionText.value });
            break;
        case GenerateActions.Pointx:
            codeStore.addStep({
                action: GenerateActions.Pointx,
                index: addingPointxActionMode.value === '指定点' ? addingPointxActionIndex.value : 'n',
            });
            break;
        case GenerateActions.Pointy:
            codeStore.addStep({
                action: GenerateActions.Pointy,
                index: addingPointyActionMode.value === '指定点' ? addingPointyActionIndex.value : 'n',
            });
            break;
        case GenerateActions.Pointc:
            codeStore.addStep({
                action: GenerateActions.Pointc,
                index: addingPointcActionMode.value === '指定点' ? addingPointcActionIndex.value : 'n',
            });
            break;
        case GenerateActions.Area:
            codeStore.addStep({
                action: GenerateActions.Area,
                ltrb: addingAreaActionLtrb.value,
            });
            break;
        case GenerateActions.Repeat:
            codeStore.addStep({
                action: GenerateActions.Repeat,
                steps: addingRepeatActionSteps.value,
                from: addingRepeatActionFromMode.value === '指定开始' ? addingRepeatActionFrom.value : 'n',
                to: addingRepeatActionToMode.value === '指定结束' ? addingRepeatActionTo.value : 'n',
            });
            break;
        case GenerateActions.Delete:
            codeStore.addStep({
                action: GenerateActions.Delete,
                count: addingDeleteActionCount.value,
            });
            break;
        default:
            break;
    }
};
const handleClickRemoveStep = (i: number) => {
    codeStore.removeStep(i);
};
const handleClickResetCode = () => {
    Object.assign(codeModelRef, defaultCode);
    codeStore.resetCode();
};
const handleClickGenerateCode = (i: number) => {
    const code = codeStore.generate(i);
    controlCv.ctrlC(code);
};

debouncedWatch(
    codeModelRef,
    () => {
        const code = toRaw(codeModelRef);
        codeStore.$patch(code);
        message.success('设置保存成功!');
    },
    { debounce: 500 }
);
</script>

<template>
    <a-form :style="{ margin: '16px' }" layout="vertical">
        <a-form-item :label="`流程1`">
            <a-row :gutter="8">
                <a-col :span="12">
                    <a-steps direction="vertical" size="small" :current="flow1.length">
                        <a-step v-for="(step, i) in flow1" :title="step" status="process" @click="() => handleClickRemoveStep(i)" />
                    </a-steps>
                </a-col>
                <a-col :span="12">
                    <a-space direction="vertical" style="width: 50%">
                        <a-select v-model:value="addingGenerateAction">
                            <a-select-option :value="GenerateActions.Text">文本</a-select-option>
                            <a-select-option :value="GenerateActions.Pointx">X 坐标</a-select-option>
                            <a-select-option :value="GenerateActions.Pointy">Y 坐标</a-select-option>
                            <a-select-option :value="GenerateActions.Pointc">颜色值</a-select-option>
                            <a-select-option :value="GenerateActions.Area">范围</a-select-option>
                            <a-select-option :value="GenerateActions.Repeat">重复</a-select-option>
                            <a-select-option :value="GenerateActions.Delete">删除</a-select-option>
                        </a-select>
                        <a-row v-if="addingGenerateAction === GenerateActions.Text">
                            <a-input v-model:value="addingTextActionText" placeholder="添加文本" allowClear />
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Pointx">
                            <a-input-number v-model:value="addingPointxActionIndex" :min="1" :max="20" :disabled="addingPointxActionMode === '自动填充点 N'">
                                <template #addonBefore>
                                    <a-select v-model:value="addingPointxActionMode">
                                        <a-select-option value="指定点">指定点</a-select-option>
                                        <a-select-option value="自动填充点 N">自动填充点 N</a-select-option>
                                    </a-select>
                                </template>
                            </a-input-number>
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Pointy">
                            <a-input-number v-model:value="addingPointyActionIndex" :min="1" :max="20" :disabled="addingPointyActionMode === '自动填充点 N'">
                                <template #addonBefore>
                                    <a-select v-model:value="addingPointyActionMode">
                                        <a-select-option value="指定点">指定点</a-select-option>
                                        <a-select-option value="自动填充点 N">自动填充点 N</a-select-option>
                                    </a-select>
                                </template>
                            </a-input-number>
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Pointc">
                            <a-input-number v-model:value="addingPointcActionIndex" :min="1" :max="20" :disabled="addingPointcActionMode === '自动填充点 N'">
                                <template #addonBefore>
                                    <a-select v-model:value="addingPointcActionMode">
                                        <a-select-option value="指定点">指定点</a-select-option>
                                        <a-select-option value="自动填充点 N">自动填充点 N</a-select-option>
                                    </a-select>
                                </template>
                            </a-input-number>
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Area">
                            <a-select v-model:value="addingAreaActionLtrb">
                                <a-select-option :value="AreaLtrb.Left">左</a-select-option>
                                <a-select-option :value="AreaLtrb.Top">上</a-select-option>
                                <a-select-option :value="AreaLtrb.Right">右</a-select-option>
                                <a-select-option :value="AreaLtrb.Bottom">下</a-select-option>
                            </a-select>
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Repeat">
                            <a-col>
                                <a-input-number v-model:value="addingRepeatActionSteps" addonBefore="次数" />
                                <a-input-number v-model:value="addingRepeatActionFrom" :disabled="addingRepeatActionFromMode === '自动填充点列表长度'">
                                    <template #addonBefore>
                                        <a-select v-model:value="addingRepeatActionFromMode">
                                            <a-select-option value="指定开始">指定开始</a-select-option>
                                            <a-select-option value="自动填充点列表长度">自动填充点列表长度</a-select-option>
                                        </a-select>
                                    </template>
                                </a-input-number>
                                <a-input-number v-model:value="addingRepeatActionTo" :disabled="addingRepeatActionToMode === '自动填充点列表长度'">
                                    <template #addonBefore>
                                        <a-select v-model:value="addingRepeatActionToMode">
                                            <a-select-option value="指定结束">指定结束</a-select-option>
                                            <a-select-option value="自动填充点列表长度">自动填充点列表长度</a-select-option>
                                        </a-select>
                                    </template>
                                </a-input-number>
                            </a-col>
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Delete">
                            <a-input-number v-model:value="addingDeleteActionCount" addonBefore="次数" />
                        </a-row>
                        <a-button @click="handleClickAddStep" style="width: 50%">添加步骤</a-button>
                        <a-button type="primary" @click="() => handleClickGenerateCode(1)" style="width: 50%">生成代码</a-button>
                    </a-space>
                </a-col>
            </a-row>
        </a-form-item>
        <a-form-item>
            <ResetButtonVue :handleClick="handleClickResetCode" />
        </a-form-item>
    </a-form>
</template>

<style scoped></style>
