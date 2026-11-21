<template>
  <div class="flex flex-col space-y-4">
    <!-- NoForeignland -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <div class="flex items-center justify-between gap-2">
        <h3 class="h3">NoForeignland</h3>
        <VaChip size="small" outline :color="status.color">
          {{ t(`profile.noforeignland.status_${status.key}`) }}
        </VaChip>
      </div>
      <p class="text-sm va-text-secondary">{{ t('profile.msg.noforeignland_enabled') }}</p>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.noforeignland_enabled') }}</label>
          <VaSwitch
            :model-value="nfl.enabled"
            size="small"
            outline
            :disabled="needsKey"
            @update:model-value="saveField('enabled', $event)"
          />
        </div>
        <p v-if="needsKey" class="text-sm va-text-secondary">{{ t('profile.noforeignland.enable_requires_key') }}</p>
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-regularMedium font-semibold">{{ t('profile.noforeignland_api_key') }}</label>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.noforeignland_api_key') }}</p>
        <VaInput
          v-model="apiKey"
          :type="showKey ? 'text' : 'password'"
          outline
          autocomplete="off"
          :placeholder="t('profile.noforeignland.api_key_placeholder')"
          @change="saveApiKey"
        >
          <template #appendInner>
            <VaIcon
              :name="showKey ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              :title="t(showKey ? 'profile.noforeignland.hide_key' : 'profile.noforeignland.show_key')"
              @click="showKey = !showKey"
            />
          </template>
        </VaInput>
      </div>

      <!-- Sync status: last_metric, last_sent and error are written by the backend -->
      <div v-if="hasSyncData" class="flex flex-col space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span class="va-text-secondary">{{ t('profile.noforeignland.last_metric') }}</span>
          <span>{{ formatTs(nfl.last_metric) }}</span>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span class="va-text-secondary">{{ t('profile.noforeignland.last_sent') }}</span>
          <span>{{ formatTs(nfl.last_sent) }}</span>
        </div>
        <VaAlert v-if="currentError" color="danger" outline class="m-0">
          <div class="text-sm font-semibold">
            {{ t('profile.noforeignland.last_error') }}
            <span v-if="currentError.at"> · {{ dateFormatUTC(currentError.at) }}</span>
          </div>
          <div class="text-sm">{{ currentError.message }}</div>
        </VaAlert>
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
  import { ref, computed, onBeforeMount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useToast } from 'vuestic-ui'
  import { useGlobalStore } from '../../stores/global-store'
  import { dateFormatUTC, fromNow } from '../../utils/dateFormatter.js'
  import GetMCPToken from './GetMCPToken.vue'

  const { t } = useI18n()
  const { init: initToast } = useToast()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const { fetchSettings, updatePref } = GlobalStore

  const apiKey = ref('')
  const showKey = ref(false)

  /*
   * preferences.noforeignland = { enabled, api_key, last_metric, last_sent, error }
   * The UI writes enabled and api_key only, each through its own jsonb path, so it
   * never overwrites the fields the backend updates.
   * Until the object exists, values come from the legacy flat keys
   * (noforeignland_enabled / noforeignland_api_key) and the first save carries them over.
   */
  const hasObject = () => {
    const obj = settings.value?.preferences?.noforeignland
    return !!obj && typeof obj === 'object' && !Array.isArray(obj)
  }

  const nfl = computed(() => {
    const prefs = settings.value?.preferences || {}
    if (hasObject()) return { enabled: false, api_key: '', ...prefs.noforeignland }
    return {
      enabled: String(prefs.noforeignland_enabled) === 'true',
      api_key: prefs.noforeignland_api_key || '',
    }
  })

  // The switch can always be turned off, but only turned on once a key is saved.
  const needsKey = computed(() => !nfl.value.enabled && !nfl.value.api_key)

  const toMs = (value) => {
    const ms = Date.parse(value)
    return Number.isNaN(ms) ? null : ms
  }

  // error is "<ISO 8601 timestamp> <message>", e.g. "2026-11-21T09:28:16+00:00 Invalid boat API key"
  const parsedError = computed(() => {
    const raw = nfl.value.error
    if (!raw) return null
    const match = String(raw)
      .trim()
      .match(/^(\d{4}-\d{2}-\d{2}T\S+)\s+([\s\S]*)$/)
    if (match && toMs(match[1]) !== null) return { at: match[1], message: match[2] }
    return { at: null, message: String(raw) }
  })

  // An error older than the last successful upload has been resolved since.
  const currentError = computed(() => {
    const err = parsedError.value
    if (!err) return null
    const errAt = toMs(err.at)
    const sentAt = toMs(nfl.value.last_sent)
    return errAt === null || sentAt === null || errAt > sentAt ? err : null
  })

  const status = computed(() => {
    if (!nfl.value.enabled) return { key: 'disabled', color: 'secondary' }
    if (currentError.value) return { key: 'error', color: 'danger' }
    if (nfl.value.last_sent) return { key: 'active', color: 'success' }
    return { key: 'pending', color: 'info' }
  })

  const hasSyncData = computed(() => !!(nfl.value.last_metric || nfl.value.last_sent || currentError.value))

  const formatTs = (value) =>
    toMs(value) === null ? t('profile.noforeignland.never') : `${dateFormatUTC(value)} (${fromNow(value)})`

  onBeforeMount(async () => {
    await fetchSettings()
    apiKey.value = nfl.value.api_key
  })

  const saveField = async (field, value) => {
    // Never send null: jsonb_set() returns NULL and the whole preferences column is wiped.
    if (value === null || typeof value === 'undefined') return false
    const prefs = settings.value.preferences
    const nested = hasObject()
    let response
    if (nested) {
      // update_user_preferences_fn casts the key to text[]: '{noforeignland,enabled}'
      response = await updatePref(`noforeignland,${field}`, value)
    } else {
      // jsonb_set() leaves the document unchanged when a parent key is missing (and still
      // returns true), so the first save writes the whole object.
      const seed = { enabled: nfl.value.enabled, api_key: nfl.value.api_key, [field]: value }
      response = await updatePref('noforeignland', JSON.stringify(seed))
      if (response === true) prefs.noforeignland = seed
    }
    const ok = response === true
    // updatePref() does not update the store, so mirror the change locally.
    if (ok && nested) prefs.noforeignland[field] = value
    initToast({
      message: ok ? 'Successfully updated' : 'Error updating',
      position: 'top-right',
      color: ok ? 'success' : 'warning',
    })
    return ok
  }

  const saveApiKey = async () => {
    const value = (apiKey.value || '').trim()
    apiKey.value = value
    if (value === nfl.value.api_key) return
    await saveField('api_key', value)
  }
</script>
