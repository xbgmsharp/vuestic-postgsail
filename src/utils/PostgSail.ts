/*
 * Definitions
 * TODO translations
 */

import i18n from '../i18n/index'
const { t } = i18n.global
import { dateFormatUTC } from './dateFormatter'

/*
 * Badges definition
 */
export const badges: { [key: string]: any } = {
  // --- Milestones ---
  'Proud Owner': { icon: 'fa-medal', description: t('badges.Proud Owner'), category: 'Milestones' },
  'Fleet Commander': { icon: 'fa-trophy', description: t('badges.Fleet Commander'), category: 'Milestones' },
  'Social Beacon': { icon: 'fa-people-group', description: t('badges.Social Beacon'), category: 'Milestones' },
  'AI Co-Pilot': { icon: 'fa-robot', description: t('badges.AI Co-Pilot'), category: 'Milestones' },
  Helmsman: { image: '/helmsman.png', description: t('badges.Helmsman'), category: 'Milestones' },
  Sponsor: { icon: 'fa-star', description: t('badges.Sponsor'), category: 'Milestones' },
  // --- Seamanship ---
  'Wake Maker': { image: '/wake_maker.png', description: t('badges.Wake Maker'), category: 'Seamanship' },
  Explorer: { image: '/explorer.png', description: t('badges.Explorer'), category: 'Seamanship' },
  'Mooring Pro': { image: '/mooring_pro.png', description: t('badges.Mooring Pro'), category: 'Seamanship' },
  Anchormaster: { image: '/anchormaster.png', description: t('badges.Anchormaster'), category: 'Seamanship' },
  Stormtrooper: { icon: 'fa-cloud-bolt', description: t('badges.Stormtrooper'), category: 'Seamanship' },
  'Navigator Award': { svg: true, description: t('badges.Navigator Award'), category: 'Seamanship' },
  'Captain Award': { svg: true, description: t('badges.Captain Award'), category: 'Seamanship' },
  'Speed Demon': { svg: true, description: t('badges.Speed Demon'), category: 'Seamanship' },
  'Night Owl': { svg: true, description: t('badges.Night Owl'), category: 'Seamanship' },
  // --- World & Regions ---
  Traveler: { image: '/traveler.png', description: t('badges.Traveler'), category: 'World & Regions' },
  'Club Alaska': { image: '/club_alaska.png', description: t('badges.Club Alaska'), category: 'World & Regions' },
  'Tropical Traveler': {
    image: '/tropical_traveler.png',
    description: t('badges.Tropical Traveler'),
    category: 'World & Regions',
  },
}

export async function userBadges(payload: undefined | any) {
  const default_badge = {
    default: { icon: false, svg: false, description: t('badges.default'), category: 'World & Regions' },
  }
  const user_badges = payload || {}
  for (const key in badges) {
    //console.log(key, badges[key])
    if (key in user_badges && 'date' in user_badges[key]) {
      user_badges[key] = { ...user_badges[key], ...badges[key] }
      user_badges[key]['disabled'] = false
      user_badges[key]['date'] = dateFormatUTC(user_badges[key]['date'])
      user_badges[key]['rawDate'] = user_badges[key]['date']
    } else {
      if (key in badges) {
        user_badges[key] = badges[key]
        user_badges[key]['disabled'] = true
      }
    }
  }
  for (const key in user_badges) {
    if (!(key in badges)) {
      user_badges[key] = { ...user_badges[key], ...default_badge['default'] }
      user_badges[key]['description'] = `${default_badge['default']['description']} ${key}!`
      user_badges[key]['disabled'] = false
      user_badges[key]['date'] = dateFormatUTC(user_badges[key]['date'])
      user_badges[key]['rawDate'] = user_badges[key]['date']
      user_badges[key]['i18n'] = false
    }
  }
  return user_badges
}

/*
 * stayed_at options definition
 */
export const stayed_at_options = [
  {
    value: 1,
    text: t('id.stay_code.1'),
    icon: 'fa-circle-question',
  },
  {
    value: 2,
    text: t('id.stay_code.2'),
    icon: 'fa-anchor',
  },
  {
    value: 3,
    text: t('id.stay_code.3'),
    icon: 'fa-circle-dot',
    desc: 'A mooring buoy or ball you tie up to — not a berth in a marina.',
  },
  {
    value: 4,
    text: t('id.stay_code.4'),
    icon: 'fa-bridge-water',
  },
]

interface CustomStayTypeRow {
  stay_code: number
  description: string
  parent_code: number | null
}

export interface StayTypeOption {
  value: number
  text: string
  icon: string
  desc?: string
  isCustom: boolean
  parentCode?: number | null
}

/*
 * Merge the built-in stay type options (translated, with icon/desc) with a
 * vessel's custom stay types (rows from api.stays_at where vessel_id IS NOT
 * NULL). One canonical, already-translated list — reusable anywhere stay
 * types are listed: this settings tab, and any moorage/stay type picker
 * elsewhere in the app.
 *
 * The `= []` default on an untyped parameter is what was inferring `never`
 * before — the explicit `CustomStayTypeRow[]` annotation fixes that.
 */
export function getStayTypeOptions(customStayTypes: CustomStayTypeRow[] = []): StayTypeOption[] {
  const builtIn: StayTypeOption[] = stayed_at_options.map((opt) => ({ ...opt, isCustom: false }))
  const custom: StayTypeOption[] = customStayTypes.map((row) => ({
    value: row.stay_code,
    text: row.description,
    icon: '', // user-defined types have no built-in icon
    isCustom: true,
    parentCode: row.parent_code,
  }))
  return [...builtIn, ...custom]
}

/*
 * seaState options definition
 */
export const seaState = [
  {
    value: -1,
    text: '',
  },
  {
    value: 0,
    text: t('seaState.0'),
  },
  {
    value: 1,
    text: t('seaState.1'),
  },
  {
    value: 2,
    text: t('seaState.2'),
  },
  {
    value: 3,
    text: t('seaState.3'),
  },
  {
    value: 4,
    text: t('seaState.4'),
  },
  {
    value: 5,
    text: t('seaState.5'),
  },
  {
    value: 6,
    text: t('seaState.6'),
  },
  {
    value: 7,
    text: t('seaState.7'),
  },
  {
    value: 8,
    text: t('seaState.8'),
  },
  {
    value: 9,
    text: t('seaState.9'),
  },
]

/*
 * visibility options definition
 */
export const visibility = [
  {
    value: -1,
    text: '',
  },
  {
    value: 0,
    text: t('visibility.0'),
  },
  {
    value: 1,
    text: t('visibility.1'),
  },
  {
    value: 2,
    text: t('visibility.2'),
  },
  {
    value: 3,
    text: t('visibility.3'),
  },
  {
    value: 4,
    text: t('visibility.4'),
  },
  {
    value: 5,
    text: t('visibility.5'),
  },
  {
    value: 6,
    text: t('visibility.6'),
  },
  {
    value: 7,
    text: t('visibility.7'),
  },
  {
    value: 8,
    text: t('visibility.8'),
  },
  {
    value: 9,
    text: t('visibility.9'),
  },
]

/*
 * WMO weather interpretation code descriptions (& images)
 * https://gist.github.com/stellasphere/9490c195ed2b53c707087c8c2db4ec0c
 */
export const getWMOData = () => {
  return {
    0: {
      day: {
        description: t('weather.sunny'),
        image: 'https://openweathermap.org/img/wn/01d@2x.png',
      },
      night: {
        description: t('weather.clear', 'Clear'),
        image: 'https://openweathermap.org/img/wn/01n@2x.png',
      },
    },
    1: {
      day: {
        description: t('weather.mainly_sunny', 'Mainly Sunny'),
        image: 'https://openweathermap.org/img/wn/01d@2x.png',
      },
      night: {
        description: t('weather.mainly_clear', 'Mainly Clear'),
        image: 'https://openweathermap.org/img/wn/01n@2x.png',
      },
    },
    2: {
      day: {
        description: t('weather.partly_cloudy', 'Partly Cloudy'),
        image: 'https://openweathermap.org/img/wn/02d@2x.png',
      },
      night: {
        description: t('weather.partly_cloudy', 'Partly Cloudy'),
        image: 'https://openweathermap.org/img/wn/02n@2x.png',
      },
    },
    3: {
      day: {
        description: t('weather.cloudy', 'Cloudy'),
        image: 'https://openweathermap.org/img/wn/03d@2x.png',
      },
      night: {
        description: t('weather.cloudy', 'Cloudy'),
        image: 'https://openweathermap.org/img/wn/03n@2x.png',
      },
    },
    45: {
      day: {
        description: t('weather.foggy', 'Foggy'),
        image: 'https://openweathermap.org/img/wn/50d@2x.png',
      },
      night: {
        description: t('weather.foggy', 'Foggy'),
        image: 'https://openweathermap.org/img/wn/50n@2x.png',
      },
    },
    48: {
      day: {
        description: t('weather.rime_fog', 'Rime Fog'),
        image: 'https://openweathermap.org/img/wn/50d@2x.png',
      },
      night: {
        description: t('weather.rime_fog', 'Rime Fog'),
        image: 'https://openweathermap.org/img/wn/50n@2x.png',
      },
    },
    51: {
      day: {
        description: t('weather.light_drizzle', 'Light Drizzle'),
        image: 'https://openweathermap.org/img/wn/09d@2x.png',
      },
      night: {
        description: t('weather.light_drizzle', 'Light Drizzle'),
        image: 'https://openweathermap.org/img/wn/09n@2x.png',
      },
    },
    53: {
      day: {
        description: t('weather.drizzle', 'Drizzle'),
        image: 'https://openweathermap.org/img/wn/09d@2x.png',
      },
      night: {
        description: t('weather.drizzle', 'Drizzle'),
        image: 'https://openweathermap.org/img/wn/09n@2x.png',
      },
    },
    55: {
      day: {
        description: t('weather.heavy_drizzle', 'Heavy Drizzle'),
        image: 'https://openweathermap.org/img/wn/09d@2x.png',
      },
      night: {
        description: t('weather.heavy_drizzle', 'Heavy Drizzle'),
        image: 'https://openweathermap.org/img/wn/09n@2x.png',
      },
    },
    56: {
      day: {
        description: t('weather.light_freezing_drizzle', 'Light Freezing Drizzle'),
        image: 'https://openweathermap.org/img/wn/09d@2x.png',
      },
      night: {
        description: t('weather.light_freezing_drizzle', 'Light Freezing Drizzle'),
        image: 'https://openweathermap.org/img/wn/09n@2x.png',
      },
    },
    57: {
      day: {
        description: t('weather.freezing_drizzle', 'Freezing Drizzle'),
        image: 'https://openweathermap.org/img/wn/09d@2x.png',
      },
      night: {
        description: t('weather.freezing_drizzle', 'Freezing Drizzle'),
        image: 'https://openweathermap.org/img/wn/09n@2x.png',
      },
    },
    61: {
      day: {
        description: t('weather.light_rain', 'Light Rain'),
        image: 'https://openweathermap.org/img/wn/10d@2x.png',
      },
      night: {
        description: t('weather.light_rain', 'Light Rain'),
        image: 'https://openweathermap.org/img/wn/10n@2x.png',
      },
    },
    63: {
      day: {
        description: t('weather.rain', 'Rain'),
        image: 'https://openweathermap.org/img/wn/10d@2x.png',
      },
      night: {
        description: t('weather.rain', 'Rain'),
        image: 'https://openweathermap.org/img/wn/10n@2x.png',
      },
    },
    65: {
      day: {
        description: t('weather.heavy_rain', 'Heavy Rain'),
        image: 'https://openweathermap.org/img/wn/10d@2x.png',
      },
      night: {
        description: t('weather.heavy_rain', 'Heavy Rain'),
        image: 'https://openweathermap.org/img/wn/10n@2x.png',
      },
    },
    66: {
      day: {
        description: t('weather.light_freezing_rain', 'Light Freezing Rain'),
        image: 'https://openweathermap.org/img/wn/10d@2x.png',
      },
      night: {
        description: t('weather.light_freezing_rain', 'Light Freezing Rain'),
        image: 'https://openweathermap.org/img/wn/10n@2x.png',
      },
    },
    67: {
      day: {
        description: t('weather.freezing_rain', 'Freezing Rain'),
        image: 'https://openweathermap.org/img/wn/10d@2x.png',
      },
      night: {
        description: t('weather.freezing_rain', 'Freezing Rain'),
        image: 'https://openweathermap.org/img/wn/10n@2x.png',
      },
    },
    71: {
      day: {
        description: t('weather.light_snow', 'Light Snow'),
        image: 'https://openweathermap.org/img/wn/13d@2x.png',
      },
      night: {
        description: t('weather.light_snow', 'Light Snow'),
        image: 'https://openweathermap.org/img/wn/13n@2x.png',
      },
    },
    73: {
      day: {
        description: t('weather.snow', 'Snow'),
        image: 'https://openweathermap.org/img/wn/13d@2x.png',
      },
      night: {
        description: t('weather.snow', 'Snow'),
        image: 'https://openweathermap.org/img/wn/13n@2x.png',
      },
    },
    75: {
      day: {
        description: t('weather.heavy_snow', 'Heavy Snow'),
        image: 'https://openweathermap.org/img/wn/13d@2x.png',
      },
      night: {
        description: t('weather.heavy_snow', 'Heavy Snow'),
        image: 'https://openweathermap.org/img/wn/13n@2x.png',
      },
    },
    77: {
      day: {
        description: t('weather.snow_grains', 'Snow Grains'),
        image: 'https://openweathermap.org/img/wn/13d@2x.png',
      },
      night: {
        description: t('weather.snow_grains', 'Snow Grains'),
        image: 'https://openweathermap.org/img/wn/13n@2x.png',
      },
    },
    80: {
      day: {
        description: t('weather.light_showers', 'Light Showers'),
        image: 'https://openweathermap.org/img/wn/09d@2x.png',
      },
      night: {
        description: t('weather.light_showers', 'Light Showers'),
        image: 'https://openweathermap.org/img/wn/09n@2x.png',
      },
    },
    81: {
      day: {
        description: t('weather.showers', 'Showers'),
        image: 'https://openweathermap.org/img/wn/09d@2x.png',
      },
      night: {
        description: t('weather.showers', 'Showers'),
        image: 'https://openweathermap.org/img/wn/09n@2x.png',
      },
    },
    82: {
      day: {
        description: t('weather.heavy_showers', 'Heavy Showers'),
        image: 'https://openweathermap.org/img/wn/09d@2x.png',
      },
      night: {
        description: t('weather.heavy_showers', 'Heavy Showers'),
        image: 'https://openweathermap.org/img/wn/09n@2x.png',
      },
    },
    85: {
      day: {
        description: t('weather.light_snow_showers', 'Light Snow Showers'),
        image: 'https://openweathermap.org/img/wn/13d@2x.png',
      },
      night: {
        description: t('weather.light_snow_showers', 'Light Snow Showers'),
        image: 'https://openweathermap.org/img/wn/13n@2x.png',
      },
    },
    86: {
      day: {
        description: t('weather.snow_showers', 'Snow Showers'),
        image: 'https://openweathermap.org/img/wn/13d@2x.png',
      },
      night: {
        description: t('weather.snow_showers', 'Snow Showers'),
        image: 'https://openweathermap.org/img/wn/13n@2x.png',
      },
    },
    95: {
      day: {
        description: t('weather.thunderstorm', 'Thunderstorm'),
        image: 'https://openweathermap.org/img/wn/11d@2x.png',
      },
      night: {
        description: t('weather.thunderstorm', 'Thunderstorm'),
        image: 'https://openweathermap.org/img/wn/11n@2x.png',
      },
    },
    96: {
      day: {
        description: t('weather.light_thunderstorms_with_hail', 'Light Thunderstorms With Hail'),
        image: 'https://openweathermap.org/img/wn/11d@2x.png',
      },
      night: {
        description: t('weather.light_thunderstorms_with_hail', 'Light Thunderstorms With Hail'),
        image: 'https://openweathermap.org/img/wn/11n@2x.png',
      },
    },
    99: {
      day: {
        description: t('weather.thunderstorm_with_hail', 'Thunderstorm With Hail'),
        image: 'https://openweathermap.org/img/wn/11d@2x.png',
      },
      night: {
        description: t('weather.thunderstorm_with_hail', 'Thunderstorm With Hail'),
        image: 'https://openweathermap.org/img/wn/11n@2x.png',
      },
    },
  }
}

export const moonPhases = [
  'New',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
]
