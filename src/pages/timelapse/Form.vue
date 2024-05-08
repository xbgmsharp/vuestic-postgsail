<template>
  <div>
    <va-card class="mb-3">
      <va-card-title>{{ $t('timelapse.customize') }}</va-card-title>
      <va-card-content>
        <div>
          <div>
            <va-form ref="formData" @submit.prevent="onsubmit">
              <table striped hoverable style="min-width: 90%">
                <tr>
                  <td class="width-30 font-weight-bold">{{ $t('timelapse.choosetrips') }}</td>
                  <td>
                    <div>
                      <va-switch v-model="choose_trips" size="small" />
                    </div>
                  </td>
                </tr>
                <template v-if="choose_trips">
                  <tr>
                    <td>{{ $t('timelapse.start') }}</td>
                    <td>
                      <MySelect
                        v-if="mylogs"
                        :id="parseInt(start_trip)"
                        key="start_trip"
                        :data="formData.start_log"
                        :object="mylogs"
                        @clickFromChildComponent="handleStart"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>{{ $t('timelapse.end') }}</td>
                    <td>
                      <MySelect
                        v-if="mylogs"
                        :id="parseInt(end_trip)"
                        key="end_trip"
                        :data="formData.end_log"
                        :object="mylogs"
                        @clickFromChildComponent="handleEnd"
                      />
                    </td>
                  </tr>
                </template>
                <tr>
                  <td>{{ $t('timelapse.basemap') }}</td>
                  <td>
                    <MySelect
                      v-if="mapTypes"
                      :id="mapIdx"
                      key="mapTypes"
                      :data="mapIdx"
                      :object="mapTypes"
                      @clickFromChildComponent="handleMap"
                    />
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('timelapse.boattype') }}</td>
                  <td>
                    <MySelect
                      v-if="boatTypes"
                      :id="boatIdx"
                      key="boatTypes"
                      :data="boatIdx"
                      :object="boatTypes"
                      @clickFromChildComponent="handleBoatType"
                    />
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('timelapse.trackcolor') }}</td>
                  <td>
                    <MySelect
                      v-if="colors"
                      key="colors"
                      :data="color"
                      :object="colors"
                      @clickFromChildComponent="handleColor"
                    />
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('timelapse.overlay') }}</td>
                  <td>
                    <va-switch v-model="overlay" size="small" @click="handleOverlay" />
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('timelapse.instruments') }}</td>
                  <td>
                    <va-switch v-model="instruments" size="small" @click="handleInstruments" />
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('timelapse.zoom') }}</td>
                  <td>
                    <MySelect
                      v-if="formData"
                      :id="formData.zoom"
                      key="zoom"
                      :data="formData.zoom"
                      :object="zooms"
                      @clickFromChildComponent="handleZoom"
                    />
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('timelapse.anim') }}</td>
                  <td>
                    <MySelect
                      v-if="formData"
                      :id="formData.speed"
                      key="speeds"
                      :data="formData.speed"
                      :object="speeds"
                      @clickFromChildComponent="handleSpeed"
                    />
                  </td>
                </tr>
                <tr>
                  <td>{{ $t('timelapse.delay') }}</td>
                  <td>
                    <MySelect
                      :id="formData.delay"
                      key="delay"
                      :data="formData.delay"
                      :object="delays"
                      @clickFromChildComponent="handleDelay"
                    />
                  </td>
                </tr>
                <!--
                <tr>
                  <td>Granularity</td>
                  <td>
                    <select name="min_distance" class="form-control">
                      <option value="0">Extremely Granular</option>
                      <option value="0.3">Very Granular</option>
                      <option value="0.6">Granular</option>
                      <option value="1" selected>Normal</option>
                      <option value="3">Coarse</option>
                      <option value="6">Very Coarse</option>
                      <option value="15">Extremely Coarse</option>
                    </select>
                  </td>
                </tr>
                -->
              </table>
              <dl class="row mb-3">
                <dt class="flex xs12 md6">{{ $t('logs.log.export') }}</dt>
                <dd class="export-buttons">
                  <va-icon name="gpx" :size="44" style="display: inline-block" @click="handleGPX(formData)" />
                  <va-icon name="geojson" :size="44" style="display: inline-block" @click="handleGeoJSON(formData)" />
                  <va-icon name="kml" :size="44" style="display: inline-block" @click="handleKML(formData)" />
                </dd>
              </dl>
              <dl class="row mb-3">
                <dt class="flex xs12 md6">{{ $t('logs.log.share') }}</dt>
                <dd class="export-buttons">
                  <va-popover class="mr-2 mb-2" icon="info" message="shareable timelapse link">
                    <va-icon name="link" :size="44" style="display: inline-block" @click="handleLink(formData)" />
                  </va-popover>
                  <a
                    :href="`https://www.facebook.com/sharer/sharer.php?u=${timelapse_public_link}&t=${vesselName}'s Replay`"
                    target="_blank"
                    ><va-icon name="facebook" :size="44"
                  /></a>
                  <template v-if="instagram">
                    <a :href="`https://www.instagram.com/${instagram}/`" target="_blank">
                      <va-icon name="instagram" :size="44"
                    /></a>
                  </template>
                  <a
                    :href="`https://twitter.com/intent/tweet?text=${vesselName}'s Replay&url=${timelapse_public_link}`"
                    target="_blank"
                  >
                    <va-icon name="x-twitter" :size="44"
                  /></a>
                  <a :href="`mailto:?subject=${vesselName}'s Replay&body=${timelapse_public_link}`" target="_blank"
                    ><va-icon name="envelope" :size="44"
                  /></a>
                  <template v-if="website">
                    <a :href="website" target="_blank"><va-icon name="envelope" :size="44" /></a>
                  </template>
                </dd>
              </dl>
              <dl class="row mb-3">
                <dt></dt>
                <dl style="min-width: 100%">
                  <div style="min-width: 100%">
                    <va-button style="min-width: 100%" :to="timelapse_link">Replay ▶</va-button>
                  </div>
                </dl>
              </dl>
            </va-form>
          </div>
        </div>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, reactive, ref, onMounted } from 'vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { baseMaps, boatMarkerTypes } from '../../components/maps/leafletHelpers.js'
  import MySelect from '../../components/vaSelect.vue'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import { useGlobalStore } from '../../stores/global-store'
  const { publicVessel, instagram, website } = useGlobalStore()
  import { useVesselStore } from '../../stores/vessel-store'
  const { vesselName, vesselType } = useVesselStore()
  import { useToast } from 'vuestic-ui'
  const { init: initToast } = useToast()

  const isBusy = ref(false)
  const apiError = ref(null)
  const CacheStore = useCacheStore()
  const { logs } = storeToRefs(CacheStore)
  const choose_trips = ref(false)
  const overlay = ref(true)
  const instruments = ref(true)
  const color = ref(0)
  const start_trip = ref(-1)
  const end_trip = ref(-1)
  const mylogs = ref([])
  const defaultBoatType =
    vesselType === 'Sailing' ? 'SailboatSails' : vesselType === 'Pleasure Craft' ? 'Powerboat' : 'Dot'
  const formData = reactive({
    start_log: '',
    end_log: '',
    map_type: 'Satellite',
    boat_type: defaultBoatType,
    speed: 250,
    delay: 0,
    zoom: 13,
    color: 'dodgerblue',
    moorage_overlay: overlay.value,
    instruments: instruments.value,
  })
  const timelapse_link = computed(() => {
    console.log('formData', formData)
    const searchParams = new URLSearchParams(formData)
    return `/timelapse?${searchParams.toString()}`
  })
  const timelapse_public_link = computed(() => {
    console.log('public formData', formData)
    const searchParams = new URLSearchParams(formData)
    return `${window.location.protocol}//${window.location.host}/${publicVessel}/timelapse?${searchParams.toString()}`
  })

  // get list from list of all maps
  const mapIdx = 0 // Satellite
  const mapTypes = Object.keys(baseMaps()).map((key, index) => ({
    value: index,
    text: key,
  }))

  // get list from list of all maps
  const boatIdx = 1 // SailboatSails
  const boatTypes = Object.keys(boatMarkerTypes()).map((key, index) => ({
    value: index,
    text: key,
  }))

  const speeds = [
    {
      value: 350,
      text: 'Snail Speed',
    },
    {
      value: 325,
      text: 'Very Slow',
    },
    {
      value: 300,
      text: 'Slow',
    },
    {
      value: 250,
      text: 'Normal',
    },
    {
      value: 150,
      text: 'Fast',
    },
    {
      value: 50,
      text: 'Very Fast',
    },
    {
      value: 10,
      text: 'Light Speed',
    },
  ]
  const zooms = [
    {
      value: 5,
      text: '5',
    },
    {
      value: 6,
      text: '6',
    },
    {
      value: 7,
      text: '7',
    },
    {
      value: 8,
      text: '8',
    },
    {
      value: 9,
      text: '9',
    },
    {
      value: 10,
      text: '10',
    },
    {
      value: 11,
      text: '11',
    },
    {
      value: 12,
      text: '12',
    },
    {
      value: 13,
      text: '13',
    },
  ]
  const delays = [
    {
      value: 0,
      text: 'None',
    },
    {
      value: 5,
      text: '5 seconds',
    },
    {
      value: 10,
      text: '10 seconds',
    },
  ]
  const colors = [
    {
      value: 0,
      text: 'Dodger Blue',
    },
    {
      value: 1,
      text: 'Green',
    },
    {
      value: 2,
      text: 'Yellow',
    },
    {
      value: 3,
      text: 'Red',
    },
    {
      value: 4,
      text: 'Orange',
    },
    {
      value: 5,
      text: 'Black',
    },
    {
      value: 6,
      text: 'Gray',
    },
    {
      value: 7,
      text: 'White',
    },
  ]

  onMounted(async () => {
    console.log('Timelapse Form onMounted')
    let formatDate = null
    mylogs.value.push({ value: 0, text: '' })
    for (let i = 0; i < logs.value.length; i++) {
      //console.log(logs.value[i])
      formatDate = dateFormatUTC(logs.value[i].started)
      mylogs.value.push({ value: logs.value[i].id, text: `${formatDate}: ${logs.value[i].name}` })
    }
    console.log('logs', mylogs.value)
  })

  const handleStart = async (new_value, obj) => {
    console.log('handleStart new_start', new_value, obj)
    if (new_value >= 0) {
      console.log('handleStart obj:', obj.value + ', text:' + obj.text)
      formData.start_log = obj.value
    }
  }
  const handleEnd = async (new_value, obj) => {
    console.log('handleEnd new_end', new_value, obj)
    if (new_value >= 0) {
      console.log('handleEnd obj:', obj.value + ', text:' + obj.text)
      formData.end_log = obj.value
    }
  }
  const handleMap = async (new_value, obj) => {
    console.log('handleMap', new_value, obj)
    if (new_value >= 0) {
      console.log('handleMap obj:', obj.value + ', text:' + obj.text)
      formData.map_type = obj.text
    }
  }
  const handleBoatType = async (new_value, obj) => {
    console.log('handleBoatType', new_value, obj)
    if (new_value >= 0) {
      console.log('handleBoatType obj:', obj.value + ', text:' + obj.text)
      formData.boat_type = obj.text
    }
  }
  const handleSpeed = async (new_value, obj) => {
    console.log('handleSpeed', new_value, obj)
    if (new_value >= 0) {
      console.log('handleSpeed obj:', obj.value + ', text:' + obj.text)
      formData.speed = obj.value
    }
  }
  const handleColor = async (new_value, obj) => {
    console.log('handleColor', new_value, obj)
    if (new_value >= 0) {
      console.log('handleColor obj:', obj.value + ', text:' + obj.text)
      formData.color = obj.text.toLowerCase().trim().replace(/\s+/gm, '')
    }
  }
  const handleZoom = async (new_value, obj) => {
    console.log('handleZoom', new_value, obj)
    if (new_value >= 0) {
      console.log('handleZoom obj:', obj.value + ', text:' + obj.text)
      formData.zoom = obj.value
    }
  }
  const handleDelay = async (new_value, obj) => {
    console.log('handleDelay', new_value, obj)
    if (new_value >= 0) {
      console.log('handleDelay obj:', obj.value + ', text:' + obj.text)
      formData.delay = obj.value
    }
  }
  const handleOverlay = async () => {
    console.log('handleOverlay', overlay.value)
    formData.moorage_overlay = overlay.value
  }
  const handleInstruments = async () => {
    console.log('handleInstruments', instruments.value)
    formData.instruments = instruments.value
  }
  const onsubmit = () => {
    console.log('onsubmit', formData)
  }
  const handleLink = () => {
    initToast({
      message: `public shareable url copied to clipboard`,
      position: 'top-right',
      color: 'primary',
      //color: response.ok ? 'success' : 'warning',
    })
    navigator.clipboard.writeText(timelapse_public_link.value)
    //window.open(timelapse_public_link.value)
  }
  // handle Exports
  const runBusy = (fn, ...args) => asBusy(isBusy, apiError, fn, ...args),
    handleGPX = (id) => handleExport_common('gpx', id),
    handleKML = (id) => handleExport_common('kml', id),
    handleGeoJSON = (id) => handleExport_common('geojson', id),
    handleExport_common = (format, id) => {
      //console.log(formData)
      const payload = { start_log: null, end_log: null }
      if (formData.start_log != '') {
        payload.start_log = formData.start_log
      }
      if (formData.end_log != '') {
        payload.end_log = formData.end_log
      }
      runBusy(handleExport, format, 'logs', payload, `trip_${formData.start_log}_${formData.end_log}`)
    }
</script>

<style lang="scss" scoped>
  .dl-details {
    > dt:nth-child(4n + 3) {
      &,
      & + dd {
        background-color: var(--va-background);
      }
    }
    > .export-buttons {
      > .va-icon {
        display: inline-block;
      }
    }
  }
  .link {
    color: blue;
  }
  .link:hover {
    text-decoration: underline blue;
  }
  .divider {
    margin-top: 2em;
    margin-bottom: 1em;
  }
  .slider-template {
    width: 20px !important;
  }
</style>
