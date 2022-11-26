<template>
  <va-inner-loading loading>
    <p>{{ $t('auth.logout') }}</p>
  </va-inner-loading>
</template>

<script setup>
  import { useRouter, useRoute } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'

  const GlobalStore = useGlobalStore()

  GlobalStore.token = ''
  GlobalStore.userName = ''
  localStorage.removeItem('settings')

  useRouter().push({
    name: 'login',
    params: { is401: useRoute().params.is401 },
  })
</script>
