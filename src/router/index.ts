import { nextTick } from 'vue'

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import Page404Layout from '../layouts/Page404Layout.vue'
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
      },
      {
        name: 'log-details',
        path: 'log/:id',
        component: () => import('../pages/logs-book/Details.vue'),
      },
      {
        name: 'stays',
        path: 'stays',
        component: () => import('../pages/stays/List.vue'),
      },
      /*{
        name: 'stay-details',
        path: 'stay/:id',
        component: () => import('../pages/stays/Details.vue'),
      },*/
      {
        name: 'moorages',
        path: 'moorages',
        component: () => import('../pages/moorages/List.vue'),
      },
      /*{
        name: 'moorage-details',
        path: 'moorage/:id',
        component: () => import('../pages/moorages/Details.vue'),
      },*/
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
      },
      {
        path: 'faq',
        name: 'faq',
        component: () => import('../pages/privacy/Privacy.vue'),
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
      },
      {
        name: 'timelapse',
        path: 'timelapse/:id?',
        component: () => import('../pages/timelapse/Timelapse.vue'),
      },
      {
        name: 'pushover',
        path: 'pushover',
        component: () => import('../pages/activate/Pushover.vue'),
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
  const {
    isLoggedIn,
    validEmail,
    hasVessel,
    settings: {
      preferences: { preferred_homepage },
    },
  } = useGlobalStore()
  if (to.matched.some((record) => record.meta.requiresAuth) && !isLoggedIn) {
    // If not logged in, yet required, redirect to login page:
    next({ name: 'login' })
  } else {
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
    // All good go to dashboard
    if (to.name === 'login' && isLoggedIn && validEmail && hasVessel) {
      next({
        name: ['dashboard', 'dashboard', 'logs', 'monitoring', 'stats'][preferred_homepage || 0],
      })
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
