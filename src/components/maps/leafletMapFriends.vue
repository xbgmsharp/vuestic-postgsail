<template>
  <div class="leaflet-maps-page">
    <va-card class="leaflet-maps-page__widget">
      <div id="sidepanel" class="sidepanel" aria-label="side panel" aria-hidden="false">
        <div class="sidepanel-inner-wrapper">
          <nav class="sidepanel-tabs-wrapper" aria-label="sidepanel tab navigation">
            <ul class="sidepanel-tabs">
              <li class="sidepanel-tab">
                <a href="#friends" class="sidebar-tab-link" role="tab" data-tab-link="tab-friends1">
                  {{ title }}
                </a>
              </li>
            </ul>
          </nav>
          <div class="sidepanel-content-wrapper">
            <div class="sidepanel-content">
              <div class="sidepanel-tab-content" data-tab-content="tab-friends1">
                <div v-if="!friendsList.length" class="sidepanel-empty">
                  {{ t('friends.empty') }}
                </div>
                <ol v-else>
                  <li v-for="(friend, idx) in friendsList" :key="friend.id">
                    {{ idx + 1 }}.
                    <a
                      v-if="friend.longitude != null && friend.latitude != null"
                      class="va-link"
                      @click="navigateFriend(friend)"
                    >
                      {{ friend.label || friend.mmsi }}
                    </a>
                    <span v-else class="va-text-secondary">
                      {{ friend.label || friend.mmsi }} ({{ t('friends.map.no_position') }})
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div class="sidepanel-toggle-container">
          <button class="sidepanel-toggle-button" type="button" aria-label="toggle side panel"></button>
        </div>
      </div>
      <div
        ref="mapContainer"
        style="width: 100%; height: 100%; position: absolute; left: 0; right: 0; top: 0; bottom: 0"
        class="leaflet-map h-full"
      />
    </va-card>
  </div>
</template>

<script setup>
  // Modeled on leafletMapMoorages.vue, with one deliberate deviation:
  // this component takes `friends` as a prop (already fetched by the parent
  // via useFriends()/TanStack Query) instead of self-fetching via
  // api.moorages_export_geojson()-style calls — avoids a duplicate network
  // request since Friends.vue already holds this data for the list view.
  import 'leaflet/dist/leaflet.css'
  import 'leaflet.sidepanel/dist/leaflet.sidepanel.css'
  import L from 'leaflet'
  import 'leaflet.sidepanel'

  import { defaultBaseMapType, baseMaps, overlayMaps } from './leafletHelpers.js'

  import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { dateFormatUTC, durationFormatHours } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'

  import { useGlobalStore } from '../../stores/global-store'
  import { useVesselStore } from '../../stores/vessel-store'
  import { storeToRefs } from 'pinia'

  const { t } = useI18n()
  const GlobalStore = useGlobalStore()
  const { currentTheme, isSidebarMinimized } = storeToRefs(GlobalStore)
  const { vesselName } = useVesselStore()

  const props = defineProps({
    friends: {
      type: Array,
      default: () => [],
    },
    mapZoom: {
      type: Number,
      default: 4,
    },
    controlLayer: {
      type: Boolean,
      default: true,
    },
    mapType: {
      type: String,
      default: defaultBaseMapType(),
    },
  })

  const emit = defineEmits(['manage', 'add-friend', 'view-list'])

  const mapContainer = ref()
  const map = ref()
  const markersMap = ref({})

  const title = t('friends.map.sidepanel_title') + ' ' + vesselName

  const friendsList = computed(() =>
    [...(props.friends ?? [])].sort((a, b) => (a.label || String(a.mmsi)).localeCompare(b.label || String(b.mmsi))),
  )

  const friendsGeoJson = computed(() => ({
    type: 'FeatureCollection',
    features: friendsList.value
      .filter((f) => f.longitude != null && f.latitude != null)
      .map((f) => ({
        type: 'Feature',
        properties: {
          id: f.id,
          mmsi: f.mmsi,
          label: f.label || String(f.mmsi),
          status: f.status,
          distance_nm: f.distance_nm,
          last_contact: f.position_time,
        },
        geometry: { type: 'Point', coordinates: [f.longitude, f.latitude] },
      })),
  }))

  const addMarker = (coords, layer) => {
    const [lon, lat] = coords
    markersMap.value[`[${lon},${lat}]`] = layer
  }

  const openPopupMarker = (coords) => {
    const [lon, lat] = coords
    markersMap.value[`[${lon},${lat}]`]?.fire('click')
  }

  let geoLayer = null

  const renderMarkers = () => {
    if (!map.value) return
    if (geoLayer) {
      map.value.removeLayer(geoLayer)
      geoLayer = null
    }
    markersMap.value = {}

    const geojson = friendsGeoJson.value
    if (!geojson.features.length) return

    // Status-colored dot marker — avoids depending on a dedicated boat icon
    // asset that doesn't exist yet. Swap for a real icon file later if one
    // gets added (see NOTE in integration notes).
    const markerIcon = (feature) =>
      L.divIcon({
        className: 'friend-marker-icon',
        html: `<span class="friend-marker-dot friend-marker-dot--${
          feature.properties.status === 'online' ? 'online' : 'offline'
        }"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

    const onEachFriendFeaturePopup = (feature, layer) => {
      const p = feature.properties
      let popup = `<div class='mpopup'><center><h4>${p.label}</h4></center>`
      popup += '<table class="data">'
      popup += `<tr><th>MMSI</th><td>${p.mmsi}</td></tr>`
      if (p.status) popup += `<tr><th>${t('friends.details.status')}</th><td>${p.status}</td></tr>`
      if (p.distance_nm != null) {
        popup += `<tr><th>${t('friends.details.distance')}</th><td>${distanceFormatMiles(p.distance_nm)}</td></tr>`
      }
      if (p.last_contact) {
        popup += `<tr><th>${t('friends.details.last_contact')}</th><td>${dateFormatUTC(p.last_contact)}</td></tr>`
      }
      popup += '</table>'
      popup += `<div class="mpopup-actions"><a class="va-link friend-manage-link" data-friend-id="${p.id}">${t(
        'friends.map.manage',
      )}</a></div>`
      popup += '</div>'
      layer.bindPopup(popup)
      layer.on('popupopen', (e) => {
        const btn = e.popup._contentNode.querySelector('.friend-manage-link')
        btn?.addEventListener('click', () => emit('manage', p.id), { once: true })
      })
      addMarker(feature.geometry.coordinates, layer)
    }

    geoLayer = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => L.marker(latlng, { icon: markerIcon(feature) }),
      onEachFeature: onEachFriendFeaturePopup,
    }).addTo(map.value)

    if (geoLayer.getBounds().isValid()) {
      map.value.fitBounds(geoLayer.getBounds(), { maxZoom: 12 })
    }
  }

  const navigateFriend = (friend) => {
    if (friend.longitude == null || friend.latitude == null) return
    const coords = [friend.longitude, friend.latitude]
    const openPopupClick = () => {
      openPopupMarker(coords)
      map.value.off('moveend', openPopupClick)
    }
    map.value.flyTo([friend.latitude, friend.longitude], 10)
    map.value.on('moveend', openPopupClick)
  }

  onMounted(async () => {
    isSidebarMinimized.value = true
    await nextTick()

    map.value = L.map(mapContainer.value, { zoomControl: false }).setView([20, 0], props.mapZoom)

    setTimeout(() => {
      map.value?.invalidateSize()
    }, 300)

    const bMaps = baseMaps()
    const oMaps = overlayMaps()
    bMaps[props.mapType].addTo(map.value)

    if (props.controlLayer) {
      L.control.layers(bMaps, oMaps).addTo(map.value)
      L.control.zoom({ position: 'bottomright' }).addTo(map.value)
    }

    L.control
      .sidepanel('sidepanel', {
        panelPosition: 'left',
        hasTabs: true,
        tabsPosition: 'top',
        pushControls: true,
        darkMode: currentTheme.value === 'dark',
        startTab: 'tab-friends1',
      })
      .addTo(map.value)

    // Real Leaflet control (not an HTML overlay floating independently on
    // top of the map) — positioned topright, same corner as the layers
    // control but Leaflet stacks same-corner controls vertically rather
    // than overlapping them, so this sits cleanly below it.
    const FriendsActionsControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd() {
        const container = L.DomUtil.create('div', 'leaflet-bar friends-actions-control')

        const addBtn = L.DomUtil.create('a', 'friends-actions-control__btn', container)
        addBtn.href = '#'
        addBtn.title = t('friends.follow_a_boat')
        addBtn.setAttribute('aria-label', t('friends.follow_a_boat'))
        addBtn.innerHTML = '<span class="material-icons" aria-hidden="true">add</span>'
        L.DomEvent.on(addBtn, 'click', L.DomEvent.stop)
        L.DomEvent.on(addBtn, 'click', (e) => {
          e.preventDefault()
          emit('add-friend')
        })

        const listBtn = L.DomUtil.create('a', 'friends-actions-control__btn', container)
        listBtn.href = '#'
        listBtn.title = t('friends.tabs.list')
        listBtn.setAttribute('aria-label', t('friends.tabs.list'))
        listBtn.innerHTML = '<span class="material-icons" aria-hidden="true">format_list_bulleted</span>'
        L.DomEvent.on(listBtn, 'click', L.DomEvent.stop)
        L.DomEvent.on(listBtn, 'click', (e) => {
          e.preventDefault()
          emit('view-list')
        })

        L.DomEvent.disableClickPropagation(container)
        return container
      },
    })
    new FriendsActionsControl().addTo(map.value)

    map.value.whenReady(() => {
      document.querySelector('.sidepanel-toggle-button')?.click()
    })

    renderMarkers()
  })

  watch(() => props.friends, renderMarkers, { deep: true })

  onBeforeUnmount(() => {
    map.value?.remove()
  })
</script>

<style lang="scss">
  .mpopup {
    th {
      text-align: right;
      padding-right: 5px;
      font-weight: normal;
    }
    td {
      font-weight: bold;
    }
    a {
      cursor: pointer;
    }
    h4 {
      font-weight: bold;
    }
  }
  .mpopup-actions {
    margin-top: 6px;
    text-align: center;
  }
  .sidepanel {
    width: 320px;
    height: 100%;
    .sidepanel-content {
      width: 320px;
      height: 100%;
    }
  }
  .sidepanel-empty {
    padding: 1rem;
    color: var(--va-secondary);
  }
  .sidebar-tab-link.active,
  .sidebar-tab-link:hover {
    color: var(--va-primary) !important;
    border-bottom-color: var(--va-primary) !important;
  }
  .friend-marker-dot {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
    &--online {
      background: var(--va-success);
    }
    &--offline {
      background: var(--va-secondary);
    }
  }

  .friends-actions-control {
    display: flex;
    background: white;
    a.friends-actions-control__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      color: #333;
      text-decoration: none;
      &:hover {
        background: #f4f4f4;
      }
      // NOTE: assumes the `material-icons` font is loaded globally (this
      // project already wraps Material Icons via icons-config/). If these
      // render as literal text instead of glyphs, swap for your existing
      // icon wrapper or a plain unicode character.
      .material-icons {
        font-size: 18px;
      }
    }
  }

  // Cap Leaflet's own stacking so it can never sit above a normal modal by
  // default, rather than trying to guess Vuestic's internal overlay z-index
  // and force it higher from the outside. leaflet.sidepanel in particular
  // tends to push its own z-index well above Leaflet's base panes/controls.
  .leaflet-maps-page {
    position: relative;
    z-index: 0;
  }
  .sidepanel,
  .leaflet-control-container .leaflet-top,
  .leaflet-control-container .leaflet-bottom {
    z-index: 500 !important;
  }
  .leaflet-pane {
    z-index: 400 !important;
  }
</style>
