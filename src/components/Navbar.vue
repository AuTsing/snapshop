<script setup lang="ts">
import { ref } from 'vue';
import { views } from '../routes/views';

const selectedKeys = ref<string[]>([views[0].key]);
</script>

<template>
    <a-col class="menu">
        <div class="logo-container">
            <img src="../assets/logo.png" :draggable="false" style="width: 36px; height: 36px" />
        </div>
        <a-menu v-model:selectedKeys="selectedKeys" :inline-collapsed="true" mode="inline">
            <a-menu-item v-for="view in views" :key="view.key" :title="view.title" :icon="view.icon">
                <router-link :to="view.path"></router-link>
            </a-menu-item>
        </a-menu>
    </a-col>
</template>

<style scoped>
.menu {
    height: 100%;
    background-color: #141414;
}
.logo-container {
    height: 46px;
    display: flex;
    justify-content: center;
    align-items: center;
}
:deep(.ant-menu-inline-collapsed) {
    width: 46px;
}
</style>
