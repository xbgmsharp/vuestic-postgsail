export interface INavigationRoute {
  name: string
  displayName: string
  meta: { icon: string }
  children?: INavigationRoute[]
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  routes: [
    {
      name: 'dashboard',
      displayName: 'menu.dashboard',
      meta: {
        icon: 'vuestic-iconset-dashboard',
      },
    },
    {
      name: 'logs',
      displayName: 'menu.logs',
      meta: {
        icon: 'menu-logs',
      },
    },
    {
      name: 'stays',
      displayName: 'menu.stays',
      meta: {
        icon: 'menu-stays',
      },
    },
    {
      name: 'moorages',
      displayName: 'menu.moorages',
      meta: {
        icon: 'menu-moorages',
      },
    },
    {
      name: 'map',
      displayName: 'menu.map',
      meta: {
        icon: 'menu-moorages-map',
      },
    },
    {
      name: 'monitoring',
      displayName: 'menu.monitoring',
      meta: {
        icon: 'menu-monitoring',
      },
    },
    {
      name: 'boats',
      displayName: 'menu.boats',
      meta: {
        icon: 'menu-boats',
      },
    },
    {
      name: 'stats',
      displayName: 'menu.stats',
      meta: {
        icon: 'menu-stats',
      },
    },
    {
      name: 'timelapse',
      displayName: 'menu.timelapse',
      meta: {
        icon: 'menu-timelapse',
      },
    },
    {
      name: 'grafana',
      displayName: 'menu.grafana',
      meta: {
        icon: 'menu-grafana',
      },
    },
  ] as INavigationRoute[],
}
