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
      name: 'moorages',
      displayName: 'menu.moorages',
      meta: {
        icon: 'menu-moorages',
      },
      children: [
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
      ],
    },

    {
      name: 'monitoring-menu',
      displayName: 'menu.monitoring',
      meta: {
        icon: 'menu-monitoring',
      },
      disabled: false,
      children: [
        {
          name: 'monitoring',
          displayName: 'menu.monitoring_realtime',
          meta: {
            icon: 'menu-monitoring',
          },
        },
        {
          name: 'history',
          displayName: 'menu.history',
          meta: {
            icon: 'material-icons-manage_history',
          },
        },
        {
          name: 'explore',
          displayName: 'menu.explore',
          meta: {
            icon: 'material-icons-tune',
          },
        },
        {
          name: 'windy',
          displayName: 'menu.windy',
          meta: {
            icon: 'material-icons-wind_power',
          },
        },
      ],
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
      disabled: true,
      children: [
        {
          name: 'timelapse-replay',
          displayName: 'menu.timelapse_replay',
          meta: {
            icon: 'material-icons-replay',
          },
        },
        {
          name: 'timelapse-form',
          displayName: 'menu.timelapse_form',
          meta: {
            icon: 'material-icons-tune',
          },
        },
      ],
    },
    {
      name: 'grafana',
      displayName: 'menu.grafana',
      meta: {
        icon: 'menu-grafana',
      },
    },
    {
      name: 'badges',
      displayName: 'menu.badges',
      meta: {
        icon: 'menu-badges',
      },
    },
    {
      name: 'eventlogs',
      displayName: 'menu.eventlogs',
      meta: {
        icon: 'menu-eventlogs',
      },
    },
    {
      name: 'help',
      displayName: 'menu.help',
      meta: {
        icon: 'help2',
      },
      disabled: true,
      children: [
        {
          name: 'faq',
          displayName: 'menu.faq',
          meta: {
            icon: 'menu-faq',
          },
        },
        {
          name: 'privacy',
          displayName: 'menu.privacy',
          meta: {
            icon: 'menu-privacy',
          },
        },
      ],
    },
  ] as INavigationRoute[],
}
