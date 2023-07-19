<template>
  <template v-if="Object.keys(stats_logs).length == 0 && Object.keys(stats_moorages).length == 0">
    <nodatayet />
  </template>
  <template v-else>
    <div class="grid grid-cols-12 items-start gap-6">
      <va-card class="col-span-12 lg:col-span-6 p-4">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content>
          <table class="va-table va-table--hoverable va-table--striped">
            <tbody>
              <tr v-for="(value, index) in Object.entries(stats_logs)" :key="index">
                <td>
                  <b>{{ value[0] }}</b>
                </td>
                <td>{{ value[1] }}</td>
              </tr>
            </tbody>
          </table>
        </va-card-content>
      </va-card>

      <va-card class="col-span-12 lg:col-span-6 p-4">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content>
          <table class="va-table va-table--hoverable va-table--striped">
            <tbody>
              <tr v-for="(value, index) in Object.entries(stats_moorages)" :key="index">
                <td>
                  <b>{{ value[0] }}</b>
                </td>
                <td>{{ value[1] }}</td>
              </tr>
              <tr v-for="(value, index) in Object.entries(polarChartStays)" :key="index">
                <td class="sub-setting">
                  <b>{{ value[0] }}</b>
                </td>
                <td>{{ value[1].duration }} {{ value[1].percentage }}%</td>
              </tr>
            </tbody>
          </table>
        </va-card-content>
      </va-card>

      <va-card class="col-span-12 lg:col-span-6 p-4">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content class="h-64">
          <va-chart :data="pieChartDataComputed" type="pie" />
        </va-card-content>
      </va-card>

      <va-card disabled class="col-span-12 lg:col-span-6 p-4">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content class="h-64">
          <va-chart :data="polarChartDataComputed" type="pie" :options="polarChartOptions" />
        </va-card-content>
      </va-card>
    </div>
  </template>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import nodatayet from '../../components/noDataScreen.vue'
  import VaChart from '../../components/va-charts/VaChart.vue'
  import { useGlobalStore } from '../../stores/global-store'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import moment from 'moment/min/moment-with-locales'

  //import stats_logs from '../../data/stats_logs.json'
  //import stats_moorages from '../../data/stats_moorages.json'

  const { t } = useI18n()
  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)
  const CacheStore = useCacheStore()
  const { logs, stays } = storeToRefs(CacheStore)

  const isBusy = ref(false)
  const apiError = ref(null)

  const mybadges = ref(settings.value.preferences.badges || {})
  //console.log(mybadges)
  const stats_logs = ref({})
  const stats_moorages = ref({})

  /* TODO
   * Date formatting
   * Add i18n for all entries
   * Chart.js Label percentage % or value
   * Which graph type?
   */
  const polarChartOptions = {
    responsive: true,
    /*
    scales: {
      r: {
        pointLabels: {
          display: true,
          centerPointLabels: true,
          font: {
            size: 18,
          },
        },
      },
    },*/
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  const polarChartData_default = {
    labels: ['Unclassified', 'Anchor', 'Mooring Buoys', 'Dock'],
    datasets: [
      {
        type: 'pie',
        label: 'Time Spent Away',
        data: [45, 5, 9, 20],
        backgroundColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)'],
        borderWidth: 1,
      },
    ],
  }

  const pieChartData_default = {
    labels: ['Not Underway', 'Underway'],
    datasets: [
      {
        label: 'Time Spent Underway',
        data: [51.5, 48.5],
        backgroundColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)'],
        borderWidth: 1,
      },
    ],
  }

  const polarChartDataComputed = computed(() => {
    if (!Array.isArray(stays.value) || stays.value.length == 0) return polarChartData_default
    const obj = structuredClone(polarChartData_default)
    obj.datasets[0].data = [
      polarChartStays.value.Unclassified.percentage,
      polarChartStays.value.Anchor.percentage,
      polarChartStays.value.Buoy.percentage,
      polarChartStays.value.Dock.percentage,
    ]
    return obj
  })

  const pieChartDataComputed = computed(() => {
    if (!Array.isArray(logs.value) || logs.value.length == 0) return pieChartData_default
    const obj = structuredClone(pieChartData_default)
    obj.datasets[0].data = [100 - pieChartLogs.value.percentage, pieChartLogs.value.percentage]
    return obj
  })

  const pieChartLogs = computed(() => {
    if (!Array.isArray(logs.value) || logs.value.length == 0) return {}
    const obj = {
      total_duration: null,
      total_distance: 0,
      total_count: 0,
      max_duration_id: 0,
      max_distance_id: 0,
      max_duration: null,
      max_distance: 0,
      percentage: 0,
    }
    // Extract Sum Distances,Sum Duration of logs
    logs.value.forEach(({ id, Distance, Duration }) => {
      obj.total_distance += Distance
      //obj.total_duration += moment.duration(Duration)
      obj.total_duration = moment.duration(Duration) + moment.duration(obj.total_duration)
      if (Math.max(Distance, obj.max_distance)) {
        obj.max_distance_id = id
        obj.max_distance = Math.max(Distance, obj.max_distance)
      }
      if (moment.duration(Duration) > moment.duration(obj.max_duration)) {
        obj.max_duration_id = id
        obj.max_duration = moment.duration(Duration)
      }
    })
    //obj.total_duration = moment.duration(obj.total_duration).humanize()
    const start = logs.value[0].Started
    const end = logs.value[logs.value.length - 1].Ended
    obj.percentage = (moment.duration(obj.total_duration) / moment.duration(moment(start) - moment(end))) * 100
    obj.total_count = logs.value.length
    console.log('pieChartLogs obj', obj)
    return obj
  })

  const polarChartStays = computed(() => {
    if (!Array.isArray(stays.value) || stays.value.length == 0) return {}
    let total_duration = 0
    const obj = {
      Unclassified: { duration: 0, percentage: 0 },
      Anchor: { duration: 0, percentage: 0 },
      Buoy: { duration: 0, percentage: 0 },
      Dock: { duration: 0, percentage: 0 },
    }
    // Extract Sum Duration of stays by type
    stays.value.forEach(({ stayed_at_id, duration }) => {
      total_duration += moment.duration(duration)
      switch (stayed_at_id) {
        case 1:
          obj.Unclassified.duration += moment.duration(duration)
          break
        case 2:
          obj.Anchor.duration += moment.duration(duration)
          break
        case 3:
          obj.Buoy.duration += moment.duration(duration)
          break
        case 4:
          obj.Dock.duration += moment.duration(duration)
          break
        default:
          break
      }
    })
    obj.Unclassified.percentage = (moment.duration(obj.Unclassified.duration) / moment.duration(total_duration)) * 100
    obj.Anchor.percentage = (moment.duration(obj.Anchor.duration) / moment.duration(total_duration)) * 100
    obj.Buoy.percentage = (moment.duration(obj.Buoy.duration) / moment.duration(total_duration)) * 100
    obj.Dock.percentage = (moment.duration(obj.Dock.duration) / moment.duration(total_duration)) * 100
    obj.Unclassified.duration = Math.trunc(moment.duration(obj.Unclassified.duration).as('days'))
    obj.Anchor.duration = Math.trunc(moment.duration(obj.Anchor.duration).as('days'))
    obj.Buoy.duration = Math.trunc(moment.duration(obj.Buoy.duration).as('days'))
    obj.Dock.duration = Math.trunc(moment.duration(obj.Dock.duration).as('days'))
    console.log('pieChartStays obj', obj)
    return obj
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      let response = await api.stats_logs_view()
      if (Array.isArray(response) && response[0]) {
        stats_logs.value = response[0]
      }
      response = await api.stats_moorages_view()
      if (Array.isArray(response) && response[0]) {
        stats_moorages.value = response[0]
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        stats_logs.value = 2 //stats_logs[0]
        stats_moorages.value = 1 //stats_moorages[0]
      }
      return
    } finally {
      isBusy.value = false
    }
  })
</script>

<style lang="scss" scoped>
  .va-table-responsive {
    overflow: auto;
  }
  .va-table {
    width: 100%;
  }
  .sub-setting {
    padding-left: 2em;
    font-size: 0.9rem;
    font-weight: 600;
  }
</style>
