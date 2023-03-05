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
  const { data, getInfoTiles } = storeToRefs(CacheStore)
  const { logs, stays, moorages, InfoTiles, barChart, lineChartbyYear } = CacheStore

  console.log(import.meta.env)
  console.log(import.meta.env.VITE_GIT_VERSION)
  console.log(__APP_VERSION__)
  let ver = ref('')
  ver.value = __APP_VERSION__ + '-' + import.meta.env.VITE_GIT_VERSION
  if (import.meta.env.DEV) {
    ver.value += '-' + 'dev'
  } else {
    ver.value += '-' + 'prod'
  }
  console.log('app_version:', ver.value)
  //set_web_version(ver.value)
  console.log(userName.value)

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
    const mylogs = await logs()
    console.log(mylogs)
    const mystays = await stays()
    console.log(mystays)
    const mymoorages = await moorages()
    console.log(mymoorages)
    // Load Charts Dashboard
    InfoTiles()
    barChart()
    lineChartbyYear()
    console.log(getInfoTiles.value)
    infoTiles.value[0].value = data.value.tiles[0]
    infoTiles.value[1].value = data.value.tiles[1]
    infoTiles.value[2].value = data.value.tiles[2]
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
