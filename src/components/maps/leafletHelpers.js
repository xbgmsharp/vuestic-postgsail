import * as L from 'leaflet'
import { appWindAngle } from '../../utils/angleFormatter.js'

// Basic maps providers
export const baseMaps = function () {
  // OpenStreetMap
  const osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  })

  // Satellite
  const sat = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 17,
    },
  )

  // NOAA Nautical Charts for USA
  const noaa = L.tileLayer('https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', {
    attribution: 'NOAA',
    maxZoom: 18,
  })

  // CARTO
  const cartodb = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
    maxZoom: 18,
  })

  // European Marine Observation and Data Network https://emodnet.ec.europa.eu
  const bathymetryLayer = L.tileLayer.wms('http://ows.emodnet-bathymetry.eu/wms', {
    layers: 'emodnet:mean_atlas_land',
    format: 'image/png',
    transparent: true,
    attribution: 'EMODnet Bathymetry',
    opacity: 0.8,
  })
  const coastlinesLayer = L.tileLayer.wms('http://ows.emodnet-bathymetry.eu/wms', {
    layers: 'coastlines',
    format: 'image/png',
    transparent: true,
    attribution: 'EMODnet Bathymetry',
    opacity: 0.8,
  })
  const bathymetryGroupLayer = L.layerGroup([bathymetryLayer, coastlinesLayer])

  const baseMaps = {
    Satellite: sat,
    OpenStreetMap: osm,
    CARTO: cartodb,
    'Nautical charts (USA)': noaa,
    'EMODnet Bathymetry': bathymetryGroupLayer,
  }

  return baseMaps
}

export const defaultBaseMapType = function () {
  return 'OpenStreetMap'
}

export const fallbackBaseMapType = function () {
  return 'CARTO'
}

// Additional overlay maps providers
export const overlayMaps = function () {
  // OpenSeaMap
  const openseamap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
    maxZoom: 18,
  })

  const overlayMaps = {
    OpenSeaMap: openseamap,
  }

  return overlayMaps
}

export const boatMarkerTypes = function () {
  const sailConfigImage = (twd, cog) => {
    const [awa, tack] = appWindAngle(twd, cog)
    if (awa > 155) {
      return `/sailboat-180${tack}.png` // running
    } else if (awa > 110) {
      return `/sailboat-135${tack}.png` // broad reaching
    } else if (awa > 50) {
      return `/sailboat-090${tack}.png` // close/beam reaching
    } else if (awa > 25) {
      return `/sailboat-045${tack}.png` // close-hauled, beating
    } else {
      return '/sailboat-000.png'
    }
  }
  const sailConfigIconImg = function (feature) {
    if (
      feature.properties.status == 'sailing' &&
      feature.properties.truewinddirection &&
      feature.properties.courseovergroundtrue
    ) {
      return sailConfigImage(feature.properties.truewinddirection, feature.properties.courseovergroundtrue)
    }
    return '/sailboat-000.png'
  }

  const sailBoatConfigIcon = function (feature, latlng) {
    return L.marker(latlng, {
      icon: new L.Icon({
        iconSize: [32, 32],
        iconAnchor: [16, 10],
        iconUrl: sailConfigIconImg(feature),
      }),
      rotationAngle: feature.properties.courseovergroundtrue,
    })
  }
  const sailBoatIcon = function (feature, latlng) {
    return L.marker(latlng, {
      icon: new L.Icon({
        iconSize: [16, 32],
        iconAnchor: [8, 10],
        iconUrl: '/sailboaticon.png',
      }),
      rotationAngle: feature.properties.courseovergroundtrue,
    })
  }
  const powerBoatIcon = function (feature, latlng) {
    return L.marker(latlng, {
      icon: new L.Icon({
        iconSize: [16, 32],
        iconAnchor: [8, 10],
        iconUrl: '/powerboaticon.png',
      }),
      rotationAngle: feature.properties.courseovergroundtrue,
    })
  }
  const simpleDotIcon = function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 2,
      fillColor: '#00FFFF',
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    })
  }

  const boatTypes = {
    Sailboat: sailBoatIcon,
    SailboatConfig: sailBoatConfigIcon,
    Powerboat: powerBoatIcon,
    Dot: simpleDotIcon,
  }

  return boatTypes
}
