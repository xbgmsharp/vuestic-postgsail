<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('dashboard.title') }}</va-card-title>
      <va-card-content>
        <p>Dashboard content here</p>
        {{ store.packageVersion }}
        {{ version }}
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useGlobalStore } from '../../stores/global-store'

  const store = useGlobalStore()

  const getVersion = computed(() => {
    return store.packageVersion
  })

  //const version = __APP_VERSION__
</script>

<style lang="scss"></style>
