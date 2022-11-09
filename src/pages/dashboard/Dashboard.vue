<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('dashboard.title') }}</va-card-title>
      <va-card-content>
        <p>Dashboard content here</p>
        FrontEnd version: {{ store.packageVersion }}<br />
        Backend version: {{ GetpgSailVersion }}<br />
        <!--
          {{ version }}
-->
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
  const GetpgSailVersion = computed(() => {
    return `app version: ${store.pgsail_app_version} system version: ${store.pgsail_sys_version}`
  })
  // Generate a build issue?
  //const version = __APP_VERSION__
</script>

<style lang="scss"></style>
