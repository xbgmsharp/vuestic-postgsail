<script setup>
  import { computed } from 'vue'
  import VaChart from '../../../components/va-charts/VaChart.vue'

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

  /* Default Chartjs Data */
  const ChartDataDefault = {
    labels: [],
    datasets: [
      {
        label: 'Default',
        data: [],
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  }
  /* Default Chartjs Options */
  const ChartOptionsDefault = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          callback: null,
        },
        title: { display: true, text: 'Time' },
      },
      y: {
        ticks: {
          callback: null,
          display: true,
          stepSize: 1,
        },
        title: { display: true, text: 'Speed in Kt' },
        display: true,
      },
    },
  }

  const windChartOptionsComputed = computed(() => {
    let windChartOptions = structuredClone(ChartOptionsDefault)
    //console.log(windChartOptions)
    return windChartOptions
  })
  const windChartDataComputed = computed(() => {
    //console.log('windChartDataComputed', ChartDataDefault)
    //console.log('winddata', props.winddata)
    let windChartData = structuredClone(ChartDataDefault)
    if (Array.isArray(props.winddata) && props.winddata.length > 0) {
      windChartData.datasets[0].label = 'Wind Speed'
      windChartData.datasets[0].data = props.winddata
      windChartData.labels = props.labels
    }
    //console.log(windChartData)
    return windChartData
  })

  const speedChartOptionsComputed = computed(() => {
    let speedChartOptions = structuredClone(ChartOptionsDefault)
    //console.log(speedChartOptions)
    return speedChartOptions
  })
  const speedChartDataComputed = computed(() => {
    //console.log('speedChartDataComputed', ChartDataDefault)
    //console.log('speeddata', props.speeddata)
    let speedChartData = structuredClone(ChartDataDefault)
    if (Array.isArray(props.speeddata) && props.speeddata.length > 0) {
      speedChartData.datasets[0].label = 'Boat Speed'
      speedChartData.datasets[0].data = props.speeddata
      speedChartData.labels = props.labels
    }
    //console.log(speedChartData)
    return speedChartData
  })
</script>

<template>
  <div class="p-2">
    <template v-if="winddata">
      <va-card v-if="winddata">
        <va-card-title>Wind Speed</va-card-title>
        <va-card-content>
          <VaChart :data="windChartDataComputed" type="line" :options="windChartOptionsComputed" />
        </va-card-content>
      </va-card>
    </template>
  </div>
  <div class="p-2">
    <template v-if="speeddata">
      <va-card v-if="speeddata">
        <va-card-title>Boat Speed</va-card-title>
        <va-card-content>
          <VaChart :data="speedChartDataComputed" type="line" :options="speedChartOptionsComputed" />
        </va-card-content>
      </va-card>
    </template>
  </div>
</template>

<style></style>
