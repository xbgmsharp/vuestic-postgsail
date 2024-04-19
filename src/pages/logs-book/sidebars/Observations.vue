<script setup lang="ts">
  import { PropType, computed } from 'vue'
  import { useVModel } from '@vueuse/core'
  import { Trip, FormData } from '../types'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'
  const { isLoggedIn, publicVessel, instagram, website } = useGlobalStore()
  const { t } = useI18n()
  const route = useRoute()
  const props = defineProps({
    logbook: {
      type: Object as PropType<Trip>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    formData: {
      type: Object as PropType<FormData>,
      required: true,
    },
  })

  const emit = defineEmits<{
    (event: 'save', log: Trip): void
    (event: 'delete', log: Trip): void
  }>()
</script>

<template><div></div></template>
