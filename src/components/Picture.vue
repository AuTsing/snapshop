<script setup lang="ts">
import { computed, ref } from 'vue';
import { MaybeElementRef, useMouseInElement, debouncedWatch, useElementHover } from '@vueuse/core';
import { store } from '../store';

const { base64 } = defineProps({
    base64: { type: String, required: true },
});

const imgCover = ref<string | undefined>();
const refImgContent = ref();

const { elementX, elementY, isOutside } = useMouseInElement(refImgContent);
const isHovered = useElementHover(refImgContent);

debouncedWatch(
    [elementX, elementY],
    () => {
        if (isHovered.value) {
            store.commit('updateCoordinate', { x: elementX.value, y: elementY.value });
        } else {
            store.commit('resetCoordinate');
        }
    },
    { debounce: 100 }
);
</script>

<template>
    <div>{{ elementX }} {{ elementY }} {{ isOutside }} {{ isHovered }}</div>
    <div class="img-container">
        <img class="img-cover" :src="imgCover" alt="" draggable="false" />
        <img ref="refImgContent" class="img-content" :src="base64" alt="" draggable="false" />
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
</style>
