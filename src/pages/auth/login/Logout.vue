<template>
  <va-inner-loading loading>
    <p>{{ $t('auth.logout') }}</p>
  </va-inner-loading>
</template>

<script setup>
  import { useRouter, useRoute } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'
  import PostgSail from '../../../services/api-client.js'

  useGlobalStore().logout()
  delete new PostgSail()._headers.Authorization

  //const GlobalStore = useGlobalStore()
  //GlobalStore.token = ''
  //delete new PostgSail()._headers.Authorization
  //GlobalStore.userName = ''
  //localStorage.removeItem('global')

  useRouter().push({
    name: 'login',
    params: { is401: useRoute().params.is401 },
  })
</script>
