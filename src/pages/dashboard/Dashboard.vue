<template>
  <div class="dashboard">
    <h1>{{ $t('dashboard.title') }}</h1>
    <va-list>
      <va-list-item>
        <router-link :to="{ name: 'logs' }">Logs</router-link>
      </va-list-item>
    </va-list>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
</script>

<style lang="scss"></style>
