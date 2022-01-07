<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from '../store';
import { ICapture } from '../store/Capture';
import Jimp from 'jimp/browser/lib/jimp';
import { promiseTimeout } from '@vueuse/core';

import { Empty } from 'ant-design-vue';
import { LoadingOutlined } from '@ant-design/icons-vue';

const store = useStore();

const captures = computed(() => store.state.capture.captures);
const capturesCheckeds = ref<boolean[]>(Array(captures.value.length).fill(false));
const selectedCaptures = computed(() => {
    const selected: ICapture[] = [];
    captures.value.forEach((capture, index) => {
        if (capturesCheckeds.value[index] === true) {
            selected.push(capture);
        }
    });
    return selected;
});
const comparedCaptureBase64 = ref<string>('');
const tolerance = ref<number>(0);
const loading = ref<boolean>(false);

const handleClickReset = () => {
    capturesCheckeds.value.fill(false);
};

const compare = async () => {
    if (selectedCaptures.value.length >= 2) {
        comparedCaptureBase64.value = '';
        loading.value = true;
        await promiseTimeout(100);
        const capture1 = selectedCaptures.value[0];
        const capture2 = selectedCaptures.value[1];
        const width = capture1.jimp.bitmap.width;
        const height = capture1.jimp.bitmap.height;
        const jimp = new Jimp(width, height);
        jimp.scan(0, 0, width, height, (x, y, idx) => {
            const r1 = capture1.jimp.bitmap.data[idx + 0];
            const g1 = capture1.jimp.bitmap.data[idx + 1];
            const b1 = capture1.jimp.bitmap.data[idx + 2];
            const r2 = capture2.jimp.bitmap.data[idx + 0];
            const g2 = capture2.jimp.bitmap.data[idx + 1];
            const b2 = capture2.jimp.bitmap.data[idx + 2];
            if (Math.abs(r1 - r2) <= tolerance.value && Math.abs(g1 - g2) <= tolerance.value && Math.abs(b1 - b2) <= tolerance.value) {
                jimp.setPixelColor(0xffffffff, x, y);
            } else {
                jimp.setPixelColor(0xff0000ff, x, y);
            }
        });
        const base64 = await jimp.getBase64Async(Jimp.MIME_PNG);
        comparedCaptureBase64.value = base64;
        loading.value = false;
    }
};

watch(selectedCaptures, compare);
</script>

<template>
    <a-row class="comparer" :wrap="false">
        <a-col class="list">
            <a-list item-layout="horizontal" :data-source="captures" :locale="{ emptyText: '在主面板加载图片' }">
                <template #renderItem="{ item: capture, index }">
                    <a-list-item>
                        <a-space :style="{ marginLeft: '8px' }">
                            <a-image :width="200" :src="capture.base64" :alt="capture.title" />
                            <a-checkbox
                                v-model:checked="capturesCheckeds[index]"
                                :disabled="(capturesCheckeds[index] === false && selectedCaptures.length >= 2) || loading"
                            ></a-checkbox>
                        </a-space>
                    </a-list-item>
                </template>
            </a-list>
        </a-col>
        <a-col class="show">
            <div class="show-bar">
                <a-space :style="{ marginLeft: '8px' }">
                    <a-button @click="handleClickReset" :disabled="loading">重置</a-button>
                    <div>容差</div>
                    <div :style="{ width: '200px' }">
                        <a-slider v-model:value="tolerance" :min="0" :max="255" tooltipPlacement="bottom" :disabled="loading" @afterChange="compare" />
                    </div>
                </a-space>
            </div>
            <div class="show-result">
                <a-empty v-if="selectedCaptures.length < 2" :image="Empty.PRESENTED_IMAGE_SIMPLE" description="选择两张图片比较" />
                <LoadingOutlined v-if="selectedCaptures.length >= 2 && comparedCaptureBase64 === ''" :style="{ fontSize: '24px' }" />
                <a-image v-if="selectedCaptures.length >= 2 && comparedCaptureBase64 !== ''" :width="500" :src="comparedCaptureBase64" />
            </div>
        </a-col>
    </a-row>
</template>

<style scoped>
.comparer {
    height: 100%;
}
.list {
    flex: 0 0 260px;
    overflow-y: scroll;
}
.show {
    height: 100%;
    width: 0;
    flex: 1 0 300px;
    display: flex;
    flex-direction: column;
}
.show-bar {
    height: 50px;
    width: 100%;
    background-color: #1f1f1f;
    overflow-x: auto;
    display: flex;
    align-items: center;
}
.show-result {
    flex: 1 0 300px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
