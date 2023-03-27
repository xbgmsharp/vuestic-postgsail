<template>
  <div class="notifications-tab pt-2 layout">
    <div class="va-table-responsive">
      <table class="va-table va-table--striped va-table--hoverable">
        <tbody>
          <tr>
            <td>{{ t('profile.email_notifications') }}</td>
            <td>
              <div class="centerContainer">
                <va-switch v-model="settings.preferences.email_notifications" size="small" />
              </div>
            </td>
          </tr>
          <tr>
            <td>{{ t('profile.phone_notifications') }}</td>
            <td>
              <div class="centerContainer">
                <va-switch v-model="settings.preferences.phone_notifications" size="small" @click="handleLink()" />
              </div>
            </td>
          </tr>
          <template v-if="settings.preferences.phone_notifications">
            <tr>
              <td>&nbsp;&nbsp;&nbsp;{{ t('profile.pushover') }}</td>
              <td>
                <div class="centerContainer">
                  <template
                    v-if="!settings.preferences['pushover_user_key'] || !settings.preferences.pushover_user_key.length"
                  >
                    <a :href="pushover_link" target="_bank">Link Your Pushover Account to Enable</a>
                  </template>
                  <template v-else> Your user is connected to Pushover. </template>
                </div>
              </td>
            </tr>
            <tr>
              <td>&nbsp;&nbsp;&nbsp;{{ t('profile.telegram_bot') }}</td>
              <td>
                <div class="centerContainer">
                  <template v-if="!settings.preferences['telegram'] || settings.preferences.telegram.length">
                    <a :href="telegram_link" target="_bank">Add PostgSail bot to a group or direct chat.</a>
                  </template>
                  <template v-else> Your user is connected to @postgsail_bot. </template>
                </div>
              </td>
            </tr>
          </template>
          <tr>
            <td>{{ t('profile.alerting') }}</td>
            <td>
              <div class="centerContainer">
                <va-switch v-model="settings.preferences.alerting.enabled" size="small" />
              </div>
            </td>
          </tr>
          <template v-if="settings.preferences.alerting.enabled">
            <tr class="sub-setting">
              <td>{{ t('profile.min_notification_interval') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.min_notification_interval" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.high_wind_speed_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.high_wind_speed_threshold" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.low_outdoor_temperature_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.low_outdoor_temperature_threshold" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.low_indoor_temperature_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.low_indoor_temperature_threshold" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.low_water_temperature_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.low_water_temperature_threshold" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.low_water_depth_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.low_water_depth_threshold" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.low_pressure_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.low_pressure_threshold" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.high_pressure_drop_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.high_pressure_drop_threshold" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.low_battery_charge_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.low_battery_charge_threshold" />
                </div>
              </td>
            </tr>
            <tr class="sub-setting">
              <td>{{ t('profile.low_battery_voltage_threshold') }}</td>
              <td>
                <div>
                  <va-input v-model="settings.preferences.alerting.low_battery_voltage_threshold" />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
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
  const { fetchSettings, updatePref } = GlobalStore

  onBeforeMount(async () => {
    console.log(`onBeforeMount NotificationsTab`)
    await fetchSettings()
    console.log(`${settings.value.first} ${settings.value.last}`)
  })
  // TODO Issue getting default value as per store setup
  const isBusy = ref(false)
  const apiError = ref('')
  const pushover_link = ref('')
  const telegram_link = ref('https://t.me/pgsail_bot')

  async function handleLink() {
    if (
      settings.preferences &&
      settings.preferences['pushover_user_key'] &&
      settings.preferences.pushover_user_key.length > 10
    ) {
      return
    }
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.pushover_link()
      if (response.data && response.data.pushover_link && response.data.pushover_link.link) {
        pushover_link.value = response.data.pushover_link.link
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
    if (!key || typeof value == 'undefined') {
      return
    }
    console.debug(`Updating ${key}:${value}`)
    // Update GlobalStore should be automatic maybe need to use reactive()
    // API Call api.update_user_preferences({ key: ${key}, value: ${value} }) from the store
    const response = await updatePref(key, value)
    // Notify user on success or failure using va-toast.
    initToast({
      message: response.ok ? `Successfully updated ${key} with ${value}` : `Error updated ${key} with ${value}`,
      position: 'top-right',
      color: 'primary',
      //color: response.ok ? 'success' : 'warning',
    })
  }
</script>
