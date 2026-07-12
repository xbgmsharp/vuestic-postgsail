<!-- prettier-ignore -->
<template>
  <VaCard>
    <VaCardTitle class="flex justify-between items-center">
      <h1 class="card-title text-secondary font-bold uppercase">{{ t('timeline.timeline') }}</h1>
      <h2 class="text-sm text-secondary">{{ t('timeline.last') }}</h2>
    </VaCardTitle>

    <VaCardContent>
      <VaInnerLoading :loading="isBusy">
        <div v-if="apiError" class="text-danger p-4">
          {{ t('common.error_loading') }}
        </div>

        <div v-else-if="!groupedItems.length" class="text-center text-secondary py-8">
          {{ t('timeline.empty') }}
        </div>

        <div v-else class="flex flex-col gap-4">
          <div v-for="group in groupedItems" :key="group.key">
            <h3 class="text-xs uppercase tracking-wide text-secondary font-semibold px-1 pb-2">
              {{ group.label }}
            </h3>

            <div class="rounded-lg shadow-lg overflow-hidden border" style="border-color: var(--va-background-border)">
              <template v-for="entry in group.items" :key="entry.id">
                <!-- Multi-link entries (currently just weekly_summary) -->
                <div
v-if="entry.links" class="flex items-start gap-3 p-3 border-t first:border-t-0"
                  style="border-color: var(--va-background-border)">
                  <span
class="flex-none w-9 h-9 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: entry.tone.bg, color: entry.tone.fg }">
                    <va-icon :name="entry.icon" size="18px" />
                  </span>

                  <span class="flex-1 min-w-0">
                    <span class="block text-sm" style="color: var(--va-text-primary)">{{ entry.message }}</span>
                    <span class="block text-xs mt-0.5" style="color: var(--va-text-secondary)">{{ entry.timeLabel
                      }}</span>
                  </span>

                  <span class="flex-none flex items-center gap-1">
                    <component
:is="link.linkType === 'external' ? 'a' : 'router-link'" v-for="(link, i) in entry.links"
                      :key="i" :to="link.linkType === 'internal' ? link.to : undefined"
                      :href="link.linkType === 'external' ? link.to : undefined"
                      :target="link.linkType === 'external' ? '_blank' : undefined" :title="link.label"
                      :aria-label="link.label" class="entry-action no-underline">
                      <va-icon :name="link.icon" :size="24" style=" cursor: pointer" />
                    </component>
                  </span>
                </div>

                <!-- Single-link entries (everything else, unchanged) -->
                <component
:is="entry.linkType === 'internal' ? 'router-link' : entry.linkType === 'external' ? 'a' : 'div'"
                  v-else
                  :to="entry.linkType === 'internal' ? entry.to : undefined"
                  :href="entry.linkType === 'external' ? entry.to : undefined"
                  :target="entry.linkType === 'external' ? '_blank' : undefined"
                  class="flex items-start gap-3 p-3 border-t first:border-t-0 no-underline"
                  style="border-color: var(--va-background-border); color: inherit; cursor: pointer">
                  <span
class="flex-none w-9 h-9 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: entry.tone.bg, color: entry.tone.fg }">
                    <va-icon :name="entry.icon" size="18px" />
                  </span>

                  <span class="flex-1 min-w-0">
                    <span class="block text-sm" style="color: var(--va-text-primary)">{{ entry.message }}</span>
                    <span class="block text-xs mt-0.5" style="color: var(--va-text-secondary)">{{ entry.timeLabel
                      }}</span>
                  </span>

                  <va-icon
v-if="entry.linkType" name="chevron_right" size="16px"
                    style="color: var(--va-background-border); align-self: center; cursor: pointer" />
                </component>
              </template>
            </div>
          </div>
        </div>
      </VaInnerLoading>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import { fromNow, dateFormatUTC } from '../../utils/dateFormatter.js'
  import { useVesselStore } from '../../stores/vessel-store'

  const { t } = useI18n()
  const vesselStore = useVesselStore()

  const isBusy = ref(false)
  const apiError = ref(null)
  const rowsData = ref([])
  const grafana_url = ref(import.meta.env.VITE_GRAFANA_URL)

  const messages = computed(() => ({
    new_account: t('timeline.new_account'),
    email_otp: t('timeline.email_otp'),
    new_vessel: t('timeline.new_vessel'),
    grafana: t('timeline.grafana'),
    monitoring_offline: t('timeline.monitoring_offline'),
    monitoring_online: t('timeline.monitoring_online'),
    monitoring_no_metrics: t('timeline.monitoring_no_metrics'),
    new_logbook: t('timeline.new_logbook'),
    new_moorage: t('timeline.new_moorage'),
    maplapse_video: t('timeline.maplapse_video'),
    new_video: t('timeline.new_video'),
    autodiscovery: t('timeline.autodiscovery'),
  }))

  // Tone palette — mirrors the notifications page's alert/online/voyage/neutral system,
  // expressed as Vuestic CSS vars per project theming convention (no Tailwind color utilities).
  const TONES = {
    alert: { bg: 'var(--va-danger)', fg: '#fff' },
    warning: { bg: 'var(--va-warning)', fg: 'rgba(0,0,0,.87)' },
    online: { bg: 'var(--va-success)', fg: '#fff' },
    voyage: { bg: 'var(--va-primary)', fg: '#fff' },
    neutral: { bg: 'var(--va-background-element)', fg: 'var(--va-text-secondary)' },
  }

  // Single source of truth per channel: icon, tone, and how it links out.
  // Replaces the old 13-branch v-if/else-if chain — add a new channel here only.
  function channelMeta(row) {
    switch (row.channel) {
      case 'new_account':
        return { icon: 'person_add', tone: TONES.neutral, linkType: 'internal', to: { name: 'profile' } }
      case 'new_vessel':
        return { icon: 'directions_boat', tone: TONES.voyage, linkType: 'internal', to: { name: 'boats' } }
      case 'autodiscovery':
        return { icon: 'travel_explore', tone: TONES.voyage, linkType: 'internal', to: { name: 'boats' } }
      case 'grafana':
        return { icon: 'insights', tone: TONES.voyage, linkType: 'external', to: grafana_url.value }
      case 'new_logbook':
        return {
          icon: 'menu_book',
          tone: TONES.voyage,
          linkType: 'internal',
          to: { name: 'log-map', params: { id: row.payload } },
        }
      case 'new_moorage':
        return {
          icon: 'anchor',
          tone: TONES.voyage,
          linkType: 'internal',
          to: { name: 'moorage-details', params: { id: row.payload } },
        }
      case 'maplapse_video':
        return {
          icon: 'movie',
          tone: TONES.neutral,
          linkType: 'external',
          to: '/maplapse' + row.payload.substring(row.payload.indexOf('?')),
        }
      case 'new_video':
        return {
          icon: 'videocam',
          tone: TONES.neutral,
          linkType: 'external',
          to: 'https://videos.openplotter.cloud/' + row.payload,
        }
      case 'monitoring_offline':
        return { icon: 'wifi_off', tone: TONES.alert, linkType: 'internal', to: '/monitoring' }
      case 'monitoring_online':
        return { icon: 'wifi', tone: TONES.online, linkType: 'internal', to: '/monitoring' }
      case 'monitoring_no_metrics':
        return { icon: 'sensors_off', tone: TONES.warning, linkType: 'internal', to: '/monitoring' }
      case 'weekly_summary':
        return {
          icon: 'calendar_month',
          tone: TONES.neutral,
          linkType: null,
          to: null,
          // Two destinations instead of one — both routes accept either
          // start_date/end_date or start_log/end_log, so pass all four to be safe
          // regardless of which query shape each page currently reads.
          links: [
            {
              icon: 'menu_book',
              label: t('timeline.view_logbook'),
              linkType: 'internal',
              to: {
                name: 'logslapse',
                query: {
                  start_date: row.startDate,
                  end_date: row.endDate,
                },
              },
            },
            {
              icon: 'insights',
              label: t('timeline.view_stats'),
              linkType: 'internal',
              to: {
                name: 'stats',
                query: {
                  start_date: row.startDate,
                  end_date: row.endDate,
                },
              },
            },
          ],
        }
      default:
        return { icon: 'notifications', tone: TONES.neutral, linkType: null, to: null }
    }
  }

  // -- Weekly summary: never present in eventlogs(), synthesized client-side. --
  // Matches the digest job's actual window: [most-recent-Monday - 7d, most-recent-Monday],
  // not a calendar Mon-Sun week (confirmed against the notifications page example:
  // a Mon 6 Jul digest links start_date=2026-06-29, end_date=2026-07-06 — 7 days back
  // from that same Monday, not the preceding Sunday).
  function toISODate(d) {
    return d.toISOString().slice(0, 10)
  }

  // Safety cap so a very old account doesn't generate hundreds of synthetic rows
  // in one pass (5 years). Raise if you want the full backlog rendered at once.
  const MAX_WEEKLY_SUMMARIES = 260

  function mondayOf(date) {
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const daysSinceMonday = (utc.getUTCDay() + 6) % 7
    utc.setUTCDate(utc.getUTCDate() - daysSinceMonday)
    return utc
  }

  // One entry per completed week, from the earliest event we know about up through
  // the most recent Monday — but ONLY for weeks that actually had logbook activity.
  // `earliestDate` should be the account's first real activity. `logbookDates` is the
  // set of `new_logbook` event timestamps already loaded from eventlogs(); a week with
  // none of them gets no synthetic entry at all (nothing to summarize).
  function weeklySummaryEntries(earliestDate, logbookDates) {
    const mostRecentMonday = mondayOf(new Date())
    const firstMonday = earliestDate ? mondayOf(earliestDate) : mostRecentMonday
    const boatName = vesselStore?.name || vesselStore?.vessel?.name || ''

    const entries = []
    const cursor = new Date(firstMonday)
    let weeksChecked = 0
    while (cursor <= mostRecentMonday && weeksChecked < MAX_WEEKLY_SUMMARIES) {
      const start = new Date(cursor)
      start.setUTCDate(cursor.getUTCDate() - 7)
      // Exclusive upper bound covering the full end-day (cursor is a UTC midnight).
      const endBoundary = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)

      const hasActivity = logbookDates.some((d) => d >= start && d < endBoundary)
      if (hasActivity) {
        const startDate = toISODate(start)
        const endDate = toISODate(cursor)
        entries.push({
          id: `weekly-summary-${startDate}`,
          channel: 'weekly_summary',
          processed: cursor.toISOString(),
          startDate,
          endDate,
          message: t('timeline.weekly_summary', { boat: boatName, start: startDate, end: endDate }),
        })
      }

      cursor.setUTCDate(cursor.getUTCDate() + 7)
      weeksChecked++
    }
    return entries
  }

  // -- Day-of-week label, same Today/Yesterday convention as the notifications page. --
  function dayLabel(dateStr) {
    const d = new Date(dateStr)
    const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
    const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000)
    if (diffDays === 0) return t('timeline.today')
    if (diffDays === 1) return t('timeline.yesterday')
    return new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).format(d)
  }

  const items = computed(() => {
    const apiItems = Array.isArray(rowsData.value)
      ? rowsData.value.map((row) => {
          const meta = channelMeta(row)
          return {
            id: row['id'],
            channel: row['channel'],
            processed: row['processed'],
            timeLabel: row['processed']
              ? `${fromNow(row['processed'])} · ${dateFormatUTC(row['processed'])}`
              : 'Pending',
            message:
              row['channel'] && messages.value[row['channel']] ? messages.value[row['channel']] : t('timeline.unknown'),
            ...meta,
          }
        })
      : []

    // Anchor the weekly-summary backfill to the oldest event we actually have —
    // prefer the account-creation event if present (most accurate "since when"),
    // otherwise fall back to the oldest row of any kind.
    const datedRows = apiItems.filter((row) => row.processed)
    const accountCreated = datedRows.find((row) => row.channel === 'new_account')
    const oldestRow = datedRows.reduce(
      (oldest, row) => (!oldest || new Date(row.processed) < new Date(oldest.processed) ? row : oldest),
      null,
    )
    const earliestDate = accountCreated
      ? new Date(accountCreated.processed)
      : oldestRow
      ? new Date(oldestRow.processed)
      : null

    // Only "new_logbook" events count as loggable activity for a weekly summary —
    // a monitoring blip or a signup event in a given week isn't something to summarize.
    const logbookDates = datedRows.filter((row) => row.channel === 'new_logbook').map((row) => new Date(row.processed))

    const synthetic = weeklySummaryEntries(earliestDate, logbookDates).map((row) => {
      const meta = channelMeta(row)
      return {
        id: row.id,
        processed: row.processed,
        timeLabel: dateFormatUTC(row.processed),
        message: row.message,
        ...meta,
      }
    })

    return [...apiItems, ...synthetic].sort((a, b) => new Date(b.processed) - new Date(a.processed))
  })

  // Group already-sorted items into day buckets for the card headers.
  const groupedItems = computed(() => {
    const groups = []
    let current = null
    for (const entry of items.value) {
      const key = entry.processed ? new Date(entry.processed).toDateString() : 'pending'
      if (!current || current.key !== key) {
        current = { key, label: entry.processed ? dayLabel(entry.processed) : t('timeline.pending'), items: [] }
        groups.push(current)
      }
      current.items.push(entry)
    }
    return groups
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.eventlogs()
      if (Array.isArray(response)) {
        rowsData.value = response
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      console.error('EventLog: failed to load eventlogs', e)
    } finally {
      isBusy.value = false
    }
  })
</script>

<style scoped>
  .entry-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: var(--va-text-secondary);
    background-color: var(--va-background-element);
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .entry-action:hover {
    background-color: var(--va-primary);
    color: #fff;
  }
</style>
