<script setup>
  import { computed } from 'vue'
  import speedChart from '../../../components/echarts/linetimeseries.vue'
  import windChart from '../../../components/echarts/windbarbseries.vue'
  import polarChart from '../../../components/echarts/polarline.vue'

  const props = defineProps({
    speeddata: {
      type: Array,
      required: true,
    },
    winddata: {
      type: Array,
      required: true,
    },
    twddata: {
      type: Array,
      required: true,
    },
    polardata: {
      type: String,
      defaut: null,
      required: false,
    },
    labels: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  })

  const speedComputed = computed(() => {
    let speed_arr = []
    if (Array.isArray(props.speeddata) && props.speeddata.length > 0) {
      props.speeddata.forEach((currentElement, index, array) => {
        if (props.speeddata[index] != null && props.winddata[index] != null) {
          //console.log(props.labels[index], props.twddata[index], props.winddata[index])
          speed_arr.push([props.labels[index], props.speeddata[index], props.winddata[index]])
        }
      })
    }
    //console.log(speed_arr)
    return speed_arr
  })
  const twdComputed = computed(() => {
    let wind_arr = []
    if (Array.isArray(props.twddata) && props.twddata.length > 0) {
      props.twddata.forEach((currentElement, index, array) => {
        if (props.twddata[index] != null && props.winddata[index] != null) {
          //console.log(props.labels[index], props.twddata[index], props.winddata[index])
          wind_arr.push([props.labels[index], props.twddata[index], props.winddata[index]])
        }
      })
    }
    //console.log(wind_arr)
    return wind_arr
  })

  const polarComputed = computed(() => {
    //console.log('polarComputed', props.polardata)
    return props.polardata || null
  })
</script>

<template>
  <div>
    <template v-if="speeddata && winddata && speedComputed">
      <va-card v-if="winddata && speeddata">
        <va-card-title>Wind Speed / Boat Speed</va-card-title>
        <va-card-content>
          <speedChart :series="speedComputed" />
        </va-card-content>
      </va-card>
    </template>
    <template v-else>
      <div class="p-4 text-center text-gray-500">No Wind Speed / Boat Speed data available.</div>
    </template>
  </div>
  <div>
    <template v-if="winddata && twddata && twdComputed">
      <va-card v-if="winddata && twddata">
        <va-card-title>Wind Speed / Direction</va-card-title>
        <va-card-content>
          <windChart :series="twdComputed" />
        </va-card-content>
      </va-card>
    </template>
    <template v-else>
      <div class="p-4 text-center text-gray-500">No Wind Speed / Direction data available.</div>
    </template>
  </div>
  <div>
    <template v-if="polardata && polarComputed">
      <va-card v-if="polardata">
        <va-card-title>Polar</va-card-title>
        <va-card-content>
          <polarChart :polarcsv="polarComputed" />
        </va-card-content>
      </va-card>
    </template>
    <template v-else>
      <div class="p-4 text-center text-gray-500">No polar data available.</div>
    </template>
  </div>
</template>

<style></style>
