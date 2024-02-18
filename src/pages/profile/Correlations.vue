<template>
  <div class="monitoring-tab pt-2 layout">
    <div class="va-table-responsive">
      <h2 class="va-text-center">Map SignalK instances to PostgSail instances</h2>
      <table class="va-table va-table--striped va-table--hoverable">
        <tbody>
          <tr>
            <td>
              {{ t('profile.monitoring.depthKey') }}
            </td>
            <td>
              <template v-if="sk_keys.depthKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.depthKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="environment_keys.length >= 1"
                  :data="sk_keys.depthKey.key"
                  :object="environment_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref"
                /> </template
              ><br />
              <div>Default: environment.depth.belowTransducer</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.waterTemperatureKey') }}
            </td>
            <td>
              <template v-if="sk_keys.waterTemperatureKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.waterTemperatureKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="temperatures_keys.length >= 1"
                  :data="sk_keys.waterTemperatureKey.key"
                  :object="temperatures_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref"
                />
              </template>
              <br />
              <div>Default: environment.water.temperature</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.windSpeedKey') }}
            </td>
            <td>
              <template v-if="sk_keys.windSpeedKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.windSpeedKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="wind_keys.length >= 1"
                  :data="sk_keys.windSpeedKey.key"
                  :object="wind_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref"
                />
              </template>
              <br />
              <div>Default: environment.wind.speedTrue</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.windDirectionKey') }}
            </td>
            <td>
              <template v-if="sk_keys.windDirectionKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.windDirectionKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="wind_keys.length >= 1"
                  :data="sk_keys.windDirectionKey.key"
                  :object="wind_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: environment.wind.directionTrue</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.insidePressureKey') }}
            </td>
            <td>
              <template v-if="sk_keys.insidePressureKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.insidePressureKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="pressure_keys.length >= 1"
                  :data="sk_keys.insidePressureKey.key"
                  :object="pressure_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: environment.inside.pressure</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.outsidePressureKey') }}
            </td>
            <td>
              <template v-if="sk_keys.outsidePressureKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.outsidePressureKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="pressure_keys.length >= 1"
                  :data="sk_keys.outsidePressureKey.key"
                  :object="pressure_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: environment.outside.pressure</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.insideTemperatureKey') }}
            </td>
            <td>
              <template v-if="sk_keys.insideTemperatureKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.insideTemperatureKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="temperatures_keys.length >= 1"
                  :data="sk_keys.insideTemperatureKey.key"
                  :object="temperatures_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: environment.inside.temperature</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.outsideTemperatureKey') }}
            </td>
            <td>
              <template v-if="sk_keys.outsideTemperatureKey.exist">
                <va-chip outline color="success">{{
                  settings?.preferences?.monitoring?.outsideTemperatureKey
                }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="temperatures_keys.length >= 1"
                  :data="sk_keys.outsideTemperatureKey.key"
                  :object="temperatures_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: environment.outside.temperature</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.insideHumidityKey') }}
            </td>
            <td>
              <template v-if="sk_keys.insideHumidityKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.insideHumidityKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="humidity_keys.length >= 1"
                  :data="sk_keys.insideHumidityKey.key"
                  :object="humidity_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: environment.inside.relativeHumidity</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.outsideHumidityKey') }}
            </td>
            <td>
              <template v-if="sk_keys.outsideHumidityKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.outsideHumidityKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="humidity_keys.length >= 1"
                  :data="sk_keys.outsideHumidityKey.key"
                  :object="humidity_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: environment.outside.relativeHumidity</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.stateOfChargeKey') }}
            </td>
            <td>
              <template v-if="sk_keys.stateOfChargeKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.stateOfChargeKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="stateOfCharge_keys.length >= 1"
                  :data="sk_keys.stateOfChargeKey.key"
                  :object="stateOfCharge_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: electrical.batteries.House.capacity.stateOfCharge</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.voltageKey') }}
            </td>
            <td>
              <template v-if="sk_keys.voltageKey.exist">
                <va-chip outline color="success">{{ settings?.preferences?.monitoring?.voltageKey }}</va-chip>
              </template>
              <template v-else>
                <MySelect
                  v-if="batteryVoltage_keys.length >= 1"
                  :data="sk_keys.voltageKey.key"
                  :object="batteryVoltage_keys"
                  :sk_key="settings.preferences.monitoring"
                  @clickFromChildComponent="UpdatePref" /></template
              ><br />
              <div>Default: electrical.batteries.House.voltage</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import { ref, onBeforeMount, onMounted, reactive, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useToast } from 'vuestic-ui'
  import settingsData from '../../data/settings.json'
  import MySelect from '../../components/SelectSearchable.vue'

  const { t } = useI18n()
  const { init: initToast } = useToast()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const { fetchSettings, updatePref } = GlobalStore

  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(null)
  const apiData = reactive([])
  const offline = ref(false)

  const sk_keys = computed(() => {
    return {
      depthKey: {
        key: settings?.preferences?.monitoring?.depthKey || '',
        exist: environment_keys.value.indexOf(settings?.preferences?.monitoring?.depthKey) || false,
      },
      windSpeedKey: {
        key: settings?.preferences?.monitoring?.windSpeedKey || '',
        exist: wind_keys.value.indexOf(settings?.preferences?.monitoring?.windSpeedKey) || false,
      },
      windDirectionKey: {
        key: settings?.preferences?.monitoring?.outsideHumidityKey || '',
        exist: wind_keys.value.indexOf(settings?.preferences?.monitoring?.windSpeedKey) || false,
      },
      insideHumidityKey: {
        key: settings?.preferences?.monitoring?.insideHumidityKey || '',
        exist: humidity_keys.value.indexOf(settings?.preferences?.monitoring?.insideHumidityKey) || false,
      },
      outsideHumidityKey: {
        key: settings?.preferences?.monitoring?.outsideHumidityKey || '',
        exist: humidity_keys.value.indexOf(settings?.preferences?.monitoring?.outsideHumidityKey) || false,
      },
      insidePressureKey: {
        key: settings?.preferences?.monitoring?.insidePressureKey || '',
        exist: pressure_keys.value.indexOf(settings?.preferences?.monitoring?.insidePressureKey) || false,
      },
      outsidePressureKey: {
        key: settings?.preferences?.monitoring?.outsidePressureKey || '',
        exist: pressure_keys.value.indexOf(settings?.preferences?.monitoring?.outsidePressureKey) || false,
      },
      waterTemperatureKey: {
        key: settings?.preferences?.monitoring?.waterTemperatureKey || '',
        exist: temperatures_keys.value.indexOf(settings?.preferences?.monitoring?.waterTemperatureKey) || false,
      },
      insideTemperatureKey: {
        key: settings?.preferences?.monitoring?.insideTemperatureKey || '',
        exist: temperatures_keys.value.indexOf(settings?.preferences?.monitoring?.insideTemperatureKey) || false,
      },
      outsideTemperatureKey: {
        key: settings?.preferences?.monitoring?.outsideTemperatureKey || '',
        exist: temperatures_keys.value.indexOf(settings?.preferences?.monitoring?.outsideTemperatureKey) || false,
      },
      stateOfChargeKey: {
        key: settings?.preferences?.monitoring?.stateOfChargeKey || '',
        exist: stateOfCharge_keys.value.indexOf(settings?.preferences?.monitoring?.stateOfChargeKey) || false,
      },
      voltageKey: {
        key: settings?.preferences?.monitoring?.voltageKey || '',
        exist: batteryVoltage_keys.value.indexOf(settings?.preferences?.monitoring?.voltageKey) || false,
      },
    }
  })
  const environment_keys = computed(() => {
    const f = Array.isArray(apiData.value)
      ? apiData.value
          .map((row) => row.key)
          .filter((row) => {
            return row.toLowerCase().includes('environment')
          })
      : []
    console.log(f)
    return f
  })
  const stateOfCharge_keys = computed(() => {
    const re = new RegExp(/electrical\.batteries\..*\.stateOfCharge/, 'i')
    const f = Array.isArray(apiData.value)
      ? apiData.value
          .map((row) => row.key)
          .filter((row) => {
            return re.test(row.toLowerCase())
          })
      : []
    console.log(f)
    return f
  })
  const batteryVoltage_keys = computed(() => {
    const re = new RegExp(/electrical\.batteries\..*\.voltage/, 'i')
    const f = Array.isArray(apiData.value)
      ? apiData.value
          .map((row) => row.key)
          .filter((row) => {
            return re.test(row.toLowerCase())
          })
      : []
    console.log(f)
    return f
  })
  const temperatures_keys = computed(() => {
    const re = new RegExp(/environment\..*\.temperature/, 'i')
    const f = Array.isArray(apiData.value)
      ? apiData.value
          .map((row) => row.key)
          .filter((row) => {
            return re.test(row.toLowerCase())
          })
      : []
    console.log(f)
    return f
  })
  const humidity_keys = computed(() => {
    const f = Array.isArray(apiData.value)
      ? apiData.value
          .map((row) => row.key)
          .filter((row) => {
            return row.toLowerCase().includes('humidity')
          })
      : []
    console.log(f)
    return f
  })
  const pressure_keys = computed(() => {
    const f = Array.isArray(apiData.value)
      ? apiData.value
          .map((row) => row.key)
          .filter((row) => {
            return row.toLowerCase().includes('pressure')
          })
      : []
    console.log(f)
    return f
  })
  const wind_keys = computed(() => {
    const f = Array.isArray(apiData.value)
      ? apiData.value
          .map((row) => row.key)
          .filter((row) => {
            return row.toLowerCase().includes('wind')
          })
      : []
    console.log(f)
    return f
  })

  // TODO Issue getting default value as per store setup
  onBeforeMount(async () => {
    console.log(`onBeforeMount Correlation Tab`)
    await fetchSettings()
    console.log('Correlation Tab onBeforeMount', `${settings.value.first} ${settings.value.last}`)
  })

  //const UpdatePref = async (key: string, value: any) => {
  const UpdatePref = async (key, value) => {
    console.log(key, value)
    if (!key || typeof value == 'undefined') return
    if (key === 'monitoring' && typeof value === 'object') {
      console.debug(`Updating ${key}:`, JSON.stringify(value))
    }
    console.debug('Correlation Tab UpdatePref', `Updating ${key}: ${value}`)
    console.debug(JSON.stringify(key))
    // Update GlobalStore should be automatic maybe need to use reactive()
    // API Call api.update_user_preferences({ key: ${key}, value: ${value} }) from the store
    //const response = await updatePref('monitoring', `{"${key}": "${value}"}`)
    const response = await updatePref('monitoring', JSON.stringify(key))
    // Notify user on success or failure using va-toast.
    initToast({
      message: `${response ? 'Successfully updated' : 'Error updating'} ${key} with ${value}`,
      position: 'top-right',
      color: 'primary',
      //color: response.ok ? 'success' : 'warning',
    })
  }

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.explore()
      if (Array.isArray(response)) {
        console.log('Correlation Tab', response)
        apiData.value = response
        console.log('Correlation Tab', apiData.value)
        apiSuccess.value = true
        offline.value = false
      } else {
        console.warn('Correlation Tab', response)
        //throw { response }
      }
    } catch ({ response }) {
      console.log(response)
      apiError.value = t('monitoring.error')
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
      }
    } finally {
      isBusy.value = false
    }
  })
</script>
