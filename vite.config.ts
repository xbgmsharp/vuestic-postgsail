import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import VueI18nPlugin from '@intlify/vite-plugin-vue-i18n'
import { VitePWA } from 'vite-plugin-pwa'
import { packages } from './package-lock.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // i am ignoring my custom '<container>' tag
          isCustomElement: (tag) => tag.startsWith('steelseries'),
        },
      },
    }),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  define: {
    'process.env': {},
    __VITE_VERSION__: JSON.stringify(packages['node_modules/vite'].version),
    'import.meta.env.VITE_GIT_VERSION': JSON.stringify(packages['node_modules/vite'].version),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    hmr: { overlay: false },
  },
})
