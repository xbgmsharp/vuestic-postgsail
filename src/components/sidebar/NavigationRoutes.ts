// src/components/sidebar/NavigationRoutes.ts
//
// Information architecture for the app sidebar.
//
// Rules baked into this file:
//  - A branch (item with `children`) earns its accordion only with >= 3 children
//    that form a real task cluster. Today that is Places and Monitoring, nothing else.
//  - A branch `name` is a GROUP ID, never a route name. It must not collide with any
//    route name, otherwise `isItemActive` lights up two entries at once.
//    (The old file used `moorages` as both the group and one of its children.)
//  - `matches` lists detail/child route names that keep a top-level entry highlighted,
//    so `/moorage/42` still highlights Places > Moorages.

export type NavigationFeature = 'grafana' | 'qgis'

export interface INavigationRoute {
  /** Route name for leaves, stable group id for branches. */
  name: string
  /** i18n key. */
  displayName: string
  meta: { icon: string }
  /** Extra route names that keep this entry active (detail pages, sub-views). */
  matches?: string[]
  children?: INavigationRoute[]
  /** Hidden unless the matching feature flag is on. */
  feature?: NavigationFeature
  /** Hard hide, e.g. work in progress. */
  hidden?: boolean
}

export interface INavigationSection {
  id: string
  /** i18n key for the section label. */
  displayName: string
  items: INavigationRoute[]
}

const sections: INavigationSection[] = [
  {
    id: 'navigate',
    displayName: 'menu.sections.navigate',
    items: [
      {
        name: 'dashboard',
        displayName: 'menu.dashboard',
        meta: { icon: 'vuestic-iconset-dashboard' },
      },
      {
        name: 'map-explorer',
        displayName: 'menu.explore',
        meta: { icon: 'menu-explore-map' },
      },
      {
        name: 'logs',
        displayName: 'menu.logs',
        // NOTE: verify these route names against src/router — add log detail routes here.
        matches: ['log-details', 'log-map', 'logslapse'],
        meta: { icon: 'menu-logs' },
      },
      {
        name: 'places',
        displayName: 'menu.places',
        meta: { icon: 'menu-moorages' },
        children: [
          {
            name: 'stays',
            displayName: 'menu.stays',
            matches: ['stay-details'],
            meta: { icon: 'menu-stays' },
          },
          {
            name: 'moorages',
            displayName: 'menu.moorages',
            matches: ['moorage-details'],
            meta: { icon: 'menu-moorages' },
          },
          {
            name: 'map',
            displayName: 'menu.map',
            meta: { icon: 'menu-moorages-map' },
          },
        ],
      },
      {
        name: 'monitoring-menu',
        displayName: 'menu.monitoring',
        meta: { icon: 'menu-monitoring' },
        children: [
          {
            name: 'monitoring',
            displayName: 'menu.monitoring_realtime',
            meta: { icon: 'menu-monitoring' },
          },
          {
            name: 'history',
            displayName: 'menu.history',
            meta: { icon: 'material-icons-manage_history' },
          },
          {
            name: 'explore',
            // Own key: `menu.explore` is already taken by the map explorer, and two
            // entries labelled "Explore" in the same sidebar is a genuine ambiguity.
            displayName: 'menu.monitoring_explore',
            meta: { icon: 'material-icons-tune' },
          },
          {
            name: 'windy',
            displayName: 'menu.windy',
            meta: { icon: 'material-icons-wind_power' },
          },
        ],
      },
      {
        name: 'stats',
        displayName: 'menu.stats',
        meta: { icon: 'menu-stats' },
      },
    ],
  },
  {
    id: 'fleet',
    displayName: 'menu.sections.fleet',
    items: [
      {
        name: 'boats',
        displayName: 'menu.boats',
        matches: ['boat-details', 'boat-new'],
        meta: { icon: 'menu-boats' },
      },
      {
        name: 'friends',
        displayName: 'menu.friends',
        meta: { icon: 'fa-solid fa-user-group' },
      },
      {
        name: 'timelapse-form',
        displayName: 'menu.timelapse',
        // Stay lit while watching the output the form dispatched to.
        matches: ['timelapse-replay', 'timelapse3d-replay'],
        meta: { icon: 'menu-timelapse' },
      },
    ],
  },
  {
    id: 'insights',
    displayName: 'menu.sections.insights',
    items: [
      {
        name: 'logslapse',
        displayName: 'menu.logbook_report',
        meta: { icon: 'material-icons-print' },
      },
      {
        name: 'badges',
        displayName: 'menu.badges',
        meta: { icon: 'menu-badges' },
      },
      {
        name: 'eventlogs',
        displayName: 'menu.eventlogs',
        meta: { icon: 'menu-eventlogs' },
      },
      {
        name: 'grafana',
        displayName: 'menu.grafana',
        feature: 'grafana',
        meta: { icon: 'menu-grafana' },
      },
    ],
  },
]

// Help (faq / privacy) is deliberately absent — it belongs in the avatar dropdown
// or the footer, not competing with Dashboard for vertical space.

export function isItemActive(item: INavigationRoute, routeName?: string | null): boolean {
  if (!routeName) return false
  return item.name === routeName || item.matches?.includes(routeName) === true
}

export function isBranchActive(item: INavigationRoute, routeName?: string | null): boolean {
  if (isItemActive(item, routeName)) return true
  return item.children?.some((child) => isBranchActive(child, routeName)) === true
}

/** Drops hidden items and items gated behind a disabled feature; drops empty groups/sections. */
export function filterSections(
  input: INavigationSection[],
  features: Partial<Record<NavigationFeature, boolean>> = {},
): INavigationSection[] {
  const keep = (item: INavigationRoute) => !item.hidden && (!item.feature || features[item.feature] === true)

  return input
    .map((section) => ({
      ...section,
      items: section.items
        .filter(keep)
        .map((item) => (item.children ? { ...item, children: item.children.filter(keep) } : item))
        // A group that lost all its children is a dead end — drop it.
        .filter((item) => !item.children || item.children.length > 0),
    }))
    .filter((section) => section.items.length > 0)
}

export default {
  root: {
    name: '/',
    displayName: 'navigationRoutes.home',
  },
  sections,
}
