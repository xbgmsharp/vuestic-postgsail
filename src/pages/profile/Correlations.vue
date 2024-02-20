<template>
  <div class="monitoring-tab pt-2 layout">
    <div class="va-table-responsive">
      <h2 class="va-text-center">Map SignalK path to PostgSail</h2>
      <table class="va-table va-table--striped va-table--hoverable">
        <tbody>
          <tr>
            <td>
              {{ t('profile.monitoring.depthKey') }}
            </td>
            <td>
              <MySelect
                v-if="environment_keys.length >= 1"
                :data="settings?.preferences?.monitoring?.depthKey"
                :object="environment_keys"
                :sk_key="settings.preferences.monitoring"
                map="depthKey"
                @clickFromChildComponent="UpdatePref"
              />
              <br />
              <div>Default: environment.depth.belowTransducer</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.waterTemperatureKey') }}
            </td>
            <td>
              <MySelect
                v-if="temperatures_keys.length >= 1"
                :data="settings.preferences.monitoring.waterTemperatureKey"
                :object="temperatures_keys"
                :sk_key="settings.preferences.monitoring"
                map="waterTemperatureKey"
                @clickFromChildComponent="UpdatePref"
              />
              <br />
              <div>Default: environment.water.temperature</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.windSpeedKey') }}
            </td>
            <td>
              <MySelect
                v-if="wind_keys.length >= 1"
                :data="settings.preferences.monitoring.windSpeedKey"
                :object="wind_keys"
                :sk_key="settings.preferences.monitoring"
                map="windSpeedKey"
                @clickFromChildComponent="UpdatePref"
              />
              <br />
              <div>Default: environment.wind.speedTrue</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.windDirectionKey') }}
            </td>
            <td>
              <MySelect
                v-if="wind_keys.length >= 1"
                :data="settings.preferences.monitoring.windDirectionKey"
                :object="wind_keys"
                :sk_key="settings.preferences.monitoring"
                map="windDirectionKey"
                @clickFromChildComponent="UpdatePref"
              />
              <br />
              <div>Default: environment.wind.directionTrue</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.insidePressureKey') }}
            </td>
            <td>
              <MySelect
                v-if="pressure_keys.length >= 1"
                :data="settings.preferences.monitoring.insidePressureKey"
                :object="pressure_keys"
                :sk_key="settings.preferences.monitoring"
                map="insidePressureKey"
                @clickFromChildComponent="UpdatePref"
              />
              <br />
              <div>Default: environment.inside.pressure</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.outsidePressureKey') }}
            </td>
            <td>
              <MySelect
                v-if="pressure_keys.length >= 1"
                :data="settings.preferences.monitoring.outsidePressureKey"
                :object="pressure_keys"
                :sk_key="settings.preferences.monitoring"
                map="outsidePressureKey"
                @clickFromChildComponent="UpdatePref"
              />
              <br />
              <div>Default: environment.outside.pressure</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.insideTemperatureKey') }}
            </td>
            <td>
              <MySelect
                v-if="temperatures_keys.length >= 1"
                :data="settings.preferences.monitoring.insideTemperatureKey"
                :object="temperatures_keys"
                :sk_key="settings.preferences.monitoring"
                map="insideTemperatureKey"
                @clickFromChildComponent="UpdatePref"
              /><br />
              <div>Default: environment.inside.temperature</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.outsideTemperatureKey') }}
            </td>
            <td>
              <MySelect
                v-if="temperatures_keys.length >= 1"
                :data="settings.preferences.monitoring.outsideTemperatureKey"
                :object="temperatures_keys"
                :sk_key="settings.preferences.monitoring"
                map="outsideTemperatureKey"
                @clickFromChildComponent="UpdatePref"
              /><br />
              <div>Default: environment.outside.temperature</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.insideHumidityKey') }}
            </td>
            <td>
              <MySelect
                v-if="humidity_keys.length >= 1"
                :data="settings.preferences.monitoring.insideHumidityKey"
                :object="humidity_keys"
                :sk_key="settings.preferences.monitoring"
                map="insideHumidityKey"
                @clickFromChildComponent="UpdatePref"
              /><br />
              <div>Default: environment.inside.relativeHumidity</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.outsideHumidityKey') }}
            </td>
            <td>
              <MySelect
                v-if="humidity_keys.length >= 1"
                :data="settings.preferences.monitoring.outsideHumidityKey"
                :object="humidity_keys"
                :sk_key="settings.preferences.monitoring"
                map="outsideHumidityKey"
                @clickFromChildComponent="UpdatePref"
              /><br />
              <div>Default: environment.outside.relativeHumidity</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.stateOfChargeKey') }}
            </td>
            <td>
              <MySelect
                v-if="stateOfCharge_keys.length >= 1"
                :data="settings.preferences.monitoring.stateOfChargeKey"
                :object="stateOfCharge_keys"
                :sk_key="settings.preferences.monitoring"
                map="stateOfChargeKey"
                @clickFromChildComponent="UpdatePref"
              /><br />
              <div>Default: electrical.batteries.House.capacity.stateOfCharge</div>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('profile.monitoring.voltageKey') }}
            </td>
            <td>
              <MySelect
                v-if="batteryVoltage_keys.length >= 1"
                :data="settings.preferences.monitoring.voltageKey"
                :object="batteryVoltage_keys"
                :sk_key="settings.preferences.monitoring"
                map="voltageKey"
                @clickFromChildComponent="UpdatePref"
              /><br />
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
  const UpdatePref = async (key, value, map) => {
    console.log(key, value, map)
    if (!key || typeof value == 'undefined') return
    if (key === 'monitoring' && typeof value === 'object') {
      console.debug(`Updating ${key}:`, JSON.stringify(value))
    }
    console.debug('Correlation Tab UpdatePref', `Updating ${map}: ${value}`)
    let obj = {}
    obj[map] = value
    console.debug(JSON.stringify({ ...key, ...obj }))
    GlobalStore.settings.preferences.monitoring = { ...key, ...obj }
    // Update GlobalStore should be automatic maybe need to use reactive()
    // API Call api.update_user_preferences({ key: ${key}, value: ${value} }) from the store
    //const response = await updatePref('monitoring', `{"${key}": "${value}"}`)
    const response = await updatePref('monitoring', JSON.stringify({ ...key, ...obj }))
    // Notify user on success or failure using va-toast.
    initToast({
      message: `${response ? 'Successfully updated' : 'Error updating'} ${map} with ${value}`,
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
