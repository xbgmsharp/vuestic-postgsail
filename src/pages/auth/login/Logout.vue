<template>
  <va-inner-loading loading>
    <p>{{ $t('auth.logout') }}</p>
  </va-inner-loading>
</template>

<script setup>
  import { useRouter, useRoute } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'
  import PostgSail from '../../../services/postgsail.js'

  const GlobalStore = useGlobalStore()

  GlobalStore.token = ''
  delete new PostgSail().API.defaults.headers.Authorization
  GlobalStore.userName = ''
  //localStorage.removeItem('settings')
  localStorage.removeItem('global')

  useRouter().push({
    name: 'login',
    params: { is401: useRoute().params.is401 },
  })
</script>
