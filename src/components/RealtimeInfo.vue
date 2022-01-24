<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoordinateStore } from '../store/Coordinate';

const coordinateStore = useCoordinateStore();

const { x, y } = storeToRefs(coordinateStore);
const c = computed(() => coordinateStore.c());
</script>

<template>
    <a-row class="statistic-container">
        <a-col :span="12">
            <a-statistic title="坐标" :value="`${x},${y}`" />
        </a-col>
        <a-col :span="12">
            <a-statistic title="颜色值" :value="c" />
        </a-col>
    </a-row>
</template>

<style scoped>
.statistic-container {
    width: 100%;
    padding: 16px;
}
</style>
