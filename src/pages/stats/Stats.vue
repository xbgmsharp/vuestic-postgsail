<template>
  <div class="row">
    <div class="flex xs12 lg6">
      <va-card class="mb-4 px-3">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content>
          <table class="va-table va-table--hoverable va-table--striped">
            <tbody>
              <tr v-for="(value, index) in Object.entries(logs)" :key="index">
                <td>
                  <b>{{ value[0] }}</b>
                </td>
                <td>{{ value[1] }}</td>
              </tr>
            </tbody>
          </table>
        </va-card-content>
      </va-card>
    </div>

    <div class="flex xs12 lg6">
      <va-card class="mb-4 px-3">
        <va-card-title>{{ t('stats.stats') }}</va-card-title>
        <va-card-content>
          <table class="va-table va-table--hoverable va-table--striped">
            <tbody>
              <tr v-for="(value, index) in Object.entries(moorages)" :key="index">
                <td>
                  <b>{{ value[0] }}</b>
                </td>
                <td>{{ value[1] }}</td>
              </tr>
            </tbody>
          </table>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/postgsail.js'

  import stats_logs from '../../data/stats_logs.json'
  import stats_moorages from '../../data/stats_moorages.json'

  const { t } = useI18n()
  const isBusy = ref(false)
  const apiError = ref(null)

  const logs = ref({})
  const moorages = ref({})

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      let response = await api.stats_logs_view()
      if (response.data && response.data[0]) {
        logs.value = response.data[0]
      }
      response = await api.stats_moorages_view()
      if (response.data && response.data[0]) {
        moorages.value = response.data[0]
      }
    } catch (e) {
      // error TS2322: Type 'unknown' is not assignable to type 'null'.
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample datas from local json...', apiError.value)
        logs.value = stats_logs[0]
        moorages.value = stats_moorages[0]
      }
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
</style>
