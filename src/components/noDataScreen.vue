<template>
  <div class="flex flex-col" style="width: 100%">
    <div id="" class="item">
      <va-icon name="cloud_sync" :size="100" />
      <p>
        {{ t('nodata.nodata') }}
        <br />
        {{ t('nodata.start') }}
        <router-link class="link" :to="{ name: 'boats' }">{{ t('nodata.start_link') }}</router-link>
        <br />
        {{ t('nodata.wait') }}
        <router-link class="link" :to="{ name: 'monitoring' }">{{ t('nodata.wait_link') }}</router-link>
        <br />
        {{ t('nodata.help') }}
        <router-link class="link" :to="{ name: 'faq' }">{{ t('nodata.help_link') }}</router-link>
        <br />
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
    font-size: large;
    color: var(--va-text-primary);
  }
  .link {
    color: blue;
  }
</style>
