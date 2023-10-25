<template>
  <div>
    <va-card class="mb-3">
      <va-card-title>Export Tracks</va-card-title>
      <va-card-content>
        <div>
          <div>
            <va-form ref="formData">
              <table striped hoverable style="min-width: 90%">
                <!--
                <tr>
                  <td class="width-30 font-weight-bold">Choose Trips</td>
                  <td>
                    <div>
                      <va-switch v-model="trips" size="small" />
                    </div>
                  </td>
                </tr>
                -->
                <tr>
                  <td>Start Trip</td>
                  <td>
                    <MySelect
                      v-if="start_trip"
                      :id="parseInt(start_trip)"
                      key="start_trip"
                      :data="formData.start_log"
                      :object="mylogs"
                      @clickFromChildComponent="handleStart"
                    />
                  </td>
                </tr>
                <tr>
                  <td>End Trip</td>
                  <td>
                    <MySelect
                      v-if="end_trip"
                      :id="parseInt(end_trip)"
                      key="end_trip"
                      :data="formData.end_log"
                      :object="mylogs"
                      @clickFromChildComponent="handleEnd"
                    />
                  </td>
                </tr>

                <tr>
                  <td>Base Map</td>
                  <td>
                    <MySelect
                      v-if="map_type"
                      :id="formData.map_type"
                      key="map_type"
                      :data="formData.map_type"
                      :object="map_type"
                      @clickFromChildComponent="handleMap"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Track Color</td>
                  <td>
                    <MySelect
                      v-if="colors"
                      :id="formData.color"
                      key="colors"
                      :data="formData.color"
                      :object="colors"
                      @clickFromChildComponent="handleColor"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Zoom Level</td>
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
                  <td>Animation Speed</td>
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
                  <td>Initial Delay</td>
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
  import { useRoute } from 'vue-router'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import MySelect from '../../components/vaSelect.vue'
  import { asBusy, handleExport } from '../../utils/handleExports'

  const isBusy = ref(false)
  const apiError = ref(null)
  const CacheStore = useCacheStore()
  const { logs } = storeToRefs(CacheStore)
  const trips = ref(false)
  const start_trip = ref(-1)
  const end_trip = ref(-1)
  const mylogs = ref([])
  const formData = reactive({
    start_log: '',
    end_log: '',
    map_type: 1,
    speed: 250,
    delay: 0,
    zoom: 13,
    color: 'dodgerblue',
  })
  const timelapse_link = computed(() => {
    console.log('formData', formData)
    const searchParams = new URLSearchParams(formData)
    return `/timelapse?${searchParams.toString()}`
  })
  const map_type = [
    {
      value: 0,
      text: 'OpenStreetMap',
    },
    {
      value: 1,
      text: 'Satellite',
    },
  ]
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
      value: 'dodgerblue',
      text: 'Dodger Blue',
    },
    {
      value: 'green',
      text: 'Green',
    },
    {
      value: 'yellow',
      text: 'Yellow',
    },
    {
      value: 'red',
      text: 'Red',
    },
    {
      value: 'orange',
      text: 'Orange',
    },
    {
      value: 'black',
      text: 'Black',
    },
    {
      value: 'gray',
      text: 'Gray',
    },
    {
      value: 'white',
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
    console.log(mylogs.value)
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
      formData.map_type = obj.value
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
    if (new_value) {
      console.log('handleColor obj:', obj.value + ', text:' + obj.text)
      formData.color = obj.value
    }
  }
  const handleZoom = async (new_value, obj) => {
    console.log('handleZoom', new_value, obj)
    if (new_value >= 0) {
      console.log('handleZoom obj:', obj.value + ', text:' + obj.text)
      formData.speed = obj.value
    }
  }
  const handleDelay = async (new_value, obj) => {
    console.log('handleDelay', new_value, obj)
    if (new_value >= 0) {
      console.log('handleDelay obj:', obj.value + ', text:' + obj.text)
      formData.color = obj.value
    }
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
