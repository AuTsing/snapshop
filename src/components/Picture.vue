<script setup lang="ts">
import { ref, watchEffect, computed, StyleValue } from 'vue';
import { useMouseInElement, pausableWatch, useElementHover } from '@vueuse/core';
import { useAreaStore } from '../store/Area';
import { useCoordinateStore } from '../store/Coordinate';
import { useRecordStore } from '../store/Record';

const areaStore = useAreaStore();
const coordinateStore = useCoordinateStore();
const recordStore = useRecordStore();

const { base64 } = defineProps({
    base64: { type: String, required: true },
});

const refImgContent = ref();
const { elementX, elementY } = useMouseInElement(refImgContent);
const isHoveredImgContent = useElementHover(refImgContent);
const areaStyle = computed<StyleValue>(() => {
    if (Object.values(areaStore).some(p => p === -1)) {
        return {
            width: `0`,
            height: `0`,
            left: `0`,
            top: `0`,
        };
    }
    const { x1, y1, x2, y2 } = areaStore;
    const width = Math.abs(x1 - x2) + 1;
    const height = Math.abs(y1 - y2) + 1;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    return {
        width: `${width}px`,
        height: `${height}px`,
        left: `${left}px`,
        top: `${top}px`,
    };
});

const handleClickImg = () => {
    if (coordinateStore.xyLegal()) {
        recordStore.addRecord(coordinateStore.x, coordinateStore.y, coordinateStore.c(), coordinateStore.cNative);
    }
};

const { pause, resume } = pausableWatch([elementX, elementY], () => {
    coordinateStore.updateCoordinate(Math.round(elementX.value), Math.round(elementY.value));
});
watchEffect(() => {
    if (isHoveredImgContent.value) {
        resume();
    } else {
        pause();
        coordinateStore.resetCoordinate();
    }
});
</script>

<template>
    <div class="img-container">
        <div class="img-area" :style="areaStyle"></div>
        <img ref="refImgContent" class="img-content" :src="base64" alt="" draggable="false" @click="handleClickImg" />
    </div>
</template>

<style scoped>
.img-container {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: auto;
}
.img-area {
    position: absolute;
    z-index: 2;
    background-color: #3eaf7c44;
    transition: all 0.05s linear;
    pointer-events: none;
}
.img-content {
    position: absolute;
    z-index: 1;
    max-width: none;
    max-height: none;
}
</style>
