<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';

const store = useStore();

const x = computed(() => store.state.coordinate.x);
const y = computed(() => store.state.coordinate.y);
const c = computed(() => store.getters.c);

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
