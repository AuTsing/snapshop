<script setup lang="ts">
import { ref } from 'vue';
import { views } from '../router';

const collapsed = ref<boolean>(true);
const selectedKeys = ref<string[]>([views[0].key]);
</script>

<template>
    <a-layout-sider class="menu" v-model:collapsed="collapsed" collapsible collapsedWidth="48px">
        <div class="logo-container">
            <img src="../assets/logo.png" :draggable="false" style="width: 36px; height: 36px" />
        </div>
        <a-menu v-model:selectedKeys="selectedKeys">
            <a-menu-item v-for="view in views" :key="view.key">
                <router-link :to="'/' + view.key">
                    <component :is="view.icon" />
                    <span>{{ view.title }}</span>
                </router-link>
            </a-menu-item>
        </a-menu>
    </a-layout-sider>
</template>

<style scoped>
.menu {
    height: 100%;
}
.logo-container {
    height: 46px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
