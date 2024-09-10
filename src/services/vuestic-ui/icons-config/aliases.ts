import { shallowRef } from 'vue'
import IconFuel from '../../../components/icons/IconFuel.vue'
import IconMonitoring from '../../../components/icons/IconMonitoring.vue'
import IconLogs from '../../../components/icons/IconLogs.vue'
import IconCSV from '../../../components/icons/IconCSV.vue'
import IconGPX from '../../../components/icons/IconGPX.vue'
import IconGrafana from '../../../components/icons/IconGrafana.vue'
import IconSailboat from '../../../components/icons/IconSailboat.vue'
import IconAnchor from '../../../components/icons/IconAnchor.vue'
import IconHarbor from '../../../components/icons/IconHarbor.vue'
import IconGeoJSON from '../../../components/icons/IconGeoJSON.vue'
import IconSolar from '../../../components/icons/IconSolar.vue'
import IconSolar2 from '../../../components/icons/IconSolar2.vue'
import IconBattery from '../../../components/icons/IconBattery.vue'
import IconTank from '../../../components/icons/IconTank.vue'
import IconBolt from '../../../components/icons/IconBolt.vue'
import IconSunrise from '../../../components/icons/IconSunrise.vue'
import IconSunset from '../../../components/icons/IconSunset.vue'
import IconKML from '../../../components/icons/IconKML.vue'
import IconMP4 from '../../../components/icons/IconMP4.vue'
import IconPNG from '../../../components/icons/IconPNG.vue'

export default [
  {
    name: 'angle_down',
    to: 'fa4-angle-down',
  },
  {
    name: 'angle_up',
    to: 'fa4-angle-up',
  },
  {
    name: 'bell',
    to: 'fa4-bell',
  },
  {
    name: 'bell_slash',
    to: 'fa4-bell-slash',
  },
  {
    name: 'cogs',
    to: 'fa4-cogs',
  },
  {
    name: 'envelope',
    to: 'fa4-envelope',
  },
  {
    name: 'eye',
    to: 'fa4-eye',
  },
  {
    name: 'gear',
    to: 'fa4-gear',
  },
  {
    name: 'map',
    to: 'fa4-map',
  },
  {
    name: 'map_marker',
    to: 'fa4-map-marker',
  },
  {
    name: 'music',
    to: 'fa4-music',
  },
  {
    name: 'print',
    to: 'fa4-print',
  },
  {
    name: 'refresh',
    to: 'fa4-refresh',
  },
  {
    name: 'search',
    to: 'fa4-search',
  },
  {
    name: 'mars',
    to: 'fa4-mars',
  },
  {
    name: 'venus',
    to: 'fa4-venus',
  },
  {
    name: 'volume_off',
    to: 'fa4-volume-off',
  },
  {
    name: 'volume_up',
    to: 'fa4-volume-up',
  },
  /*
  {
    name: 'github',
    to: 'ion-logo-github',
  },
*/
  {
    name: 'md_close',
    to: 'ion-md-close',
  },
  {
    name: 'images',
    to: 'ion-md-images',
  },
  {
    name: 'list',
    to: 'ion-md-list',
  },
  {
    name: 'musical_notes',
    to: 'ion-md-musical-notes',
  },
  {
    name: 'star_outline',
    to: 'ion-md-star-outline',
  },
  {
    name: 'grid',
    to: 'ion-md-grid',
  },
  {
    name: 'help',
    to: 'ion-md-help',
  },
  {
    name: 'key',
    to: 'ion-md-key',
  },
  {
    name: 'menu-logs',
    component: shallowRef(IconLogs),
    color: 'primary',
  },
  {
    name: 'menu-stays',
    component: shallowRef(IconAnchor),
    color: 'primary',
    //to: 'anchor',
  },
  {
    name: 'menu-boats',
    component: shallowRef(IconSailboat),
    color: 'primary',
  },
  {
    name: 'menu-monitoring',
    component: shallowRef(IconMonitoring),
    color: 'primary',
  },
  {
    name: 'menu-grafana',
    component: shallowRef(IconGrafana),
    color: 'primary',
  },
  {
    name: 'menu-moorages',
    component: shallowRef(IconHarbor),
    color: 'primary',
  },
  {
    name: 'menu-moorages-map',
    to: 'explore',
    color: 'primary',
  },
  {
    name: 'csv',
    component: shallowRef(IconCSV),
    //color: 'primary',
  },
  {
    name: 'gpx',
    component: shallowRef(IconGPX),
    //color: 'primary',
  },
  {
    name: 'geojson',
    component: shallowRef(IconGeoJSON),
    //color: 'primary',
  },
  {
    name: 'wifi_off',
    to: 'wifi_off',
  },
  {
    name: 'menu-stats',
    to: 'query_stats',
  },
  {
    name: 'menu-faq',
    to: 'quizz',
  },
  {
    name: 'menu-privacy',
    to: 'security',
  },
  {
    name: 'menu-timelapse',
    to: 'timelapse',
  },
  {
    name: 'menu-badges',
    to: 'military_tech',
  },
  {
    name: 'menu-eventlogs',
    to: 'event',
  },
  {
    name: 'icon-battery',
    component: shallowRef(IconBattery),
    color: 'primary',
  },
  {
    name: 'icon-solar',
    component: shallowRef(IconSolar),
    color: 'primary',
  },
  {
    name: 'icon-solar2',
    component: shallowRef(IconSolar2),
    color: 'primary',
  },
  {
    name: 'icon-fuel',
    component: shallowRef(IconFuel),
    color: 'primary',
  },
  {
    name: 'icon-tank',
    component: shallowRef(IconTank),
    color: 'primary',
  },
  {
    name: 'icon-bolt',
    component: shallowRef(IconBolt),
    color: 'primary',
  },
  {
    name: 'solar_power',
    to: 'solar_power',
  },
  {
    name: 'bolt',
    to: 'bolt',
  },
  {
    name: 'electric_bolt',
    to: 'electric_bolt',
  },
  {
    name: 'electric_meter',
    to: 'electric_meter',
  },
  {
    name: 'gas_meter',
    to: 'gas_meter',
  },
  {
    name: 'icon-sunrise',
    component: shallowRef(IconSunrise),
    color: 'primary',
  },
  {
    name: 'icon-sunset',
    component: shallowRef(IconSunset),
    color: 'primary',
  },
  {
    name: 'kml',
    component: shallowRef(IconKML),
    color: 'primary',
  },
  {
    name: 'play',
    to: 'fa4-play',
  },
  {
    name: 'pause',
    to: 'fa4-pause',
  },
  {
    name: 'github2',
    to: 'fa-brands fa-github',
  },
  {
    name: 'facebook',
    to: 'fa-brands fa-facebook',
  },
  {
    name: 'instagram',
    to: 'fa-brands fa-instagram',
  },
  {
    name: 'x-twitter',
    to: 'fa-brands fa-x-twitter',
  },
  {
    name: 'slack',
    to: 'fa-brands fa-slack',
  },
  {
    name: 'help2',
    to: 'live_help',
  },
  {
    name: 'icon-mp4',
    component: shallowRef(IconMP4),
    color: 'primary',
  },
  {
    name: 'icon-png',
    component: shallowRef(IconPNG),
    color: 'primary',
  },
]
