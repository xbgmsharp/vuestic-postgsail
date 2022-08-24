import { nextTick } from 'vue'

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import Page404Layout from '../layouts/Page404Layout.vue'

import RouteViewComponent from '../layouts/RouterBypass.vue'
import UIRoute from '../pages/admin/ui/route'

import { useGlobalStore } from '../stores/global-store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: AuthLayout,
    //meta: { title: 'Login 2' },
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/login/Login.vue'),
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/signup/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/recover-password/RecoverPassword.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    name: 'admin',
    path: '/',
    meta: { requiresAuth: true },
    async beforeEnter(to, from, next) {
      const store = useGlobalStore()
      next()
    },
    component: AppLayout,
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/admin/dashboard/Dashboard.vue'),
      },
      {
        name: 'statistics',
        path: 'statistics',
        component: RouteViewComponent,
        children: [
          {
            name: 'charts',
            path: 'charts',
            component: () => import('../pages/admin/tables/Logs.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Charts',
            },
          },
          {
            name: 'progress-bars',
            path: 'progress-bars',
            component: () => import('../pages/admin/statistics/progress-bars/ProgressBars.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Progress-Bars',
            },
          },
        ],
      },
      {
        name: 'moorages',
        path: 'moorages',
        component: RouteViewComponent,
        children: [
          {
            name: 'form-elements',
            path: 'form-elements',
            component: () => import('../pages/admin/tables/markup-tables/MarkupTables.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/inputs',
            },
          },
          {
            name: 'medium-editor',
            path: 'medium-editor',
            component: () => import('../pages/admin/forms/medium-editor/MediumEditor.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Medium-Editor',
            },
          },
        ],
      },
      {
        name: 'maps',
        path: 'maps',
        component: RouteViewComponent,
        children: [
          {
            name: 'maplibre-maps',
            path: 'maplibre-maps',
            component: () => import('../pages/admin/maps/maplibre-maps/MapLibreMapsPage.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Maps',
            },
          },
          {
            name: 'yandex-maps',
            path: 'yandex-maps',
            component: () => import('../pages/admin/maps/yandex-maps/YandexMapsPage.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Maps',
            },
          },
          {
            name: 'leaflet-maps',
            path: 'leaflet-maps',
            component: () => import('../pages/admin/maps/leaflet-maps/LeafletMapsPage.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Maps',
            },
          },
          {
            name: 'bubble-maps',
            path: 'bubble-maps',
            component: () => import('../pages/admin/maps/bubble-maps/BubbleMapsPage.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Maps',
            },
          },
          {
            name: 'line-maps',
            path: 'line-maps',
            component: () => import('../pages/admin/maps/line-maps/LineMapsPage.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Maps',
            },
          },
        ],
      },
      {
        name: 'tables',
        path: 'tables',
        component: RouteViewComponent,
        children: [
          {
            name: 'markup',
            path: 'markup',
            component: () => import('../pages/admin/tables/markup-tables/MarkupTables.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Tables',
            },
          },
          {
            name: 'data',
            path: 'data',
            component: () => import('../pages/admin/tables/data-tables/DataTables.vue'),
            meta: {
              wikiLink: 'https://github.com/epicmaxco/vuestic-admin/wiki/Tables',
            },
          },
        ],
      },
      {
        name: 'pages',
        path: 'pages',
        component: RouteViewComponent,
        children: [
          {
            name: '404-pages',
            path: '404-pages',
            component: () => import('../pages/admin/pages/404PagesPage.vue'),
          },
          {
            name: 'faq',
            path: 'faq',
            component: () => import('../pages/admin/pages/FaqPage.vue'),
          },
          {
            name: 'privacy',
            path: 'privacy',
            component: () => import('../pages/admin/pages/FaqPage.vue'),
          },
        ],
      },
      UIRoute,
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/login/Login.vue'),
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/signup/Signup.vue'),
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/recover-password/RecoverPassword.vue'),
      },
      {
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'error-404',
    component: Page404Layout,
    meta: { title: 'Error 404' },
  },
  {
    path: '/403',
    name: 'unauthorized',
    component: Page404Layout,
    meta: { title: 'Error 403' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //  mode: process.env.VUE_APP_ROUTER_MODE_HISTORY === 'true' ? 'history' : 'hash',
  routes,
})

router.beforeEach((to, from, next) => {
  console.log(localStorage.getItem('token'))
  const loggedIn = localStorage.getItem('token')
  console.log(loggedIn)
  if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
    // If not login redirect to login page.
    next({ name: 'login' })
  } else {
    if (to.name === 'login' && loggedIn) {
      next({ name: 'dashboard' })
      return
    }
    next()
  }
})

router.afterEach((to) => {
  nextTick(() => {
    document.title = (to.meta.title as string) || 'PostgSail Dashboard'
  })
})

export default router
