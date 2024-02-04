<template>
  <div>
    <template v-if="!gotVessel">
      <nodatayet />
    </template>
    <template v-if="!windy_enable">
      <p>You need to enable public profile and Windy Station in your profile.</p>
      <p>Windy require outside observations to allow Windy Weather Station.</p>
      <p>
        It can take up to one hour for your station to be create and accessible in Windy. You will received a
        notification when it is ready.
      </p>
    </template>
    <template v-else>
      Windy Weather Station opened in a new window.
      <p>Windy require outside observations to allow Windy Weather Station.</p>
      <a :href="windy_pws_url" target="_blank" class="va-link">Windy Weather Station</a>
    </template>
  </div>
</template>
<script setup>
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import nodatayet from '../../components/noDataScreen.vue'

  import useGlobalStore from '../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()
  const gotVessel = ref(GlobalStore.hasVessel || false)
  const windy_enable = ref(Boolean(GlobalStore.windy) || false)
  const windy_pws_url = ref(`https://www.windy.com/station/pws-${GlobalStore.windy}`)

  onMounted(() => {
    console.log('Windy onMounted')
    /* redirect to grafana if we have a vessel */
    if (GlobalStore.hasVessel) {
      window.open(`https://www.windy.com/station/pws-${GlobalStore.windy}`, '_blank')
    }
  })
</script>
