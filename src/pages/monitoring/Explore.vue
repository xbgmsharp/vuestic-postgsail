<template>
  <template v-if="apiError">
    <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
  </template>
  <template v-if="offline">
    <Offline />
  </template>
  <template v-if="!offline && apiSuccess">
    <va-card class="mb-3">
      <va-card-content>
        <div class="layout gutter--md">
          <div class="py-2 grid grid-cols-12 gap-6">
            <div class="col-span-12 md:col-span-6 flex flex-col">
              <va-input v-model="filter.name" :clearable="true" placeholder="Filter by name..." />
            </div>
          </div>
        </div>
      </va-card-content>
    </va-card>
    <va-card class="mb-3">
      <va-card-title>{{ $t('monitoring.explore.title') }}</va-card-title>
      <va-card-content>
        <h1 class="box layout gutter--md">{{ $t('monitoring.explore.msg') }}</h1>
        <table class="va-table va-table--hoverable va-table--striped" style="width: 100%">
          <thead>
            <tr>
              <th>Date</th>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.key">
              <td>{{ item.time }}</td>
              <td>{{ item.key }}</td>
              <td>{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
  </template>
</template>

<script>
  import Offline from '../../components/MonitoringOffline.vue'

  export default {
    name: 'Explore',
    components: {
      Offline,
    },
  }
</script>

<script setup>
  // TODO update setup with lang="ts"
  import { computed, ref, reactive, onMounted } from 'vue'
  import { setAppTitle } from '../../utils/app.js'
  import PostgSail from '../../services/api-client'
  import { useI18n } from 'vue-i18n'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'

  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(null)
  const apiData = reactive([])
  const offline = ref(false)
  const getDefaultFilter = () => {
    return {
      name: null,
    }
  }
  const filter = reactive(getDefaultFilter())

  const items = computed(() => {
    return Array.isArray(apiData.value)
      ? apiData.value
          .map((row) => ({
            time: dateFormatUTC(row.time),
            key: row.key,
            value: row.value,
          }))
          .filter((row) => {
            const f = filter
            if (Object.keys(f).every((fkey) => !f[fkey])) {
              return true
            }
            return Object.keys(f).every((fkey) => {
              if (!f[fkey]) {
                return true
              }
              switch (fkey) {
                case 'name':
                  return row.key.toLowerCase().includes(f[fkey].toLowerCase())
              }
            })
          })
      : []
  })

  onMounted(async () => {
    const title = t('monitoring.explore.title')
    document.title = setAppTitle(title)

    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.explore()
      if (Array.isArray(response)) {
        console.log('explore', response)
        apiData.value = response
        console.log('explore', apiData.value)
        apiSuccess.value = true
        offline.value = false
      } else {
        console.warn('explore', response)
        //throw { response }
      }
    } catch ({ response }) {
      console.log(response)
      apiError.value = t('monitoring.error')
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
      }
    } finally {
      isBusy.value = false
    }
  })
</script>

<style>
  .box {
    align-items: center;
    justify-content: center;
    /*background: white;*/
    /*border-radius: 10px;*/
    /*border: 1px solid #ccc;*/
    padding: 10px 10px;
    text-align: center;
    width: 50%;
  }
</style>
