import { createApp } from 'vue'
import stores from './stores'
import router from './router'
import i18n from './i18n'
import { createVuestic } from 'vuestic-ui'
import vuesticGlobalConfig from './services/vuestic-ui/global-config'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

window.addEventListener('vite:preloadError', (event) => {
  console.warn('Chunk load error, reloading...', event)
  window.location.reload()
})

const app = createApp(App)

app.use(stores)
app.use(VueQueryPlugin) // VueQuery before router
app.use(router)
app.use(i18n)
app.use(createVuestic({ config: vuesticGlobalConfig }))

app.mount('#app')
