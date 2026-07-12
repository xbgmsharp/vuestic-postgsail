// src/composables/useLogbookMetrics.js
//
// Shared metric-parsing logic pulled out of the old LogPrint.vue so every
// view that reads logbook.extra.metrics (Logbook.vue, Observations.vue)
// buckets it identically. Port any change to the bucketing rules here —
// do not re-duplicate this logic at a call site.
import { durationFormatHours, durationI18nHours } from '../../utils/dateFormatter.js'

export function formatMetricKey(key) {
  const parts = String(key).split('.')
  const meaningful = parts.slice(1).join(' ')
  return meaningful
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export function formatMetricValue(key, value) {
  const k = String(key)
  if (typeof value === 'number') {
    if (k.includes('Level')) return (value * 100).toFixed(1) + ' %'
    if (k.includes('energy_wh')) return value.toFixed(0) + ' Wh'
    return value.toFixed(2)
  }
  return String(value)
}

function isEngineRunTime(key) {
  const parts = String(key).split('.')
  return parts[0] === 'propulsion' && parts[parts.length - 1] === 'runTime'
}

function isMetadataKey(key) {
  return String(key).endsWith('.source')
}

function formatDurationHours(iso) {
  return `${durationFormatHours(iso)} ${durationI18nHours(iso)}`
}

const HANDLED_PATTERNS = [
  /^sailing\./,
  /^motoring\./,
  /^sailing_motoring\./,
  /^fuel\./,
  /^tanks\./,
  /^propulsion\./,
  /^navigation\.log$/,
]

/**
 * Derive every display-ready metric bucket from a single logbook row's
 * `extra.metrics` blob. Pure function (no reactivity) — safe to call once
 * per row when mapping an array of trips, or once for a single row.
 *
 * @param {object} row - a full logbook row (same shape as log_get's response)
 * @param {(key: string, fallback: string) => string} [t] - i18n translate fn;
 *   pass useI18n().t from the calling component. Falls back to the literal
 *   fallback string if omitted (useful for quick testing outside a component).
 */
export function deriveLogMetrics(row, t) {
  const m = row?.extra?.metrics ?? {}
  const translate = t ?? ((_key, fallback) => fallback)

  const engineHours = []
  for (const key in m) {
    const parts = key.split('.')
    if (parts[0] === 'propulsion' && parts.length === 3 && parts[2] === 'runTime') {
      engineHours.push({ name: parts[1], duration: formatDurationHours(m[key]) })
    }
  }

  let sailMotorSplit = null
  if (m['sailing.duration'] != null || m['motoring.duration'] != null) {
    const sailDist = Number(m['sailing.distance_nm'] ?? 0)
    const motorDist = Number(m['motoring.distance_nm'] ?? 0)
    const total = sailDist + motorDist || 1
    sailMotorSplit = {
      sail: {
        distance: sailDist.toFixed(1),
        duration: m['sailing.duration'] ? formatDurationHours(m['sailing.duration']) : '—',
      },
      motor: {
        distance: motorDist.toFixed(1),
        duration: m['motoring.duration'] ? formatDurationHours(m['motoring.duration']) : '—',
      },
      sailPct: (sailDist / total) * 100,
      motorPct: (motorDist / total) * 100,
    }
  }

  let fuelMetrics = null
  if (m['fuel.consumed_l'] != null || m['fuel.avg_lph'] != null || m['fuel.avg_lpnm'] != null) {
    fuelMetrics = {
      consumed: m['fuel.consumed_l'] != null ? Number(m['fuel.consumed_l']).toFixed(1) : null,
      avgLph: m['fuel.avg_lph'] != null ? Number(m['fuel.avg_lph']).toFixed(2) : null,
      avgLpnm: m['fuel.avg_lpnm'] != null ? Number(m['fuel.avg_lpnm']).toFixed(2) : null,
    }
  }

  const tankLabels = {
    fuel: translate('logs.log.tank_fuel', 'Fuel'),
    freshWater: translate('logs.log.tank_fresh_water', 'Fresh Water'),
  }
  const tankMetrics = Object.entries(m)
    .filter(([key]) => /^tanks\.\w+\.\d+\.currentLevel$/.test(key))
    .map(([key, value]) => {
      const [, type, instance] = key.match(/^tanks\.(\w+)\.(\d+)\.currentLevel$/)
      return { key, label: `${tankLabels[type] ?? type} #${instance}`, value: Number(value) * 100 }
    })

  const propulsionMetrics = Object.entries(m)
    .filter(([key]) => /^propulsion\.\w+\.revolutions\.(avg|max)$/.test(key))
    .map(([key, value]) => {
      const [, engine, stat] = key.match(/^propulsion\.(\w+)\.revolutions\.(avg|max)$/)
      const statLabel = stat === 'avg' ? translate('logs.log.avg', 'avg') : translate('logs.log.max', 'max')
      return {
        key,
        label: `${engine.charAt(0).toUpperCase()}${engine.slice(1)} RPM (${statLabel})`,
        value: `${value} rpm`,
      }
    })

  const unhandledMetrics = Object.entries(m)
    .filter(([key]) => !isMetadataKey(key) && !isEngineRunTime(key) && !HANDLED_PATTERNS.some((p) => p.test(key)))
    .map(([key, value]) => ({ key, value }))

  const navigationLog = m['navigation.log'] != null ? formatMetricValue('navigation.log', m['navigation.log']) : null

  return {
    engineHours,
    sailMotorSplit,
    fuelMetrics,
    tankMetrics,
    propulsionMetrics,
    unhandledMetrics,
    navigationLog,
    hasAnyMetrics: engineHours.length > 0 || Object.keys(m).length > 0,
  }
}
