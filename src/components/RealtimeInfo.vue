<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoordinateStore } from '../store/Coordinate';
import { useRecordStore } from '../store/Record';
import { useAreaStore } from '../store/Area';

const coordinateStore = useCoordinateStore();
const recordStore = useRecordStore();
const areaStore = useAreaStore();

const { x, y } = storeToRefs(coordinateStore);
const c = computed(() => coordinateStore.c());
const l = computed(() => recordStore.records.length);
const a = computed(() => {
    const { x1, y1, x2, y2 } = areaStore;
    let lt = false;
    let rb = false;
    if (x1 !== -1 && y1 !== -1) {
        lt = true;
    }
    if (x2 !== -1 && y2 !== -1) {
        rb = true;
    }
    if (lt && rb) {
        return 'LTRB';
    }
    if (lt && !rb) {
        return 'LT';
    }
    if (!lt && rb) {
        return 'RB';
    }
    return '/';
});
</script>

<template>
    <a-row class="statistic-container">
        <a-col :span="8">
            <a-statistic title="坐标" :value="`${x},${y}`" :value-style="{ fontSize: '16px' }" />
        </a-col>
        <a-col :span="8">
            <a-statistic title="颜色值" :value="c" :value-style="{ fontSize: '16px' }" />
        </a-col>
        <a-col :span="4">
            <a-statistic title="点数" :value="l" :value-style="{ fontSize: '16px' }" />
        </a-col>
        <a-col :span="4">
            <a-statistic title="范围" :value="a" :value-style="{ fontSize: '16px' }" />
        </a-col>
    </a-row>
</template>

<style scoped>
.statistic-container {
    width: 100%;
    padding: 16px;
    margin-top: 294px;
    position: absolute;
    z-index: 1;
    background-color: #1f1f1f;
}
</style>
