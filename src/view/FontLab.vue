<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useStore } from '../store';
import { displayColor } from '../store/Coordinate';
import { ColorMode } from '../store/Configuration';
import { ICastMode } from '../store/FontLab';

const store = useStore();

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
const tolerance = ref<number>(store.state.fontLab.tolerance);

const handleChangeTolerance = (value: number) => {
    store.commit('setFontLab', { key: 'tolerance', value });
    store.dispatch('updateFontLabPreview');
};
const handleBlurCustomCast = (e: any) => {
    console.log(e);
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
                    <a-input v-if="castMode === ICastMode.auto" :value="cast" style="width: 60%" :disabled="true" />
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
                <img v-if="previewBase64 !== ''" :src="previewBase64" />
                <a-divider orientation="left">字库</a-divider>
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
