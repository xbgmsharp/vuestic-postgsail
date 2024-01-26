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
      <br />
      <div>
        <strong>Getting Started with PostgSail</strong><br />
        Getting Started with PostgSail Welcome! The first step to get started is to link your boat monitoring device
        with PostgSail. PostgSail is compatible with Victron GX monitoring devices that are integrated with your boat
        network with a NMEA 2000 cable. If you are an advanced user, you can also run PostgSail on a Raspberry Pi or any
        other device that supports the open Signal K platform. Once you have Signal K enabled, go to the App Store and
        download the PostgSail plugin. Make sure it is connected to the Internet.
      </div>
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
    cursor: pointer;
  }
  .link:hover {
    text-decoration: underline blue;
  }
</style>
