import { nextTick } from 'vue'

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import Page404Layout from '../layouts/Page404Layout.vue'
import RouteViewComponent from '../layouts/RouterBypass.vue'
import { useGlobalStore } from '../stores/global-store'
//import { isArrayTypeNode } from 'typescript'
//import { storeToRefs } from 'pinia'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'auth',
    component: AuthLayout,
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('../pages/auth/login/Login.vue'),
      },
      {
        name: 'demo',
        path: 'demo',
        component: () => import('../pages/auth/login/Demo.vue'),
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
        name: 'reset-password',
        path: 'reset-password',
        alias: 'reset',
        component: () => import('../pages/auth/reset-password/ResetPassword.vue'),
      },
      {
        name: 'logout',
        path: 'logout',
        component: () => import('../pages/auth/login/Logout.vue'),
      },
      {
        name: 'redirect',
        path: '',
        redirect: { name: 'login' },
      },
    ],
  },
  {
    path: '/:boat(\\w+)?',
    meta: { requiresAuth: true },
    component: AppLayout,
    children: [
      {
        name: 'dashboard',
        path: '',
        component: () => import('../pages/dashboard/Dashboard.vue'),
      },
      {
        name: 'logs',
        path: 'logs',
        //component: () => import('../pages/logs-book/List.vue'),
        component: () => import('../pages/logs-book/Page.vue'),
        meta: { isPublic: true, type: 'public_logs_list' },
      },
      // {
      //   name: 'log-details',
      //   path: 'log/:id(\\d+)',
      //   component: () => import('../pages/logs-book/Details.vue'),
      //   meta: { isPublic: true, type: 'public_logs' },
      // },
      {
        name: 'log-map',
        path: 'log/:id(\\d+)',
        component: () => import('../pages/logs-book/DetailsMap.vue'),
        meta: { isPublic: true, type: 'public_logs' },
      },
      {
        name: 'stays',
        path: 'stays',
        component: () => import('../pages/stays/List.vue'),
      },
      {
        name: 'stay-details',
        path: 'stay/:id(\\d+)',
        component: () => import('../pages/stays/Details.vue'),
      },
      {
        name: 'moorages',
        path: 'moorages',
        component: () => import('../pages/moorages/List.vue'),
      },
      {
        name: 'map',
        path: 'moorages/map',
        component: () => import('../pages/moorages/Map.vue'),
      },
      {
        name: 'moorage-details',
        path: 'moorage/:id(\\d+)',
        component: () => import('../pages/moorages/Details.vue'),
      },
      {
        name: 'moorage-stays',
        path: 'stays/moorage/:id(\\d+)',
        component: () => import('../pages/stays/Moorage.vue'),
      },
      {
        name: 'moorage-arrivals-departures',
        path: 'moorage/arrivals-departures/:id',
        component: () => import('../pages/logs-book/List.vue'),
      },
      {
        name: 'boats',
        path: 'boats',
        component: () => import('../pages/boats/List.vue'),
      },
      {
        name: 'boat-details',
        path: 'boat/:name',
        component: () => import('../pages/boats/Details.vue'),
      },
      {
        name: 'boat-new',
        path: 'boat/new',
        component: () => import('../pages/boats/Add.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../pages/profile/Profile.vue'),
      },
      /*
      {
        name: 'settings',
        path: 'settings',
        component: () => import('../pages/settings/Settings.vue'),
      },
      */
      {
        name: 'help-menu',
        path: '/:boat(\\w+)?',
        component: RouteViewComponent,
        children: [
          {
            path: 'privacy',
            name: 'privacy',
            component: () => import('../pages/privacy/Privacy.vue'),
            meta: { isPublic: true },
          },
          {
            path: 'faq',
            name: 'faq',
            component: () => import('../pages/faq/FAQ.vue'),
            meta: { isPublic: true },
          },
        ],
      },

      {
        path: 'grafana',
        name: 'grafana',
        component: () => import('../pages/grafana/Grafana.vue'),
        //beforeEnter(to, from, next) {
        //  window.open('https://app.openplotter.cloud', '_blank')
        //},
      },
      {
        path: 'activate',
        name: 'activate',
        component: () => import('../pages/activate/Activate.vue'),
      },
      {
        name: 'monitoring-menu',
        path: '/:boat(\\w+)?',
        component: RouteViewComponent,
        children: [
          {
            name: 'monitoring',
            path: 'monitoring',
            component: () => import('../pages/monitoring/Monitoring.vue'),
            meta: { isPublic: true, type: 'public_monitoring' },
          },
          {
            name: 'explore',
            path: 'monitoring/explore',
            component: () => import('../pages/monitoring/Explore.vue'),
          },
          {
            name: 'history',
            path: 'monitoring/history',
            component: () => import('../pages/monitoring/History.vue'),
          },
          {
            name: 'windy',
            path: 'monitoring/windy',
            component: () => import('../pages/monitoring/Windy.vue'),
          },
          {
            name: 'polar',
            path: 'monitoring/polar',
            component: () => import('../pages/monitoring/Polar_d3.vue'),
          },
        ],
      },
      {
        name: 'stats',
        path: '/:boat(\\w+)?/stats',
        component: () => import('../pages/stats/Stats.vue'),
        meta: { isPublic: true, type: 'public_stats' },
      },
      {
        name: 'timelapse-menu',
        path: '/:boat(\\w+)?',
        component: RouteViewComponent,
        meta: { isPublic: true },
        children: [
          {
            name: 'timelapse-replay',
            path: 'timelapse/:id(\\d+)?',
            component: () => import('../pages/timelapse/Timelapse3.vue'),
            meta: { isPublic: true, type: 'public_timelapse' },
          },
          {
            name: 'timelapse-form',
            path: 'timelapse/form',
            component: () => import('../pages/timelapse/Form.vue'),
          },
        ],
      },
      {
        name: 'pushover',
        path: 'pushover',
        component: () => import('../pages/activate/Pushover.vue'),
      },
      {
        name: 'badges',
        path: 'badges',
        component: () => import('../pages/badges/Badges.vue'),
      },
      {
        name: 'eventlogs',
        path: 'eventlogs',
        component: () => import('../pages/eventlogs/Timelines.vue'),
      },
    ],
  },
  {
    name: 'headless-menu',
    path: '/:boat(\\w+)?',
    meta: { requiresAuth: true },
    children: [
      {
        name: 'headless-map',
        path: 'map/:id(\\d+)?',
        component: () => import('../pages/map/Map.vue'),
        meta: { isPublic: true, type: 'public_logs' },
      },
      {
        name: 'headless-replay',
        path: 'maplapse/:id(\\d+)?',
        component: () => import('../pages/timelapse/Timelapse3.vue'),
        meta: { isPublic: true, type: 'public_timelapse' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'error-404',
    component: () => import('../pages/404-pages/VaPageNotFoundSimple.vue'),
    meta: { title: 'Error 404' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //  mode: process.env.VUE_APP_ROUTER_MODE_HISTORY === 'true' ? 'history' : 'hash',
  routes,
})

router.beforeEach(async (to, from, next) => {
  const { isLoggedIn, validEmail, hasVessel, preferredHomepage, isPublic } = useGlobalStore()
  console.log(
    'isLoggedIn',
    isLoggedIn,
    'validEmail',
    validEmail,
    'hasVessel',
    hasVessel,
    'preferredHomepage',
    preferredHomepage,
    'isPublic',
    isPublic,
  )
  const GlobalStore = useGlobalStore()
  const { is_public } = GlobalStore

  if (!isLoggedIn && to.path === '/login' && to.query.next) {
    if (
      /\w+\/(logs|timelapse|stats|monitoring|map|logmap)/.test(to.query.next as string) ||
      /\w+\/(log|map|logmap|timelapse\/\d+)/.test(to.query.next as string)
    ) {
      console.log(`req is in anonymous format and from login, set path to ${to.query.next}`)
      const new_path = to.query.next
      delete to.query.next
      if (Object.keys(to.query).length) {
        next({ path: new_path as string, query: to.query })
        return
      }
      next({ path: new_path as string })
      return
    }
    if (
      (/reset-password/.test(to.query.next as string) || /reset/.test(to.query.next as string)) &&
      to.query.token &&
      to.query.uuid
    ) {
      console.log(`req is reset-password and from login, set path to ${to.query.next}`)
      const new_path = to.query.next
      to.query.next = ''
      next({ path: new_path as string, query: { token: to.query.token, uuid: to.query.uuid } })
      return
    }
    //console.log(`req has query next: ${to.query.next}`)
  }

  if (
    !isLoggedIn &&
    to.matched.some((record) => record.meta.requiresAuth) &&
    to.matched.some((record) => record.meta.isPublic)
  ) {
    console.log(
      `req is in anonymous format, checking if accessible boat:${to.params.boat} type:${to.meta.type} id:${to.params?.id}`,
    )
    console.log(to)
    if (to.params?.boat && /\w+/.test(to.params.boat as string)) {
      const anonymous = await is_public(
        to.params.boat as string,
        to.meta.type as string,
        (parseFloat(to.params?.id as string) as number) || 0,
      )
      if (anonymous) {
        next()
        return
      }
      // we have a public url but with no public permission. redirect to login
      next({ name: 'login' })
      return
    } else if (to.name == 'faq' || to.name == 'privacy') {
      next()
      return
    }
  }

  if (to.matched.some((record) => record.meta.requiresAuth) && !isLoggedIn) {
    // If not logged in, yet required, redirect to login page
    next({ name: 'login', query: { next: to.path } })
  } else {
    console.warn('vue-router beforeEach activate -> /', isLoggedIn, validEmail, to)
    // Enforce email otp validation
    if (to.name != 'activate' && isLoggedIn && !validEmail) {
      next({ name: 'activate' })
      return
    }
    // Enforce vessel creation
    if (to.name != 'boat-new' && isLoggedIn && validEmail && !hasVessel) {
      next({ name: 'boat-new' })
      return
    }
    // Follow next query-string if all good
    if (to.query.next && isLoggedIn && validEmail && hasVessel) {
      next({ path: to.query.next as string })
      return
    }
    // All good go to dashboard or preferredHomepage
    if (to.name === 'login' && isLoggedIn && validEmail && hasVessel) {
      next({ name: preferredHomepage })
      return
    }
    next()
  }
})

router.afterEach((to) => {
  const { isLoggedIn, validEmail } = useGlobalStore()
  if (to.name === 'activate' && isLoggedIn && validEmail) {
    console.warn('vue-router afterEach activate -> /', isLoggedIn, validEmail, to)
    router.push({ path: '/' })
  }
  nextTick(() => {
    document.title = (to.meta.title as string) || `${import.meta.env.VITE_APP_TITLE} PostgSail Dashboard`
  })
})

export default router
