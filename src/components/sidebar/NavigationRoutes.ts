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
        icon: 'vuestic-iconset-files',
      },
    },
    {
      name: 'boats',
      displayName: 'menu.boats',
      meta: {
        icon: 'fa-anchor',
      },
    },
    {
      name: 'privacy',
      displayName: 'menu.privacy',
      meta: {
        icon: 'fontelico-emo-wink',
      },
    },
  ] as INavigationRoute[],
}
