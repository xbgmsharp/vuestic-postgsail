import { useGlobalStore } from '../stores/global-store'
import PostgSail from '../services/api-client'
import router from '../router'

export function handleUnauthorized() {
  const globalStore = useGlobalStore()
  if (!globalStore.isLoggedIn) return
  globalStore.logout()
  new PostgSail().setBearerAuth('')
  router.push({ name: 'login' })
}
