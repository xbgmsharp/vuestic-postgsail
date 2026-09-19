<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.alerting') }}</h3>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.alerting') }}</label>
          <va-switch
            v-model="settings.preferences.alerting['enabled']"
            size="small"
            outline
            @update:modelValue="UpdateVessel('alerting', $event)"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.alerting_enabled') }}</p>
      </div>

      <template v-if="settings.preferences.alerting.enabled">
        <VaAlert class="rounded-lg p-4 m-0" color="info">
          <template #icon><VaIcon size="24px" name="notifications_active" /></template>
          <div class="flex flex-col space-y-1">
            <p class="text-regularLarge font-bold">{{ t('profile.alerting_enabled') }}</p>
            <p class="text-regularMedium">{{ t('profile.msg.alerting_info') }}</p>
          </div>
        </VaAlert>

        <div class="flex flex-col space-y-6 pl-4 border-l-2 border-primary">
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.min_notification_interval') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.min_notification_interval"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.high_wind_speed_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.high_wind_speed_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_outdoor_temperature_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.low_outdoor_temperature_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_indoor_temperature_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.low_indoor_temperature_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_water_temperature_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.low_water_temperature_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_water_depth_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.low_water_depth_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_pressure_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.low_pressure_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.high_pressure_drop_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.high_pressure_drop_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_battery_charge_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.low_battery_charge_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_battery_voltage_threshold') }}</label>
            <VaInput
              v-model.number="settings.preferences.alerting.low_battery_voltage_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import { onBeforeMount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useToast } from 'vuestic-ui'

  const { t } = useI18n()
  const { init: initToast } = useToast()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const { fetchSettings, updateVessel } = GlobalStore

  onBeforeMount(async () => {
    await fetchSettings()
  })

  const UpdateVessel = async (key, value) => {
    if (!key || typeof value === 'undefined') return
    const response = await updateVessel(key, value)
    initToast({
      message: response ? 'Successfully updated' : 'Error updating',
      position: 'top-right',
      color: response ? 'success' : 'warning',
    })
  }
</script>
