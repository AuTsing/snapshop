<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';

const store = useStore();

const x = computed(() => store.state.coordinate.x);
const y = computed(() => store.state.coordinate.y);
</script>

<template>
    <div class="showcase">
        <a-row class="statistic-container">
            <a-col :span="12">
                <a-statistic title="坐标" :value="`${x},${y}`" />
            </a-col>
            <a-col :span="12">
                <a-statistic title="颜色值" :value="`????????`" />
            </a-col>
        </a-row>
    </div>
</template>

<style scoped>
.showcase {
    background-color: darkslateblue;
    display: flex;
    height: 100%;
    width: 100%;
    padding-right: 20px;
    flex-direction: column;
    overflow-y: auto;
}
.statistic-container {
    width: 100%;
    padding: 16px;
}
</style>
