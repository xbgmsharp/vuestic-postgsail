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
      name: 'grafana',
      displayName: 'menu.grafana',
      meta: {
        icon: 'menu-grafana',
      },
    },
  ] as INavigationRoute[],
}
