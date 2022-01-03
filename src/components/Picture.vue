<script setup lang="ts">
import { ref, watch, computed, onMounted, watchEffect } from 'vue';
import { useMouseInElement, pausableWatch, useElementHover, onKeyStroke } from '@vueuse/core';
import { useStore } from '../store';

const store = useStore();

const { base64 } = defineProps({
    base64: { type: String, required: true },
});

const imgCover = ref<string | undefined>();
const refImgContent = ref();

const { x, y, elementX, elementY } = useMouseInElement(refImgContent);
const isHovered = useElementHover(refImgContent);

const handleClickImg = () => {
    if (store.getters.xyLegal()) {
        store.commit('addRecord', { x: store.state.coordinate.x, y: store.state.coordinate.y, c: store.getters.c(), cNative: store.getters.cNative });
    }
};

const { pause, resume } = pausableWatch([elementX, elementY], () => {
    store.commit('updateCoordinate', { x: elementX.value, y: elementY.value });
});
watchEffect(() => {
    if (isHovered.value) {
        resume();
    } else {
        pause();
        store.commit('resetCoordinate');
    }
});
</script>

<template>
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
    max-width: none;
    max-height: none;
}
</style>
