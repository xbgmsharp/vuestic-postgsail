import { nextTick } from 'vue'

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import Page404Layout from '../layouts/Page404Layout.vue'
import RouteViewComponent from '../layouts/RouterBypass.vue'
import { useGlobalStore } from '../stores/global-store'
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
    path: '/',
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
        component: () => import('../pages/logs-book/List.vue'),
        meta: { requiresAuth: true, isPublic: true },
      },
      {
        name: 'log-details',
        path: 'log/:id',
        component: () => import('../pages/logs-book/Details.vue'),
        meta: { requiresAuth: true, isPublic: true },
      },
      {
        name: 'stays',
        path: 'stays',
        component: () => import('../pages/stays/List.vue'),
        meta: { requiresAuth: true, isPublic: true },
      },
      {
        name: 'stay-details',
        path: 'stay/:id',
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
        path: 'moorage/:id',
        component: () => import('../pages/moorages/Details.vue'),
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
      {
        path: 'privacy',
        name: 'privacy',
        component: () => import('../pages/privacy/Privacy.vue'),
        meta: { requiresAuth: true, isPublic: true },
      },
      {
        path: 'faq',
        name: 'faq',
        component: () => import('../pages/faq/FAQ.vue'),
        meta: { requiresAuth: true, isPublic: true },
      },
      {
        path: 'grafana',
        name: 'grafana',
        component: () => import('../pages/grafana/Grafana.vue'),
        beforeEnter(to, from, next) {
          window.open('https://app.openplotter.cloud', '_blank')
        },
      },
      {
        path: 'activate',
        name: 'activate',
        component: () => import('../pages/activate/Activate.vue'),
      },
      {
        path: 'monitoring',
        name: 'monitoring',
        component: () => import('../pages/monitoring/Monitoring.vue'),
      },
      {
        name: 'stats',
        path: 'stats',
        component: () => import('../pages/stats/Stats.vue'),
        meta: { requiresAuth: true, isPublic: true },
      },
      {
        name: 'timelapse-menu',
        path: '/',
        component: RouteViewComponent,
        meta: { requiresAuth: true, isPublic: true },
        children: [
          {
            name: 'timelapse-replay',
            path: 'timelapse/:id?',
            component: () => import('../pages/timelapse/Timelapse2.vue'),
            meta: { requiresAuth: false, isPublic: true },
          },
          {
            name: 'timelapse-form',
            path: 'timelapse/form',
            component: () => import('../pages/timelapse/Form.vue'),
            meta: { requiresAuth: false, isPublic: true },
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
    path: '/:pathMatch(.*)*',
    name: 'error-404',
    component: () => import('../pages/404-pages/VaPageNotFoundSimple.vue'),
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
  const { isLoggedIn, validEmail, hasVessel, preferredHomepage, publicId } = useGlobalStore()
  console.log(
    'isLoggedIn',
    isLoggedIn,
    'validEmail',
    validEmail,
    'hasVessel',
    hasVessel,
    'preferredHomepage',
    preferredHomepage,
    'publicId',
    publicId,
  )
  /*
  // If next query-string
  if (to.query.next) {
    console.warn('vue-router beforeEach to.query.next', to)
  }
  // Is publicly accessible?
  if (to.matched.some((record) => record.meta.isPublic) && !isLoggedIn) {
    next()
    return
  }
  */
  if (to.matched.some((record) => record.meta.requiresAuth) && !isLoggedIn) {
    // If not logged in, yet required, redirect to login page
    next({ name: 'login' })
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
