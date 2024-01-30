<template>
  <div>
    <template v-if="!gotVessel">
      <nodatayet />
    </template>
    <template v-else>
      Grafana opened in a new window.
      <p>
        You will need to create an account on https://auth.openplotter.cloud prior to access Grafana and other services.
      </p></template
    >
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

  onMounted(() => {
    console.log('Grafana onMounted')
    /* redirect to grafana if we have a vessel */
    if (GlobalStore.hasVessel) {
      window.open('https://app.openplotter.cloud', '_blank')
    }
  })
</script>
