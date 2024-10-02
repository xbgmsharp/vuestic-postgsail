<script setup>
  import { computed } from 'vue'
  import VaChart from '../../../components/echarts/linetimeseries.vue'

  const props = defineProps({
    speeddata: {
      type: Array,
      required: true,
    },
    winddata: {
      type: Array,
      required: true,
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

  const eChartComputed = computed(() => {
    let speed_arr = []
    if (Array.isArray(props.speeddata) && props.speeddata.length > 0) {
      props.speeddata.forEach((currentElement, index, array) => {
        if (props.speeddata[index] != null && props.winddata[index] != null) {
          speed_arr.push([props.labels[index], props.speeddata[index], props.winddata[index]])
        }
      })
    }
    //console.log(speed_arr)
    return speed_arr
  })
</script>

<template>
  <div class="p-2">
    <template v-if="winddata && eChartComputed">
      <va-card v-if="winddata">
        <va-card-title>Wind Speed</va-card-title>
        <va-card-content>
          <VaChart :series="eChartComputed" />
        </va-card-content>
      </va-card>
    </template>
  </div>
  <div class="p-2">
    <template v-if="speeddata">
      <va-card v-if="speeddata">
        <va-card-title>Boat Speed</va-card-title>
        <va-card-content>
          <VaChart :series="eChartComputed" />
        </va-card-content>
      </va-card>
    </template>
  </div>
</template>

<style></style>
