<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRaw } from 'vue';
import { debouncedWatch } from '@vueuse/core';
import { message } from 'ant-design-vue';

import { GenerateActions, useCodeStore, readFileAsString } from '../store/Code';
import { defaultCode } from '../store/Code';
import { AreaLtrb, ICodeState, ColorFormat } from '../store/Code';
import { useControlCv } from '../plugins/ControlCv';
import ResetButtonVue from '../shared/ResetButton.vue';
import ImportButtonVue from '../shared/ImportButton.vue';
import ExportButtonVue from '../shared/ExportButton.vue';
import Opener from '../components/Opener.vue';

const codeStore = useCodeStore();
const controlCv = useControlCv();

const flowNames = ['flow1', 'flow2', 'flow3', 'flow4', 'flow5', 'flow6', 'flow7', 'flow8', 'flow9', 'flow10'];

const codeModelRef = reactive<ICodeState>(Object.assign({}, codeStore.$state));
const addingGenerateAction = ref<GenerateActions>(GenerateActions.Text);
const addingTextActionText = ref<string>('');
const addingPointxActionMode = ref<'指定点' | '自动填充点 N'>('自动填充点 N');
const addingPointxActionIndex = ref<number>(1);
const addingPointxActionDeltaIndex = ref<number>(0);
const addingPointyActionMode = ref<'指定点' | '自动填充点 N'>('自动填充点 N');
const addingPointyActionIndex = ref<number>(1);
const addingPointyActionDeltaIndex = ref<number>(0);
const addingPointcActionMode = ref<'指定点' | '自动填充点 N'>('自动填充点 N');
const addingPointcActionIndex = ref<number>(1);
const addingPointcActionFormat = ref<ColorFormat>(ColorFormat.LowerHex);
const addingAreaActionLtrb = ref<AreaLtrb>(AreaLtrb.Left);
const addingRepeatActionSteps = ref<number>(1);
const addingRepeatActionFromMode = ref<'指定开始' | '自动填充点列表长度'>('指定开始');
const addingRepeatActionFrom = ref<number>(1);
const addingRepeatActionToMode = ref<'指定结束' | '自动填充点列表长度'>('自动填充点列表长度');
const addingRepeatActionTo = ref<number>(1);
const addingDeleteActionCount = ref<number>(1);
const addingToStep = ref<number>(1);
const activeFlowName = ref<string>('flow1');
const flowSteps = computed<string[][]>(() =>
    flowNames.map(flowName =>
        codeModelRef[flowName as keyof ICodeState].map(step => {
            switch (step.action) {
                case GenerateActions.Text:
                    return `添加文本 ${step.text}`;
                case GenerateActions.Pointx:
                    if (step.deltaIndex > 0) {
                        return `添加点 ${step.index} 的 X 坐标 与 点 ${step.deltaIndex} 的 X 坐标 差值`;
                    } else {
                        return `添加点 ${step.index} 的 X 坐标 值`;
                    }
                case GenerateActions.Pointy:
                    if (step.deltaIndex > 0) {
                        return `添加点 ${step.index} 的 Y 坐标 与 点 ${step.deltaIndex} 的 Y 坐标 差值`;
                    } else {
                        return `添加点 ${step.index} 的 Y 坐标 值`;
                    }
                case GenerateActions.Pointc:
                    let format: string;
                    switch (step.format) {
                        case ColorFormat.LowerHex:
                            format = '小写十六进制';
                            break;
                        case ColorFormat.UpperHex:
                            format = '大写十六进制';
                            break;
                        case ColorFormat.Dec:
                            format = '十进制';
                            break;
                        case ColorFormat.Rgb:
                            format = 'RGB';
                            break;
                    }
                    return `添加点 ${step.index} ${format} 格式 的 颜色值`;
                case GenerateActions.Area:
                    return `添加范围 ${step.ltrb} 的值`;
                case GenerateActions.Repeat:
                    return `重复以上 ${step.steps} 个步骤 从 ${step.from} 到 ${step.to}`;
                case GenerateActions.Delete:
                    return `重复操作完成后 删除以上 ${step.count} 个步骤`;
            }
        })
    )
);
const codes = ref<string[]>([]);

const handleClickAddStep = (flowName: string, toStep: number) => {
    switch (addingGenerateAction.value) {
        case GenerateActions.Text:
            codeStore.addStep(flowName, toStep, { action: GenerateActions.Text, text: addingTextActionText.value });
            addingTextActionText.value = '';
            break;
        case GenerateActions.Pointx:
            codeStore.addStep(flowName, toStep, {
                action: GenerateActions.Pointx,
                index: addingPointxActionMode.value === '指定点' ? addingPointxActionIndex.value : 'n',
                deltaIndex: addingPointxActionDeltaIndex.value,
            });
            break;
        case GenerateActions.Pointy:
            codeStore.addStep(flowName, toStep, {
                action: GenerateActions.Pointy,
                index: addingPointyActionMode.value === '指定点' ? addingPointyActionIndex.value : 'n',
                deltaIndex: addingPointyActionDeltaIndex.value,
            });
            break;
        case GenerateActions.Pointc:
            codeStore.addStep(flowName, toStep, {
                action: GenerateActions.Pointc,
                index: addingPointcActionMode.value === '指定点' ? addingPointcActionIndex.value : 'n',
                format: addingPointcActionFormat.value,
            });
            break;
        case GenerateActions.Area:
            codeStore.addStep(flowName, toStep, {
                action: GenerateActions.Area,
                ltrb: addingAreaActionLtrb.value,
            });
            break;
        case GenerateActions.Repeat:
            codeStore.addStep(flowName, toStep, {
                action: GenerateActions.Repeat,
                steps: addingRepeatActionSteps.value,
                from: addingRepeatActionFromMode.value === '指定开始' ? addingRepeatActionFrom.value : 'n',
                to: addingRepeatActionToMode.value === '指定结束' ? addingRepeatActionTo.value : 'n',
            });
            break;
        case GenerateActions.Delete:
            codeStore.addStep(flowName, toStep, {
                action: GenerateActions.Delete,
                count: addingDeleteActionCount.value,
            });
            break;
        default:
            break;
    }
    const flowi = flowNames.indexOf(flowName);
    addingToStep.value = flowSteps.value[flowi].length + 1;
};

const handleClickRemoveStep = (flowName: string, i: number) => {
    codeStore.removeStep(flowName, i);
};

const handleClickCopyCode = (flowi: number) => {
    controlCv.ctrlC(codes.value[flowi]);
};

const handleClickResetFlow = (flowName: string) => {
    const defaultFlow = Array.from(defaultCode[flowName as keyof ICodeState]);
    codeModelRef[flowName as keyof ICodeState] = defaultFlow;
    codeStore.resetFlow(flowName);
};

const handleClickImportFlow = async (it: any) => {
    const files = Array.from(it.target.files as FileList);
    const file = files[0];
    const content = await readFileAsString(file);
    const flow = JSON.parse(content);
    Object.assign(codeModelRef[activeFlowName.value as keyof ICodeState], flow);
    codeStore.setFlow(activeFlowName.value, flow);
    it.target.value = null;
};

const handleClickExportFlow = () => {
    const content = JSON.stringify(codeModelRef[activeFlowName.value as keyof ICodeState]);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeFlowName.value}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

debouncedWatch(
    codeModelRef,
    () => {
        const code = toRaw(codeModelRef);
        codeStore.$patch(code);
        message.success('设置保存成功!');
        codes.value = flowNames.map(flowName => codeStore.generate(flowName));
    },
    { debounce: 500 }
);

onMounted(() => {
    codes.value = flowNames.map(flowName => codeStore.generate(flowName));
});
</script>

<template>
    <a-tabs v-model:activeKey="activeFlowName" :style="{ margin: '16px' }">
        <a-tab-pane v-for="(flowName, flowi) in flowNames" :key="flowName" :tab="`流程 ${flowi + 1}`">
            <a-row :gutter="8">
                <a-col :span="12">
                    <a-steps direction="vertical" size="small" :current="-1">
                        <a-step v-for="(step, i) in flowSteps[flowi]" :title="step" status="process" @click="() => handleClickRemoveStep(flowName, i)" />
                    </a-steps>
                </a-col>
                <a-col :span="12">
                    <a-space direction="vertical" style="width: 100%">
                        <a-select v-model:value="addingGenerateAction" style="width: 75%">
                            <a-select-option :value="GenerateActions.Text">文本</a-select-option>
                            <a-select-option :value="GenerateActions.Pointx">X 坐标</a-select-option>
                            <a-select-option :value="GenerateActions.Pointy">Y 坐标</a-select-option>
                            <a-select-option :value="GenerateActions.Pointc">颜色值</a-select-option>
                            <a-select-option :value="GenerateActions.Area">范围</a-select-option>
                            <a-select-option :value="GenerateActions.Repeat">重复</a-select-option>
                            <a-select-option :value="GenerateActions.Delete">删除</a-select-option>
                        </a-select>
                        <a-row v-if="addingGenerateAction === GenerateActions.Text" style="width: 75%">
                            <a-input
                                v-model:value="addingTextActionText"
                                @press-enter="() => handleClickAddStep(flowName, addingToStep)"
                                placeholder="添加文本"
                                allowClear
                            />
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Pointx" style="width: 75%">
                            <a-input-number
                                v-model:value="addingPointxActionIndex"
                                :min="1"
                                :max="20"
                                :disabled="addingPointxActionMode === '自动填充点 N'"
                                style="width: 100%"
                            >
                                <template #addonBefore>
                                    <a-select v-model:value="addingPointxActionMode">
                                        <a-select-option value="指定点">指定点</a-select-option>
                                        <a-select-option value="自动填充点 N">自动填充点 N</a-select-option>
                                    </a-select>
                                </template>
                            </a-input-number>
                            <a-input-number v-model:value="addingPointxActionDeltaIndex" addonBefore="与点" addonAfter="的差值" :min="0" style="width: 100%" />
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Pointy" style="width: 75%">
                            <a-input-number
                                v-model:value="addingPointyActionIndex"
                                :min="1"
                                :max="20"
                                :disabled="addingPointyActionMode === '自动填充点 N'"
                                style="width: 100%"
                            >
                                <template #addonBefore>
                                    <a-select v-model:value="addingPointyActionMode">
                                        <a-select-option value="指定点">指定点</a-select-option>
                                        <a-select-option value="自动填充点 N">自动填充点 N</a-select-option>
                                    </a-select>
                                </template>
                            </a-input-number>
                            <a-input-number v-model:value="addingPointyActionDeltaIndex" addonBefore="与点" addonAfter="的差值" :min="0" style="width: 100%" />
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Pointc" style="width: 75%">
                            <a-input-number
                                v-model:value="addingPointcActionIndex"
                                :min="1"
                                :max="20"
                                :disabled="addingPointcActionMode === '自动填充点 N'"
                                style="width: 100%"
                            >
                                <template #addonBefore>
                                    <a-select v-model:value="addingPointcActionMode">
                                        <a-select-option value="指定点">指定点</a-select-option>
                                        <a-select-option value="自动填充点 N">自动填充点 N</a-select-option>
                                    </a-select>
                                </template>
                            </a-input-number>
                            <a-select v-model:value="addingPointcActionFormat" style="width: 100%">
                                <a-select-option :value="ColorFormat.LowerHex">小写十六进制</a-select-option>
                                <a-select-option :value="ColorFormat.UpperHex">大写十六进制</a-select-option>
                                <a-select-option :value="ColorFormat.Dec">十进制</a-select-option>
                                <a-select-option :value="ColorFormat.Rgb">RGB</a-select-option>
                            </a-select>
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Area" style="width: 75%">
                            <a-select v-model:value="addingAreaActionLtrb" style="width: 100%">
                                <a-select-option :value="AreaLtrb.Left">左</a-select-option>
                                <a-select-option :value="AreaLtrb.Top">上</a-select-option>
                                <a-select-option :value="AreaLtrb.Right">右</a-select-option>
                                <a-select-option :value="AreaLtrb.Bottom">下</a-select-option>
                            </a-select>
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Repeat" style="width: 75%">
                            <a-input-number v-model:value="addingRepeatActionSteps" addonBefore="将以上" addonAfter="个步骤重复" :min="1" style="width: 100%" />
                            <a-input-number
                                v-model:value="addingRepeatActionFrom"
                                :min="1"
                                :disabled="addingRepeatActionFromMode === '自动填充点列表长度'"
                                style="width: 100%"
                            >
                                <template #addonBefore>
                                    <a-select v-model:value="addingRepeatActionFromMode">
                                        <a-select-option value="指定开始">指定开始</a-select-option>
                                        <a-select-option value="自动填充点列表长度">自动填充点列表长度</a-select-option>
                                    </a-select>
                                </template>
                            </a-input-number>
                            <a-input-number
                                v-model:value="addingRepeatActionTo"
                                :min="1"
                                :disabled="addingRepeatActionToMode === '自动填充点列表长度'"
                                style="width: 100%"
                            >
                                <template #addonBefore>
                                    <a-select v-model:value="addingRepeatActionToMode">
                                        <a-select-option value="指定结束">指定结束</a-select-option>
                                        <a-select-option value="自动填充点列表长度">自动填充点列表长度</a-select-option>
                                    </a-select>
                                </template>
                            </a-input-number>
                        </a-row>
                        <a-row v-if="addingGenerateAction === GenerateActions.Delete" style="width: 75%">
                            <a-input-number v-model:value="addingDeleteActionCount" addonBefore="次数" style="width: 100%" />
                        </a-row>
                        <a-input-number
                            v-model:value="addingToStep"
                            addonBefore="添加至第"
                            addonAfter="个步骤"
                            :min="1"
                            :max="flowSteps[flowi].length + 1"
                            style="width: 50%"
                        />
                        <a-button @click="() => handleClickAddStep(flowName, addingToStep)" style="width: 50%">添加步骤</a-button>
                        <a-button type="primary" @click="() => handleClickCopyCode(flowi)" style="width: 50%">复制代码</a-button>
                        <a-typography-paragraph>
                            <pre>{{ codes[flowi] === '' ? '请添加步骤以组织代码' : codes[flowi] }}</pre>
                        </a-typography-paragraph>
                    </a-space>
                </a-col>
            </a-row>
        </a-tab-pane>
    </a-tabs>
    <a-row :style="{ padding: '16px' }">
        <a-space>
            <ResetButtonVue :handleClick="() => handleClickResetFlow(activeFlowName)" />
            <Opener :handleChangeFile="handleClickImportFlow" acceptExt=".json">
                <template #default>
                    <ImportButtonVue :handleClick="() => {}" />
                </template>
            </Opener>
            <ExportButtonVue :handleClick="handleClickExportFlow" />
        </a-space>
    </a-row>
</template>

<style scoped></style>
