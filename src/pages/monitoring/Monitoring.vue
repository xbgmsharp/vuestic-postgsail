<template>
  <template v-if="apiError">
    <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
  </template>
  <template v-if="apiSuccess">
    <va-card class="mb-3">
      <va-card-title>{{ $t('monitoring.title') }}</va-card-title>
      <va-card-content>
        <strong>{{ $t('monitoring.title') }}</strong>
        <div class="box layout gutter--md">
          <div class="row">
            <h4>
              Bromera <span id="ago">{{ fromNow }}</span>
            </h4>
          </div>
          <table>
            <tr>
              <td>
                <display-lcd id="wind" :display="items.wind"></display-lcd><br />
                <display-lcd id="temperature" :display="items.temperature"></display-lcd><br />
                <display-lcd id="battery" :display="items.battery"></display-lcd><br />
              </td>
              <td>
                <display-lcd id="humidity" :display="items.humidity"></display-lcd><br />
                <display-lcd id="water" :display="items.water"></display-lcd><br />
                <display-lcd id="pressure" :display="items.pressure"></display-lcd><br />
              </td>
            </tr>
          </table>
        </div>
      </va-card-content>
    </va-card>
  </template>
</template>

<script>
  import DisplayMulti from '../../components/DisplayMulti.vue'

  export default {
    name: 'Monitoring',
    components: {
      'display-lcd': DisplayMulti,
    },
  }
</script>

<script setup>
  import PostgSail from '../../services/postgsail.js'
  import moment from 'moment/min/moment-with-locales'
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  import monitoringDatas from '../../data/monitoring.json'

  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(null)
  const rowsData = ref([])

  const items = computed(() => {
    return {
      wind: {
        headerString: t('monitoring.wind.headerString'),
        unitString: t('monitoring.wind.unitString'),
        detailString: t('monitoring.wind.detailString'),
        lcdDecimals: 0,
        value: rowsData.value.windspeedoverground || 0,
        altValue: rowsData.value.winddirectionground || 0,
      },
      temperature: {
        headerString: t('monitoring.temperature.headerString'),
        unitString: t('monitoring.temperature.unitString'),
        detailString: t('monitoring.temperature.detailString'),
        lcdDecimals: 1,
        value: rowsData.value.insidetemperature || 0.0,
        altValue: rowsData.value.outsidetemperature || 0.0,
      },
      water: {
        headerString: t('monitoring.water.headerString'),
        unitString: t('monitoring.water.unitString'),
        detailString: t('monitoring.water.detailString'),
        lcdDecimals: 1,
        value: 0,
        altValue: rowsData.value.watertemperature || 0.0,
      },
      battery: {
        headerString: t('monitoring.battery.headerString'),
        unitString: t('monitoring.battery.unitString'),
        detailString: t('monitoring.battery.detailString'),
        lcdDecimals: 1,
        value: 0,
        altValue: 0,
      },
      humidity: {
        headerString: t('monitoring.humidity.headerString'),
        unitString: t('monitoring.humidity.unitString'),
        detailString: t('monitoring.humidity.detailString'),
        lcdDecimals: 0,
        value: rowsData.value.insidehumidity || 0,
        altValue: rowsData.value.outsidehumidity || 0,
      },
      pressure: {
        headerString: t('monitoring.pressure.headerString'),
        unitString: t('monitoring.pressure.unitString'),
        detailString: t('monitoring.pressure.detailString'),
        lcdDecimals: 1,
        value: rowsData.value.insidepressure || 0.0,
        altValue: rowsData.value.outsidepressure || 0.0,
      },
    }
  })

  const fromNow = computed(() => {
    return moment.utc(rowsData.value._rawValue[0].time).locale('es').fromNow()
  })

  onMounted(async () => {
    apiError.value = null
    isBusy.value = true

    try {
      const api = new PostgSail()
      const response = await api.monitoring()
      if (Array.isArray(response.data) && response.data[0]) {
        apiSuccess.value = true
        console.log(response.data[0].time)
        console.log(moment.utc(response.data[0].time).locale('es').fromNow())
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response.data)
      } else {
        throw { response }
      }
    } catch ({ response }) {
      apiError.value = t('monitoring.error')
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample datas from local json...', apiError.value)
        console.log(monitoringDatas[0].time)
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...monitoringDatas)
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
    border-radius: 10px;
    border: 1px solid #ccc;
    padding: 20px 10px;
    text-align: center;
    width: 40%;
  }

  strong {
    display: block;
    margin-bottom: 10px;
  }

  .code {
    border: 0px;
    text-align: center;
    border-bottom: 3px solid #999;
    width: 30px;
    margin: 0px 10px;
    font-weight: bold;
    font-size: 20px;
    padding-bottom: 5px;
  }
</style>
