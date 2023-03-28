<template>
  <va-inner-loading loading>
    <p>{{ $t('auth.logout') }}</p>
  </va-inner-loading>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'
  import PostgSail from '../../../services/api-client'

  const router = useRouter()

  useGlobalStore().logout()
  new PostgSail().setBearerAuth('')

  console.debug('Logout router push login')
  router.push({
    name: 'login',
    query: { is401: true },
  })
</script>
