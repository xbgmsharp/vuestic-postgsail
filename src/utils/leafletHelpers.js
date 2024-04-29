import * as L from 'leaflet'

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

  // https://emodnet.ec.europa.eu
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
