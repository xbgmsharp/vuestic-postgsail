<template>
  <div class="dashboard grid grid-cols-12 items-start gap-6">
    <va-card v-for="(info, idx) in infoTiles" :key="idx" :color="info.color" class="col-span-12 md:col-span-4">
      <router-link :to="info.text">
        <va-card-content>
          <h2 class="va-h2 m-0 text-white">{{ info.value }}</h2>
          <p class="text-white">{{ t('menu.' + info.text) }}</p>
        </va-card-content>
      </router-link>
    </va-card>

    <charts class="col-span-12" />

    <va-card class="col-span-12">
      <va-card-title>{{ t('dashboard.versions') }}</va-card-title>
      <va-card-content>
        FrontEnd version: {{ versions.web_version }}, VueJS: {{ version }}, Vite: {{ vite_version }}<br />
        Backend version: {{ versions.api_version }}, {{ versions.sys_version }}, TimescaleDB:
        {{ versions.timescaledb }}, PostGIS: {{ versions.postgis }}<br />
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
  const { userName, versions } = storeToRefs(GlobalStore)
  const { fetchVersions } = GlobalStore

  const CacheStore = useCacheStore()
  const { getInfoTiles } = storeToRefs(CacheStore)
  const { getAPI, InfoTiles, barChart, lineChartbyYear } = CacheStore

  // temporarily commented to pass build:
  console.log('Dashboard', __APP_VERSION__, __VITE_VERSION__, import.meta.env)
  const vite_version = ref(__VITE_VERSION__)
  let app_version = ref('')
  // only VITE_* are exposed
  app_version.value = __APP_VERSION__ + '-' + import.meta.env.VITE_GIT_VERSION
  if (import.meta.env.DEV) {
    app_version.value += '-' + 'dev'
  } else {
    app_version.value += '-' + 'prod'
  }
  console.log('app_version:', app_version.value, userName.value)

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

  onMounted(async () => {
    // Load version
    fetchVersions(app_version.value)
    // Load cache
    const mylogs = await getAPI('logs')
    const mystays = await getAPI('stays')
    const mymoorages = await getAPI('moorages')
    if (mylogs && mylogs[0] && mystays && mystays[0] && mymoorages && mymoorages[0]) {
      // for manual expanding in console:
      console.log('Dashboard onMounted my(logs|stays|moorages)', [
        [mylogs, mystays, mymoorages],
        {
          'mylogs[0].Distance': mylogs[0].Distance,
          'mystays[0].duration': mystays[0].duration,
          'mymoorages[0].total_stay': mymoorages[0].total_stay,
        },
      ])
    }
    // Load Charts Dashboard
    InfoTiles()
    barChart()
    lineChartbyYear()
    console.log('Dashboard onMounted getInfoTiles.value', getInfoTiles.value)
    for (let tile in CacheStore.tiles) {
      infoTiles.value[tile as unknown as number].value = CacheStore.tiles[tile as unknown as number]
    }
    console.debug('Dashboard onMounted CacheStore', CacheStore)
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
