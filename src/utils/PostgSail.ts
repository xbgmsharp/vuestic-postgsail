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
  Helmsman: { image: '/helmsman.png', description: t('badges.Helmsman') },
  'Wake Maker': { image: '/wake_maker.png', description: t('badges.Wake Maker') },
  Explorer: { image: '/explorer.png', description: t('badges.Explorer') },
  'Mooring Pro': { image: '/mooring_pro.png', description: t('badges.Mooring Pro') },
  Anchormaster: { image: '/anchormaster.png', description: t('badges.Anchormaster') },
  Traveler: { image: '/traveler.png', description: t('badges.Traveler') },
  Stormtrooper: { image: '/storm_trooper.png', description: t('badges.Stormtrooper') },
  'Club Alaska': { image: '/club_alaska.png', description: t('badges.Club Alaska') },
  'Tropical Traveler': { image: '/tropical_traveler.png', description: t('badges.Tropical Traveler') },
  'Navigator Award': { svg: true, description: t('badges.Navigator Award') },
  'Captain Award': { svg: true, description: t('badges.Captain Award') },
}

export async function userBadges(payload: undefined | any) {
  const default_badge = { default: { svg: false, description: t('badges.default') } }
  const user_badges = payload || {}
  for (const key in badges) {
    //console.log(key, badges[key])
    if (key in user_badges && 'date' in user_badges[key]) {
      user_badges[key] = { ...user_badges[key], ...badges[key] }
      user_badges[key]['disabled'] = false
      user_badges[key]['date'] = dateFormatUTC(user_badges[key]['date'])
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
    text: 'Unknown',
  },
  {
    value: 2,
    text: 'Anchor',
  },
  {
    value: 3,
    text: 'Mooring Buoy',
  },
  {
    value: 4,
    text: 'Dock',
  },
]

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
    text: 'Glassy calm (0m)',
  },
  {
    value: 1,
    text: 'Rippled calm (0-0.1m)',
  },
  {
    value: 2,
    text: 'Smooth (0.1-0.5m)',
  },
  {
    value: 3,
    text: 'Slight (0.5-1.25m)',
  },
  {
    value: 4,
    text: 'Moderate (1.25-2.5m)',
  },
  {
    value: 5,
    text: 'Rough (2.5-4m)',
  },
  {
    value: 6,
    text: 'Very rough (4-6m)',
  },
  {
    value: 7,
    text: 'High (6-9m)',
  },
  {
    value: 8,
    text: 'Very high (9-14m)',
  },
  {
    value: 9,
    text: 'Phenomenal (14m+)',
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
    text: 'Dense fog (<45m)',
  },
  {
    value: 1,
    text: 'Thick fog (<180m)',
  },
  {
    value: 2,
    text: 'Fog (<360m)',
  },
  {
    value: 3,
    text: 'Moderate fog (<0.5NM)',
  },
  {
    value: 4,
    text: 'Thin fog (<1NM)',
  },
  {
    value: 5,
    text: 'Poor visibility (<2NM)',
  },
  {
    value: 6,
    text: 'Moderate visibility (<5NM)',
  },
  {
    value: 7,
    text: 'Good visibility (<10NM)',
  },
  {
    value: 8,
    text: 'Very good visibility (<30NM)',
  },
  {
    value: 9,
    text: 'Excellent visibility (>30NM)',
  },
]
