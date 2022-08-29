import { nextTick } from 'vue'

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import AuthLayout from '../layouts/AuthLayout.vue'
import AppLayout from '../layouts/AppLayout.vue'
import Page404Layout from '../layouts/Page404Layout.vue'

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
        name: 'logout',
        path: 'logout',
        component: () => import('../pages/auth/login/Logout.vue'),
      },
      {
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
        name: 'boats',
        path: 'boats',
        component: () => import('../pages/boats/List.vue'),
      },
      {
        name: 'boat-details',
        path: 'boat/:mmsi',
        component: () => import('../pages/boats/Details.vue'),
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('../pages/profile/Profile.vue'),
      },
      {
        path: '/privacy',
        name: 'privacy',
        component: () => import('../pages/privacy/Privacy.vue'),
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
  const loggedIn = localStorage.getItem('token')
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
