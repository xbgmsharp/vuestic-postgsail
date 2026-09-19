<template>
  <div class="flex flex-col space-y-4">
    <!-- NoForeignland -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">NoForeignland</h3>
      <p class="text-sm va-text-secondary">{{ t('profile.msg.noforeignland_enabled') }}</p>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.noforeignland_enabled') }}</label>
          <va-switch
            v-model="settings.preferences.noforeignland_enabled"
            size="small"
            outline
            @update:modelValue="UpdatePref('noforeignland_enabled', $event)"
          />
        </div>
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-regularMedium font-semibold">{{ t('profile.noforeignland_api_key') }}</label>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.noforeignland_api_key') }}</p>
        <VaInput
          v-model="localpref.noforeignland_api_key"
          outline
          placeholder="Paste your Boat API Key"
          @change="UpdatePref('noforeignland_api_key', localpref.noforeignland_api_key)"
        />
      </div>
    </div>

    <!-- MCP Integration -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.mcp_integration') }}</h3>
      <p class="text-sm va-text-secondary">{{ t('profile.msg.mcp_integration') }}</p>
      <div class="flex flex-wrap items-center gap-4">
        <GetMCPToken />
        <a href="https://github.com/xbgmsharp/postgsail-mcp-server" target="_blank" class="va-link link text-sm"
          >PostgSail MCP Server on GitHub</a
        >
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import { ref, onBeforeMount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useToast } from 'vuestic-ui'
  import GetMCPToken from './GetMCPToken.vue'

  const { t } = useI18n()
  const { init: initToast } = useToast()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const { fetchSettings, updatePref } = GlobalStore
  const localpref = ref({})

  onBeforeMount(async () => {
    await fetchSettings()
    localpref.value = GlobalStore.settings.preferences
  })

  const UpdatePref = async (key, value) => {
    if (!key || typeof value === 'undefined') return
    const response = await updatePref(key, value)
    initToast({
      message: response ? 'Successfully updated' : 'Error updating',
      position: 'top-right',
      color: response ? 'success' : 'warning',
    })
  }
</script>
