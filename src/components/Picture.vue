<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useMouseInElement, throttledWatch, useElementHover, onKeyStroke } from '@vueuse/core';
import { useStore } from '../store';

const store = useStore();

const { base64 } = defineProps({
    base64: { type: String, required: true },
});

const imgCover = ref<string | undefined>();
const refImgContent = ref();

const { x, y, elementX, elementY } = useMouseInElement(refImgContent);
const isHovered = useElementHover(refImgContent);

const pointStyles = computed<Record<string, string | number>>(() => ({
    position: 'fixed',
    left: '0px',
    top: '0px',
    pointerEvents: 'none',
    zIndex: 9999,
    transform: `translate(calc(${x.value}px - 50%), calc(${y.value}px - 50%))`,
}));

const handleClickImg = () => {
    if (store.getters.xyLegal()) {
        store.commit('addRecord', { x: store.state.coordinate.x, y: store.state.coordinate.y, c: store.getters.c });
    }
};

watch([elementX, elementY], () => {
    if (isHovered.value) {
        store.commit('updateCoordinate', { x: elementX.value, y: elementY.value });
    } else {
        store.commit('resetCoordinate');
    }
});
</script>

<template>
    <div :style="pointStyles" class="point"></div>
    <div class="img-container">
        <img class="img-cover" :src="imgCover" alt="" draggable="false" />
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
.img-cover {
    position: absolute;
    z-index: 2;
}
.img-content {
    position: absolute;
    z-index: 1;
}
.point {
    width: 10px;
    height: 10px;
    background-color: yellow;
    border-radius: 10px;
}
</style>
