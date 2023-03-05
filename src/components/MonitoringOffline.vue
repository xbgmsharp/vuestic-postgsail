<template>
  <div class="flex flex-col" style="width: 100%">
    <div id="" class="item">
      <va-icon name="wifi_off" :size="100" />
      <p>
        {{ t('monitoring.offline.offline') }}
        <br />
        {{ t('monitoring.offline.lastupdate') }}
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Offline',
  }
</script>

<script setup>
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
</script>

<style>
  .item {
    /*border: 1px solid var(--va-background-border);*/
    background-color: var(--va-background-primary);
    text-align: center;
  }
</style>
