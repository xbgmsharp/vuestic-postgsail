import i18n from '../i18n'
import { setAppTitle } from '../utils/app.js'
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
        meta: { titleKey: 'auth.login' },
      },
      {
        name: 'demo',
        path: 'demo',
        component: () => import('../pages/auth/login/Demo.vue'),
        meta: { titleKey: 'auth.demo' },
      },
      {
        name: 'signup',
        path: 'signup',
        component: () => import('../pages/auth/signup/Signup.vue'),
        meta: { titleKey: 'auth.sign_up' },
      },
      {
        name: 'recover-password',
        path: 'recover-password',
        component: () => import('../pages/auth/recover-password/RecoverPassword.vue'),
        meta: { titleKey: 'auth.recover_password' },
      },
      {
        name: 'reset-password',
        path: 'reset-password',
        alias: 'reset',
        component: () => import('../pages/auth/reset-password/ResetPassword.vue'),
        meta: { titleKey: 'auth.reset_password' },
      },
      {
        name: 'logout',
        path: 'logout',
        component: () => import('../pages/auth/login/Logout.vue'),
        meta: { titleKey: 'auth.logout' },
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
        meta: { titleKey: 'dashboard.title' },
      },
      {
        name: 'logs',
        path: 'logs',
        //component: () => import('../pages/logs-book/List.vue'),
        component: () => import('../pages/logs-book/Page.vue'),
        meta: { titleKey: 'logs.list.title', isPublic: true, type: 'public_logs_list' },
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
        meta: { titleKey: 'logs.details.title', isPublic: true, type: 'public_logs' },
      },
      {
        name: 'stays',
        path: 'stays',
        component: () => import('../pages/stays/List.vue'),
        meta: { titleKey: 'stays.list.title' },
      },
      {
        name: 'stay-details',
        path: 'stay/:id(\\d+)',
        component: () => import('../pages/stays/Details.vue'),
        meta: { titleKey: 'stays.details.title' },
      },
      {
        name: 'moorages',
        path: 'moorages',
        component: () => import('../pages/moorages/List.vue'),
        meta: { titleKey: 'moorages.list.title' },
      },
      {
        name: 'map',
        path: 'moorages/map',
        component: () => import('../pages/moorages/Map.vue'),
        meta: { titleKey: 'moorages.map.title' },
      },
      {
        name: 'moorage-details',
        path: 'moorage/:id(\\d+)',
        component: () => import('../pages/moorages/Details.vue'),
        meta: { titleKey: 'moorages.details.title' },
      },
      {
        name: 'moorage-stays',
        path: 'stays/moorage/:id(\\d+)',
        component: () => import('../pages/stays/Moorage.vue'),
        meta: { titleKey: 'stays.moorage.title' },
      },
      {
        name: 'moorage-arrivals-departures',
        path: 'moorage/arrivals-departures/:id',
        component: () => import('../pages/logs-book/List.vue'),
        meta: { titleKey: 'moorages.arrivals-departures.title' },
      },
      {
        name: 'boats',
        path: 'boats',
        component: () => import('../pages/boats/List.vue'),
        meta: { titleKey: 'boats.list.title' },
      },
      {
        name: 'boat-details',
        path: 'boat/:name',
        component: () => import('../pages/boats/Details.vue'),
        meta: { titleKey: 'boats.details.title' },
      },
      {
        name: 'boat-new',
        path: 'boat/new',
        component: () => import('../pages/boats/Add.vue'),
        meta: { titleKey: 'boats.details.title' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../pages/profile/Profile.vue'),
        meta: { titleKey: 'profile.title' },
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
            meta: { titleKey: 'privacy.title', isPublic: true },
          },
          {
            path: 'faq',
            name: 'faq',
            component: () => import('../pages/faq/FAQ.vue'),
            meta: { titleKey: 'faq.title', isPublic: true },
          },
        ],
      },

      {
        path: 'grafana',
        name: 'grafana',
        component: () => import('../pages/grafana/Grafana.vue'),
        meta: { titleKey: 'menu.grafana' },
        //beforeEnter(to, from, next) {
        //  window.open('https://app.openplotter.cloud', '_blank')
        //},
      },
      {
        path: 'activate',
        name: 'activate',
        component: () => import('../pages/activate/Activate.vue'),
        meta: { titleKey: 'auth.otp' },
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
            meta: { titleKey: 'monitoring.title', isPublic: true, type: 'public_monitoring' },
          },
          {
            name: 'explore',
            path: 'monitoring/explore',
            component: () => import('../pages/monitoring/Explore.vue'),
            meta: { titleKey: 'monitoring.explore.title' },
          },
          {
            name: 'history',
            path: 'monitoring/history',
            component: () => import('../pages/monitoring/History.vue'),
            meta: { titleKey: 'monitoring.history.title' },
          },
          {
            name: 'windy',
            path: 'monitoring/windy',
            component: () => import('../pages/monitoring/Windy.vue'),
            meta: { titleKey: 'monitoring.windy.title' },
          },
          {
            name: 'polar',
            path: 'monitoring/polar',
            component: () => import('../pages/monitoring/Polar_d3.vue'),
            meta: { titleKey: 'monitoring.polar.title' },
          },
        ],
      },
      {
        name: 'stats',
        path: '/:boat(\\w+)?/stats',
        component: () => import('../pages/stats/Stats.vue'),
        meta: { titleKey: 'stats.stats', isPublic: true, type: 'public_stats' },
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
            meta: { titleKey: 'timelapse.title', isPublic: true, type: 'public_timelapse' },
          },
          {
            name: 'timelapse-form',
            path: 'timelapse/form',
            component: () => import('../pages/timelapse/Form.vue'),
            meta: { titleKey: 'timelapse.customize' },
          },
        ],
      },
      {
        name: 'pushover',
        path: 'pushover',
        component: () => import('../pages/activate/Pushover.vue'),
        meta: { titleKey: 'auth.otp' },
      },
      {
        name: 'badges',
        path: 'badges',
        component: () => import('../pages/badges/Badges.vue'),
        meta: { titleKey: 'menu.badges' },
      },
      {
        name: 'eventlogs',
        path: 'eventlogs',
        component: () => import('../pages/eventlogs/Timelines.vue'),
        meta: { titleKey: 'menu.eventlogs' },
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
        meta: { titleKey: 'logs.details.title', isPublic: true, type: 'public_logs' },
      },
      {
        name: 'headless-replay',
        path: 'maplapse/:id(\\d+)?',
        component: () => import('../pages/timelapse/Timelapse3.vue'),
        meta: { titleKey: 'timelapse.title', isPublic: true, type: 'public_timelapse' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'error-404',
    component: () => import('../pages/404-pages/VaPageNotFoundSimple.vue'),
    meta: { titleKey: '404.title' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //  mode: process.env.VUE_APP_ROUTER_MODE_HISTORY === 'true' ? 'history' : 'hash',
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  },
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
    if (to.meta.titleKey) {
      const titleKey = to.meta.titleKey as string
      document.title = setAppTitle(i18n.global.t(titleKey))
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
})

export default router
