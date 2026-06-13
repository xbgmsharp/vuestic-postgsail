<template>
  <div class="flex flex-col space-y-6 md:space-y-4">
    <!-- Email Notifications Section -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.tabs.notifications.title') }}</h3>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.email_notifications') }}</label>
          <va-switch
            v-model="settings.preferences.email_notifications"
            size="small"
            outline
            @update:modelValue="UpdatePref('email_notifications', $event)"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.email_notifications') }}</p>
      </div>
    </div>

    <!-- Phone Notifications Section -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.phone_notifications') }}</h3>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.phone_notifications') }}</label>
          <va-switch
            v-model="settings.preferences.phone_notifications"
            size="small"
            outline
            @click="handleLink()"
            @update:modelValue="UpdatePref('phone_notifications', $event)"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.phone_notifications') }}</p>
      </div>

      <!-- Phone Notification Services -->
      <template v-if="settings.preferences.phone_notifications">
        <VaAlert class="rounded-lg p-4 m-0" color="info">
          <template #icon>
            <VaIcon size="24px" name="notifications_active" />
          </template>
          <div class="flex flex-col space-y-2">
            <p class="text-regularLarge font-bold">{{ t('profile.phone_notifications_enabled') }}</p>
            <p class="text-regularMedium">{{ t('profile.msg.phone_notifications_info') }}</p>
          </div>
        </VaAlert>

        <div class="flex flex-col space-y-6 pl-4 border-l-2 border-primary">
          <!-- Pushover Integration -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.pushover.pushover') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.pushover') }}</p>
            <div>
              <template
                v-if="!settings.preferences['pushover_user_key'] || !settings.preferences.pushover_user_key.length"
              >
                <a :href="pushover_link" target="_blank" class="va-link link text-sm">
                  {{ t('profile.pushover.link') }}
                </a>
              </template>
              <template v-else>
                <div class="flex items-center space-x-2">
                  <VaIcon name="check_circle" color="success" />
                  <span class="text-sm font-semibold text-success">{{ t('profile.pushover.connected') }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Telegram Bot Integration -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.telegram_bot.telegram_bot') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.telegram_bot') }}</p>
            <div>
              <template v-if="!settings.preferences['telegram'] || !settings.preferences['telegram']['from']">
                <a :href="telegram_link" target="_blank" class="va-link link text-sm">
                  {{ t('profile.telegram_bot.link') }}
                </a>
              </template>
              <template v-else>
                <div class="flex items-center space-x-2">
                  <VaIcon name="check_circle" color="success" />
                  <span class="text-sm font-semibold text-success">{{ t('profile.telegram_bot.connected') }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Position Reporting Section -->
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.position_reporting') }}</h3>

      <div class="flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-regularMedium font-semibold">{{ t('profile.position_reporting') }}</label>
          <va-switch
            v-model="settings.preferences.position_reporting"
            size="small"
            outline
            @update:modelValue="UpdatePref('position_reporting', $event)"
          />
        </div>
        <p class="text-sm va-text-secondary">{{ t('profile.msg.position_reporting') }}</p>
      </div>

      <!-- Position Reporting Interval -->
      <template v-if="settings.preferences.position_reporting">
        <VaAlert class="rounded-lg p-4 m-0" color="info">
          <template #icon>
            <VaIcon size="24px" name="share_location" />
          </template>
          <div class="flex flex-col space-y-2">
            <p class="text-regularLarge font-bold">{{ t('profile.position_reporting_enabled') }}</p>
            <p class="text-regularMedium">{{ t('profile.msg.position_reporting_info') }}</p>
          </div>
        </VaAlert>

        <div class="flex flex-col space-y-6 pl-4 border-l-2 border-primary">
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.position_reporting_interval') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.position_reporting_interval') }}</p>
            <VaInput
              v-model.number="settings.preferences.position_reporting_interval"
              mask="numeral"
              outline
              @change="UpdatePref('position_reporting_interval', settings.preferences.position_reporting_interval)"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Alerting Section -->
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
        <p class="text-sm va-text-secondary">{{ t('profile.msg.alerting') }}</p>
      </div>

      <!-- Alerting Thresholds -->
      <template v-if="settings.preferences.alerting.enabled">
        <VaAlert class="rounded-lg p-4 m-0" color="info">
          <template #icon>
            <VaIcon size="24px" name="notifications_active" />
          </template>
          <div class="flex flex-col space-y-2">
            <p class="text-regularLarge font-bold">{{ t('profile.alerting_enabled') }}</p>
            <p class="text-regularMedium">{{ t('profile.msg.alerting_info') }}</p>
          </div>
        </VaAlert>

        <div class="flex flex-col space-y-6 pl-4 border-l-2 border-primary">
          <!-- Min Notification Interval -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.min_notification_interval') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.min_notification_interval') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.min_notification_interval"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- High Wind Speed Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.high_wind_speed_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.high_wind_speed_threshold') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.high_wind_speed_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- Low Outdoor Temperature Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_outdoor_temperature_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.low_outdoor_temperature_threshold') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.low_outdoor_temperature_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- Low Indoor Temperature Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_indoor_temperature_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.low_indoor_temperature_threshold') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.low_indoor_temperature_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- Low Water Temperature Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_water_temperature_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.low_water_temperature_threshold') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.low_water_temperature_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- Low Water Depth Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_water_depth_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.low_water_depth_threshold') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.low_water_depth_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- Low Pressure Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_pressure_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.low_pressure_threshold') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.low_pressure_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- High Pressure Drop Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.high_pressure_drop_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.high_pressure_drop_threshold') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.high_pressure_drop_threshold"
              mask="numeral"
              outline
              @change="UpdateVessel('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- Low Battery Charge Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_battery_charge_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.low_battery_charge_threshold') }}</p>
            <VaInput
              v-model.number="settings.preferences.alerting.low_battery_charge_threshold"
              mask="numeral"
              outline
              @change="UpdatePref('alerting', settings.preferences.alerting)"
            />
          </div>

          <!-- Low Battery Voltage Threshold -->
          <div class="flex flex-col space-y-2">
            <label class="text-regularMedium font-semibold">{{ t('profile.low_battery_voltage_threshold') }}</label>
            <p class="text-sm va-text-secondary">{{ t('profile.msg.low_battery_voltage_threshold') }}</p>
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
  // TODO update setup with lang="ts"
  import { useI18n } from 'vue-i18n'
  import { ref, onBeforeMount } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import PostgSail from '../../services/api-client'
  import { useToast } from 'vuestic-ui'
  import settingsData from '../../data/settings.json'

  const { t } = useI18n()
  const { init: initToast } = useToast()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const { fetchSettings, updatePref, updateVessel } = GlobalStore

  onBeforeMount(async () => {
    console.log(`onBeforeMount NotificationsTab`)
    await fetchSettings(true)
    console.log(`${settings.value.first} ${settings.value.last}`)
  })

  // TODO Issue getting default value as per store setup
  const isBusy = ref(false)
  const apiError = ref('')
  const pushover_link = ref('')
  const telegram_link = ref('https://t.me/pgsail_bot')

  async function handleLink(event) {
    if (
      settings.preferences &&
      settings.preferences['pushover_user_key'] &&
      settings.preferences.pushover_user_key.length > 10
    ) {
      console.log(event)
      return
    }

    isBusy.value = true
    apiError.value = null

    const api = new PostgSail()
    try {
      const response = await api.pushover_link()
      if (response && response.pushover_link && response.pushover_link.link) {
        pushover_link.value = response.pushover_link.link
      }
    } catch (e) {
      apiError.value = e
      console.error('Error generating pushover subscription link', apiError.value)
    } finally {
      isBusy.value = false
    }
  }

  //const UpdatePref = async (key: string, value: any) => {
  const UpdatePref = async (key, value) => {
    if (!key || typeof value === 'undefined') {
      return
    }

    if (key === 'alerting' && typeof value === 'object') {
      console.debug(`Updating ${key}:`, JSON.stringify(value))
    } else if (key === 'alerting' && typeof value === 'boolean') {
      console.debug(`Updating ${key}:`, `{"enabled": ${value}}`)
      value = `{"enabled": ${value}}`
    } else {
      console.debug(`Updating ${key}:${value}`)
    }

    const response = await updatePref(key, value)

    if (typeof value === 'object') {
      value = ''
    }

    // Notify user on success or failure using va-toast.
    initToast({
      message: response ? `Successfully updated ${key} with ${value}` : `Error updated ${key} with ${value}`,
      position: 'top-right',
      color: 'primary',
      //color: response ? 'success' : 'warning',
    })
  }
  const UpdateVessel = async (key, value) => {
    if (!key || typeof value === 'undefined') {
      return
    }

    if (key === 'alerting' && typeof value === 'object') {
      console.debug(`Updating ${key}:`, JSON.stringify(value))
    }

    const response = await updateVessel(key, value)

    if (typeof value === 'object') {
      value = ''
    }

    // Notify user on success or failure using va-toast.
    initToast({
      message: response ? `Successfully updated ${key}` : `Error updated ${key}`,
      position: 'top-right',
      color: 'primary',
      //color: response ? 'success' : 'warning',
    })
  }
</script>
