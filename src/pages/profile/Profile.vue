<template>
  <div>
    <va-card>
      <va-card-title>
        {{ t('profile.title') }}
      </va-card-title>
      <va-card-content>
        <va-tabs v-model="activeTabName" grow>
          <template #tabs>
            <va-tab name="OverviewTab">
              {{ t('profile.tabs.overview.title') }}
            </va-tab>
            <!--
            <va-tab name="MonitoringTab">
              {{ t('profile.tabs.monitoring.title') }}
            </va-tab>
-->
            <va-tab name="CorrelationsTab">
              {{ t('profile.tabs.correlations.title') }}
            </va-tab>

            <va-tab name="NotificationsTab">
              {{ t('profile.tabs.notifications.title') }}
            </va-tab>
          </template>
        </va-tabs>
        <va-separator />
        <component :is="tabs[activeTabName]" @submit="submit" />
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const tabs = {
    OverviewTab: defineAsyncComponent(() => import('./OverviewTab.vue')),
    //MonitoringTab: defineAsyncComponent(() => import('./Correlations.vue')),
    CorrelationsTab: defineAsyncComponent(() => import('./Correlations.vue')),
    NotificationsTab: defineAsyncComponent(() => import('./NotificationsTab.vue')),
  }

  const emit = defineEmits<{
    (e: 'submit', data: any): void
  }>()

  const activeTabName = ref<keyof typeof tabs>('OverviewTab')

  function submit(data: any) {
    emit('submit', data)
  }
</script>

<style lang="scss">
  .centerContainer {
    display: flex;
    justify-content: center;
  }
  .va-table {
    width: 100%;
  }
  .va-table .va-input-wrapper:not(.va-select__anchor) {
    margin-bottom: 1rem;
  }
  .va-table tbody > tr > td:first-child {
    font-weight: 700;
  }
  .sub-setting > td:first-child {
    padding-left: 2em;
    font-size: 0.9rem;
    font-weight: 600;
  }
  .overview-tab,
  .notifications-tab,
  .monitoring-tab {
    &__item {
      height: 55px;
      &-icon {
        min-width: 65px;
        max-width: 65px;
      }
    }
  }
</style>
