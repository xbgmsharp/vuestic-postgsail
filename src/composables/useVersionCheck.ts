/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite/client" />
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useModal } from 'vuestic-ui'

export function useVersionCheck() {
  const { confirm } = useModal()

  useRegisterSW({
    onRegisteredSW(_swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (!registration) return
      setInterval(() => registration.update(), 60 * 60 * 1000)
    },
    async onNeedRefresh() {
      const ok = await confirm({
        message: 'A new version is available. Reload now to update?',
        okText: 'Reload',
        cancelText: 'Later',
      })
      if (ok) window.location.reload()
    },
  })
}
