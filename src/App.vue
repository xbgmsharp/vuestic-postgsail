<template>
  <router-view />
</template>

<script setup>
  import { onMounted, onUnmounted } from 'vue'
  import { handleUnauthorized } from './utils/handleUnauthorized'

  onMounted(() => window.addEventListener('app:unauthorized', handleUnauthorized))
  onUnmounted(() => window.removeEventListener('app:unauthorized', handleUnauthorized))
</script>

<style lang="scss">
  @import 'scss/main.scss';
  #app {
    font-family: 'Inter', Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
  body {
    margin: 0;
  }
</style>
