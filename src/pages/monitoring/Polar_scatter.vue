<template>
  <template v-if="apiError">
    <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
  </template>
  <template v-if="offline">
    <Offline />
  </template>
  <va-card class="chart-widget col-span-12">
    <va-card-title>{{ title }}</va-card-title>
    <va-card-content>
      <va-chart v-if="polarChartData" :data="polarChartData" :options="polarChartOptions" type="scatter" />
    </va-card-content>
  </va-card>
</template>

<script setup>
  // Based on signalk-polar-performance-plugin
  // https://github.com/htool/signalk-polar-performance-plugin/blob/main/public/index.html
  import { ref, computed, onMounted, reactive } from 'vue'
  import { useI18n } from 'vue-i18n'
  import VaChart from '../../components/va-charts/VaChart.vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import Offline from '../../components/MonitoringOffline.vue'

  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(true)
  const apiData = reactive([])
  const offline = ref(false)
  const polarChartData = {
    datasets: [
      {
        label: 'Polar Speed',
        backgroundColor: 'rgba(0,255,0,0.7)',
        borderColor: 'rgba(0,255,0,0.2)',
        borderWidth: 1,
        radius: 30,
        type: 'bubble',
        yAxisID: 'y',
        data: [
          {
            y: 0,
            x: 0,
            r: 10,
          },
          {
            y: 1,
            x: 1,
            r: 10,
          },
          {
            y: 1.5,
            x: 1.5,
            r: 10,
          },
        ],
      },
      {
        label: 'Boat Speed',
        backgroundColor: 'rgba(0,150,255,0.7)',
        borderColor: 'rgba(0,150,255,0.2)',
        borderWidth: 1,
        radius: 30,
        type: 'bubble',
        yAxisID: 'y2',
        data: [
          {
            y: 0,
            x: 0,
            r: 10,
          },
          {
            y: 2,
            x: 2,
            r: 10,
          },
          {
            y: 3,
            x: 3,
            r: 10,
          },
        ],
      },
    ],
  }

  const polarChartOptions = {
    options: {
      legend: {
        display: true,
      },
      spanGaps: true,
      scales: {
        y: [
          {
            title: 'True wind angle (TWA)',
            type: 'linear',
            display: true,
            ticks: {
              //color: 'white',
              font: {
                size: 14,
              },
            },
          },
        ],
        y2: [
          {
            title: 'Target boat speed (POL SPD)',
            type: 'linear',
            position: 'right',
            reverse: true,
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Target boat speed (POL SPD)',
              //fontColor: 'white',
              fontSize: 14,
            },
            ticks: {
              display: true,
              //fontColor: 'white',
              fontSize: 14,
            },
            gridLines: {
              color: 'rgba(180,180,180,0.7)',
              lineWidth: 1,
            },
          },
        ],
      },
      tooltips: {
        enabled: true,
        callbacks: {
          label: function (tooltipItems, data) {
            console.log('tooltipItems: ' + JSON.stringify(tooltipItems))
            console.log('data: ' + data)
            let label = tooltipItems.xLabel + '° ' + tooltipItems.yLabel + ' kts'
            return label
          },
        },
        //backgroundColor: '#666',
        titleFontSize: 18,
        //titleFontColor: '#0066ff',
        //bodyFontColor: '#ddd',
        bodyFontSize: 18,
        //displayColors: false,
      },
    },
  }

  const polarChartDataComputed = computed(() => {
    return {}
  })

  onMounted(async () => {
    console.log('Polar Chartjs Scatter')
  })
</script>

<style lang="scss">
  .chart-widget {
    .va-card__content {
      height: 450px;
    }
  }
</style>
