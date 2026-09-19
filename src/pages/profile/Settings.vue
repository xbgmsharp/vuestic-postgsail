<template>
  <div class="flex flex-col space-y-6 md:space-y-4 text-black dark:text-white">
    <va-card>
      <va-card-title>
        {{ t('profile.title') }}
      </va-card-title>
      <va-card-content>
        <va-tabs v-model="activeTabName" grow>
          <template #tabs>
            <va-tab name="OverviewTab">{{ t('profile.tabs.overview.title') }}</va-tab>
            <va-tab name="SharingTab">{{ t('profile.tabs.sharing.title') }}</va-tab>
            <va-tab name="StaysTypeTab">{{ t('profile.stays_type.title') }}</va-tab>
            <va-tab name="NotificationsTab">{{ t('profile.tabs.notifications.title') }}</va-tab>
            <va-tab name="AlertingTab">{{ t('profile.tabs.alerting.title') }}</va-tab>
            <va-tab name="IntegrationsTab">{{ t('profile.tabs.integrations.title') }}</va-tab>
          </template>
        </va-tabs>
        <va-separator />
        <div class="max-w-full overflow-x-hidden pt-4">
          <component :is="tabs[activeTabName]" @submit="submit" />
        </div>
      </va-card-content>
    </va-card>
  </div>
</template>

<script lang="ts" setup>
  import { defineAsyncComponent, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const tabs = {
    OverviewTab: defineAsyncComponent(() => import('./Overview.vue')),
    SharingTab: defineAsyncComponent(() => import('./Sharing.vue')),
    StaysTypeTab: defineAsyncComponent(() => import('./StaysType.vue')),
    NotificationsTab: defineAsyncComponent(() => import('./Notifications.vue')),
    AlertingTab: defineAsyncComponent(() => import('./Alerting.vue')),
    IntegrationsTab: defineAsyncComponent(() => import('./Integrations.vue')),
  }

  const emit = defineEmits<{
    (e: 'submit', data: any): void
  }>()

  const activeTabName = ref<keyof typeof tabs>('OverviewTab')

  function submit(data: any) {
    emit('submit', data)
  }
</script>
