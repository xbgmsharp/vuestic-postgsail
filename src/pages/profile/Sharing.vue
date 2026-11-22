<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.public_profile') }}</h3>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.public_profile') }}</label>
          <va-switch
            v-model="settings.preferences.public_profile"
            size="small"
            outline
            @update:modelValue="UpdatePref('public_profile', $event)"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.public_profile') }}</p>
      </div>

      <template v-if="settings.preferences.public_profile">
        <VaAlert class="rounded-lg p-4 m-0" color="info">
          <template #icon><VaIcon size="24px" name="public" /></template>
          <div class="flex flex-col space-y-1">
            <p class="text-regularLarge font-bold">{{ t('profile.public_profile_enabled') }}</p>
            <p class="text-regularMedium">{{ t('profile.msg.public_profile_info') }}</p>
          </div>
        </VaAlert>

        <div class="flex flex-col space-y-6 pl-4 border-l-2 border-primary">
          <!-- Public boat name -->
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.public_name') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.public_name') }}</p>
            <div class="flex gap-2">
              <VaSelect
                v-model="vesselPrefix"
                :options="vesselPrefixOptions"
                value-by="value"
                text-by="description"
                outline
                class="w-48 shrink-0"
                @update:model-value="savePublicVessel"
              />
              <VaInput v-model.trim.lazy="vesselName" outline class="flex-grow" @change="savePublicVessel" />
            </div>
            <p v-if="error_vessel" class="text-sm text-danger">{{ error_vessel }}</p>
          </div>

          <!-- Stats -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_stats') }}</label>
              <va-switch
                v-model="settings.preferences.public_stats"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_stats', $event)"
              />
            </div>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.public_stats', [settings.public_vessel]) }}</p>
            <a
              :href="$t('profile.url.public_stats', [settings.public_vessel])"
              target="_blank"
              class="va-link link text-sm"
            >
              {{ $t('profile.url.public_stats', [settings.public_vessel]) }}
            </a>
          </div>

          <!-- Timelapse -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_timelapse') }}</label>
              <va-switch
                v-model="settings.preferences.public_timelapse"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_timelapse', $event)"
              />
            </div>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.public_timelapse', [settings.public_vessel]) }}</p>
            <a
              :href="$t('profile.url.public_timelapse', [settings.public_vessel])"
              target="_blank"
              class="va-link link text-sm"
            >
              {{ $t('profile.url.public_timelapse', [settings.public_vessel]) }}
            </a>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.public_timelapse3d', [settings.public_vessel]) }}</p>
            <a
              :href="$t('profile.url.public_timelapse3d', [settings.public_vessel])"
              target="_blank"
              class="va-link link text-sm"
            >
              {{ $t('profile.url.public_timelapse3d', [settings.public_vessel]) }}
            </a>
          </div>

          <!-- Logs list -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_logs_list') }}</label>
              <va-switch
                v-model="settings.preferences.public_logs_list"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_logs_list', $event)"
              />
            </div>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.public_logs_list', [settings.public_vessel]) }}</p>
            <a
              :href="$t('profile.url.public_logs_list', [settings.public_vessel])"
              target="_blank"
              class="va-link link text-sm"
            >
              {{ $t('profile.url.public_logs_list', [settings.public_vessel]) }}
            </a>
          </div>

          <!-- Log details -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_logs') }}</label>
              <va-switch
                v-model="settings.preferences.public_logs"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_logs', $event)"
              />
            </div>
            <p class="text-sm va-text-secondary">
              {{ $t('profile.msg.public_logs', [settings.public_vessel, '{id}']) }}
            </p>
          </div>

          <!-- Monitoring -->
          <div class="flex flex-col space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-regularMedium font-semibold">{{ t('profile.public_monitoring') }}</label>
              <va-switch
                v-model="settings.preferences.public_monitoring"
                size="small"
                outline
                @update:modelValue="UpdatePref('public_monitoring', $event)"
              />
            </div>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.public_monitoring', [settings.public_vessel]) }}</p>
            <a
              :href="$t('profile.url.public_monitoring', [settings.public_vessel])"
              target="_blank"
              class="va-link link text-sm"
            >
              {{ $t('profile.url.public_monitoring', [settings.public_vessel]) }}
            </a>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import { ref, computed, onBeforeMount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useToast } from 'vuestic-ui'

  const { t } = useI18n()
  const { init: initToast } = useToast()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const { fetchSettings, updatePref } = GlobalStore
  const localpref = ref({})
  const error_vessel = ref('')

  const vesselPrefixOptions = ref([
    { value: 'SV', text: 'SV', description: 'SV - Sailing Vessel' },
    { value: 'MV', text: 'MV', description: 'MV - Motor Vessel' },
    { value: 'SY', text: 'SY', description: 'SY - Sailing Yacht' },
    { value: 'MY', text: 'MY', description: 'MY - Motor Yacht' },
    { value: 'RV', text: 'RV', description: 'RV - Racing Vessel' },
  ])
  const vesselPrefix = ref('SV')
  const vesselName = ref('')

  const KNOWN_PREFIXES = vesselPrefixOptions.value.map((o) => o.value)

  const fullVesselName = computed(() => {
    const name = vesselName.value.replace(/\s+/g, '')
    return `${vesselPrefix.value}${name}`
  })

  onBeforeMount(async () => {
    await fetchSettings()
    localpref.value = GlobalStore.settings.preferences
    const val = localpref.value.public_vessel || ''
    // Support both legacy SV_Marlow and current SVMarlow formats
    const matched = KNOWN_PREFIXES.find((p) => val.startsWith(p + '_') || val.startsWith(p))
    if (matched) {
      vesselPrefix.value = matched
      const rest = val.startsWith(matched + '_') ? val.slice(matched.length + 1) : val.slice(matched.length)
      vesselName.value = rest
    } else {
      vesselPrefix.value = 'SV'
      vesselName.value = val
    }
  })

  const savePublicVessel = async () => {
    const combined = fullVesselName.value
    const ok = await UpdatePref('public_vessel', combined)
    if (ok) settings.value.public_vessel = combined
  }

  const UpdatePref = async (key, value) => {
    if (!key || typeof value === 'undefined') return false
    if (key === 'public_vessel') {
      const regex = /^\w{3,15}$/
      if (!regex.test(value)) {
        error_vessel.value = 'Name must be alphanumeric/underscore, combined 3–15 chars (e.g. SV_Marlow)'
        return false
      }
      error_vessel.value = ''
    }
    const response = await updatePref(key, value)
    initToast({
      message: response ? 'Successfully updated' : 'Error updating',
      position: 'top-right',
      color: response ? 'success' : 'warning',
    })
    return !!response
  }
</script>
