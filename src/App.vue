<script setup lang="ts">
import NavbarVue from './components/Navbar.vue';
</script>

<template>
    <a-row class="screen" :wrap="false">
        <a-col>
            <NavbarVue />
        </a-col>
        <a-col flex="1 1 auto">
            <router-view></router-view>
        </a-col>
    </a-row>
</template>

<style>
body {
    padding: 0;
    margin: 0;
}
.screen {
    width: 100vw;
    height: 100vh;
}
.nav {
    background-color: darkred;
}
</style>
