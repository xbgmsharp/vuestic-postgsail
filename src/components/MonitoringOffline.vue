<template>
  <div class="flex flex-col" style="width: 100%">
    <div id="" class="item">
      <svg width="100px" height="100px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path
          stroke="#000000"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m4 4 16 16M9 5.336c4.143-.94 8.643.094 12 3.101m-8 .615a9.456 9.456 0 0 1 5.333 2.367m-10 2.981a5.491 5.491 0 0 1 4.345-1.358M3 8.437a13.445 13.445 0 0 1 3.206-2.134m-.54 5.116A9.446 9.446 0 0 1 9 9.484m3 9.016 1-1.118a1.5 1.5 0 0 0-2 0l1 1.118Z"
        />
      </svg>
      <p>
        {{ $t('monitoring.offline.offline') }}
        <br />
        {{ $t('monitoring.offline.lastupdate') }}
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
