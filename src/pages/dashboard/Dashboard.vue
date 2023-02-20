<template>
  <div class="row">
    <div v-for="(info, idx) in infoTiles" :key="idx" class="flex xs12 sm4">
      <va-card class="mb-4" :color="info.color">
        <va-card-content>
          <va-icon :name="info.icon" />
          <h2 class="va-h2 ma-0" style="color: white">{{ info.value }}</h2>
          <p style="color: white">{{ t('menu.' + info.text) }}</p>
        </va-card-content>
      </va-card>
    </div>
  </div>

  <charts :pgdata="data.stats" />

  <div class="row">
    <div class="flex md12 xs12">
      <va-card>
        <va-card-title>{{ t('dashboard.title') }}</va-card-title>
        <va-card-content>
          FrontEnd version: {{ versions.web_version }}, VueJS: {{ version }}<br />
          Backend version: {{ versions.api_version }}, {{ versions.sys_version }}<br />
        </va-card-content>
      </va-card>
    </div>
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
  const { data, getInfoTiles, logs_by_month } = storeToRefs(CacheStore)
  const { logs, stays, moorages, InfoTiles, barChart } = CacheStore

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
    fetchVersions(ver.value)
    await fetchSettings()
    console.log(GlobalStore.settings)
    const mylogs = await logs()
    console.log(mylogs)
    const mystays = await stays()
    console.log(mystays)
    const mymoorages = await moorages()
    console.log(mymoorages)
    InfoTiles()
    barChart()
    console.log(data.value)
    console.log(getInfoTiles.value)
    console.log(logs_by_month.value)
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

<style lang="scss"></style>
