<template>
  <div class="dashboard grid grid-cols-12 items-start gap-6">
    <va-card v-for="(info, idx) in infoTiles" :key="idx" :color="info.color" class="col-span-12 md:col-span-4">
      <va-card-content>
        <h2 class="va-h2 m-0 text-white">{{ info.value }}</h2>
        <p class="text-white">{{ t('menu.' + info.text) }}</p>
      </va-card-content>
    </va-card>

    <charts class="col-span-12" />

    <va-card class="col-span-12">
      <va-card-title>{{ t('dashboard.versions') }}</va-card-title>
      <va-card-content>
        FrontEnd version: {{ versions.web_version }}, VueJS: {{ version }}<br />
        Backend version: {{ versions.api_version }}, {{ versions.sys_version }}<br />
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, version } from 'vue'
  import { useGlobalStore } from '../../stores/global-store'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import { useI18n } from 'vue-i18n'
  import Charts from './Charts.vue'

  const { t } = useI18n()

  const GlobalStore = useGlobalStore()
  const { userName, versions, postgsail } = storeToRefs(GlobalStore)
  const { fetchVersions, fetchSettings } = GlobalStore

  const CacheStore = useCacheStore()
  const { getInfoTiles } = storeToRefs(CacheStore)
  const { getAPI, InfoTiles, barChart, lineChartbyYear } = CacheStore

  /* Commented out because... Vite build transform step fails..?
  console.log(
    'Dashboard import.meta.env.VITE_GIT_VERSION',
    import.meta.env.VITE_GIT_VERSION,
    __APP_VERSION__,
    import.meta.env,
  )*/
  let ver = ref('')
  ver.value = __APP_VERSION__ + '-' + import.meta.env.VITE_GIT_VERSION
  if (import.meta.env.DEV) {
    ver.value += '-' + 'dev'
  } else {
    ver.value += '-' + 'prod'
  }
  console.log('app_version:', ver.value, userName.value)
  //set_web_version(ver.value)

  const infoTiles = ref([
    {
      color: 'info',
      value: '0',
      text: 'logs',
      icon: 'menu-logs',
    },
    {
      color: 'info',
      value: '0',
      text: 'stays',
      icon: 'menu-stays',
    },
    {
      color: 'info',
      value: '0',
      text: 'moorages',
      icon: 'menu-moorages',
    },
  ])

  /*
  fetchVersions(ver.value)
  fetchinfoTiles()
  infoTiles.value[0].value = GlobalStore.postgsail.infoTiles.logs
  infoTiles.value[1].value = GlobalStore.postgsail.infoTiles.stays
  infoTiles.value[2].value = GlobalStore.postgsail.infoTiles.moorages
  fetchCharts()
  */

  onMounted(async () => {
    // Load version
    fetchVersions(ver.value)
    // Load cache
    const mylogs = await getAPI('logs')
    const mystays = await getAPI('stays')
    const mymoorages = await getAPI('moorages')
    console.log('Dashboard onMounted my(logs|stays|moorages)', mylogs, mystays, mymoorages)
    // Load Charts Dashboard
    InfoTiles()
    barChart()
    lineChartbyYear()
    console.log('Dashboard onMounted getInfoTiles.value', getInfoTiles.value)
    for (let tile in CacheStore.tiles) {
      infoTiles.value[tile as unknown as number].value = CacheStore.tiles[tile as unknown as number]
    }
  })

  onMounted(() => {
    //fetchVersions(ver.value)
    //TODO
    //fetchLogs()
    //fetchStays()
    //fetchMoorages()
    // Count array length of each instead of an api call.
    //fetchinfoTiles()
    //infoTiles.value[0].value = GlobalStore.postgsail.infoTiles.logs
    //infoTiles.value[1].value = GlobalStore.postgsail.infoTiles.stays
    //infoTiles.value[2].value = GlobalStore.postgsail.infoTiles.moorages
    //fetchCharts()
  })
</script>

<style lang="scss">
  .dashboard {
    .va-card {
      margin-bottom: 0 !important;
      &__title {
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>
