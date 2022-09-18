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
  ] as INavigationRoute[],
}
