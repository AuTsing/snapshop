<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStore } from '../store';
import { displayColor } from '../store/Coordinate';
import { ColorMode } from '../store/Configuration';
import { ICastMode } from '../store/FontLab';
import { IFont } from '../store/FontLab';
import { useControlCv } from '../plugins/ControlCv';

import { message } from 'ant-design-vue';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const fontsColumns = [
    { title: '定义', dataIndex: 'definition', width: '25%', ellipsis: true },
    { title: '编码', dataIndex: 'code', width: '50%', ellipsis: true },
    { title: '操作', dataIndex: 'action', width: '25%' },
];

const store = useStore();
const controlCv = useControlCv();

const area = computed(() => store.state.area);
const records = computed(() => store.state.record.records);
const cast = computed(() => store.getters.cast);
const customCast = computed({
    get: () => store.state.fontLab.customCast,
    set: value => store.commit('setFontLab', { key: 'customCast', value }),
});
const castMode = computed({
    get: () => store.state.fontLab.castMode,
    set: value => store.commit('setFontLab', { key: 'castMode', value }),
});
const previewBase64 = computed(() => store.state.fontLab.previewBase64);
const fonts = computed(() => store.state.fontLab.fonts);
const tolerance = ref<number>(store.state.fontLab.tolerance);
const definition = ref<string>('');

const handleChangeTolerance = (value: number) => {
    store.commit('setFontLab', { key: 'tolerance', value });
    store.dispatch('updateFontLabPreview');
};
const handleBlurCustomCast = (e: any) => {
    if (!customCast.value) {
        return;
    }
    const casts = /([a-fA-F\d]{2}[a-fA-F\d]{2}[a-fA-F\d]{2})\s*,\s*([a-fA-F\d]{2}[a-fA-F\d]{2}[a-fA-F\d]{2})/.exec(customCast.value);
    if (!casts) {
        customCast.value = '';
        message.warning('偏色格式不可用');
        return;
    }
    const cast1 = casts[1].toUpperCase();
    const cast2 = casts[2].toUpperCase();
    customCast.value = `${cast1} , ${cast2}`;
};
const handleClickAddFont = () => {
    if (definition.value === '' || previewBase64.value === '') {
        return;
    }

    const previewJimp = store.state.fontLab.previewJimp;
    if (!previewJimp) {
        return;
    }

    const fontDefinition: string[] = [];
    const fontBinary: number[] = [];
    const range = { x1: previewJimp.bitmap.width, y1: previewJimp.bitmap.height, x2: 0, y2: 0 };

    previewJimp.scan(0, 0, previewJimp.bitmap.width, previewJimp.bitmap.height, (x, y) => {
        const color = previewJimp.getPixelColor(x, y);
        if (color === 0x000000ff && x < range.x1) {
            range.x1 = x;
        }
        if (color === 0x000000ff && y < range.y1) {
            range.y1 = y;
        }
        if (color === 0x000000ff && x > range.x2) {
            range.x2 = x;
        }
        if (color === 0x000000ff && y > range.y2) {
            range.y2 = y;
        }
    });

    const cropedJimp = previewJimp.crop(range.x1, range.y1, Math.abs(range.x2 - range.x1 + 1), Math.abs(range.y2 - range.y1 + 1));
    for (let x = 0; x < cropedJimp.bitmap.width; x++) {
        for (let y = 0; y < cropedJimp.bitmap.height; y++) {
            if (cropedJimp.getPixelColor(x, y) === 0x000000ff) {
                fontBinary.push(1);
            } else {
                fontBinary.push(0);
            }
        }
    }
    fontBinary.reduce((pre, cur, idx, arr) => {
        const word = pre + cur;
        if (idx % 4 === 3) {
            fontDefinition.push(word);
            return '';
        } else if (idx === arr.length - 1) {
            fontDefinition.push(word);
            return '';
        } else {
            return word;
        }
    }, '');
    const fontCodes = fontDefinition.map(word => {
        if (word.length === 4) {
            return parseInt(word, 2).toString(16);
        } else {
            return '@' + word;
        }
    });
    fontCodes.push('$' + definition.value);
    fontCodes.push('$' + fontBinary.filter(b => b === 1).length);
    fontCodes.push('$' + previewJimp.bitmap.height);
    fontCodes.push('$' + previewJimp.bitmap.width);
    const fontCode = fontCodes.join('');
    const font: IFont = {
        key: (fonts.value.length + 1).toString(),
        definition: definition.value,
        code: fontCode,
    };
    store.commit('addFont', font);
    definition.value = '';
};
const handleClickGeneratorFontLab = () => {
    const font = '{\n' + fonts.value.map(font => `'${font.code}'`).join(',\n') + '\n}';
    controlCv.ctrlC(font);
};
const handleClickRemoveFont = (font: IFont) => {
    store.commit('removeFont', font.key);
};
const handleClickCopyFont = (font: IFont) => {
    controlCv.ctrlC(`'${font.code}',`);
};

onMounted(() => {
    store.dispatch('updateFontLabPreview');
});
</script>

<template>
    <div :style="{ margin: '16px' }">
        <a-row :wrap="false">
            <a-col :span="12">
                <a-divider orientation="left">已选择范围</a-divider>
                <div v-if="Object.values(area).some(p => p === -1)" class="placeholder">在主面板中 Q/E 选取范围</div>
                <a-statistic v-if="Object.values(area).every(p => p !== -1)" :value="`${area.x1}, ${area.y1}, ${area.x2}, ${area.y2}`" />
                <a-divider orientation="left">已选择颜色</a-divider>
                <div v-if="records.length === 0" class="placeholder">在主面板中使用 鼠标左键/数字键1-9 取点</div>
                <a-tag v-if="records.length > 0" v-for="record in records" class="tag" :color="displayColor(record.cNative, ColorMode.hexWithPound)">
                    {{ record.c }}
                </a-tag>
                <a-divider orientation="left">容差</a-divider>
                <a-slider v-model:value="tolerance" @afterChange="handleChangeTolerance" />
                <a-divider orientation="left">偏色</a-divider>
                <a-input-group compact>
                    <a-select v-model:value="castMode" style="width: 40%">
                        <a-select-option :value="ICastMode.auto">{{ ICastMode.auto }}</a-select-option>
                        <a-select-option :value="ICastMode.custom">{{ ICastMode.custom }}</a-select-option>
                    </a-select>
                    <a-input v-if="castMode === ICastMode.auto" :value="cast" style="width: 60%" :disabled="true" placeholder="未选择颜色" />
                    <a-input
                        v-if="castMode === ICastMode.custom"
                        v-model:value="customCast"
                        style="width: 60%"
                        :placeholder="cast"
                        @blur="handleBlurCustomCast"
                    />
                </a-input-group>
                <a-divider orientation="left">预览</a-divider>
                <div v-if="previewBase64 === ''" class="placeholder">未选择范围或颜色</div>
                <img v-if="previewBase64 !== ''" :src="previewBase64" :draggable="false" />
                <a-divider orientation="left">字库</a-divider>
                <a-input-group compact>
                    <a-input v-model:value="definition" placeholder="定义文字" :allowClear="true" style="width: 50%" @pressEnter="handleClickAddFont" />
                    <a-button :disabled="definition === '' || previewBase64 === ''" style="width: 25%" @click="handleClickAddFont">添加到字库</a-button>
                    <a-button style="width: 25%" @click="handleClickGeneratorFontLab">生成字库</a-button>
                </a-input-group>
                <a-table :columns="fontsColumns" :data-source="fonts" bordered size="small" :pagination="false">
                    <template #bodyCell="{ column, record: font }">
                        <template v-if="column.dataIndex === 'action'">
                            <a-space>
                                <CopyOutlined @click="() => handleClickCopyFont(font)" />
                                <DeleteOutlined @click="() => handleClickRemoveFont(font)" />
                            </a-space>
                        </template>
                    </template>
                    <template #emptyText>
                        {{ '定义文字添加字库' }}
                    </template>
                </a-table>
            </a-col>
        </a-row>
    </div>
</template>

<style scoped>
.tag {
    text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
}
.placeholder {
    padding: 8px;
    color: rgba(255, 255, 255, 0.3);
    font-size: 14px;
    text-align: center;
}
</style>
