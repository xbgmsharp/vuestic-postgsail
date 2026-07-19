/*
 * Service that fetches and parses data from PostgSail API.
 *
 */
import HttpClient from './HttpClient'
import { useGlobalStore } from '../stores/global-store'
import type { JSObj } from '../data/types'

class ApiClient extends HttpClient {
  static #instance: ApiClient;
  [index: string]: any
  /*
   * Create ApiClient instance.
   */
  constructor() {
    if (ApiClient.#instance) return ApiClient.#instance

    super({
      baseURL: import.meta.env.VITE_PGSAIL_URL + '/',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    })
    // Passing Bearer Token if it exists in cache
    const globalToken = useGlobalStore().token
    if (globalToken) {
      this.setBearerAuth(globalToken)
    }
    // Check online status
    this.check()

    ApiClient.#instance = this
  }

  /*
   * Check API URL.
   */
  check() {
    if (!navigator.onLine || this._baseURL == '/' || this._baseURL == null) {
      console.warn('PostgSail: NetworkError when attempting to fetch resource.')
    }
  }

  /*
   * Methods API endpoint
   */

  /*
   * Auth API endpoint
   */
  async login(payload: JSObj) {
    return this.post(`rpc/login`, payload)
  }

  async signin(payload: JSObj) {
    return this.post(`rpc/signup`, payload)
  }

  async recover(payload: JSObj) {
    return this.post(`rpc/recover`, payload)
  }

  async reset(payload: JSObj) {
    return this.post(`rpc/reset`, payload)
  }

  async is_public(payload: JSObj) {
    return this.post(`rpc/ispublic_fn`, payload)
  }

  /*
   * User settings
   */
  async settings() {
    return this.get(`rpc/settings_fn`, { cache: 'reload' })
  }
  async update_user_preferences(payload: JSObj) {
    return this.post(`rpc/update_user_preferences_fn`, payload)
  }
  async versions() {
    return this.get(`rpc/versions_fn`)
  }
  async otp_generate(payload: JSObj) {
    return this.post(`rpc/generate_otp_fn`, payload)
  }
  async otp_email(payload: JSObj) {
    return this.post(`rpc/email_fn`, payload)
  }
  async pushover(payload: JSObj) {
    return this.post(`rpc/pushover_fn`, payload)
  }
  async pushover_link() {
    return this.post(`rpc/pushover_subscribe_link_fn`)
  }
  async get_vessel_monitoring() {
    return this.get(`metadata?select=configuration,available_keys`)
  }
  async update_vessel_monitoring(payload: JSObj) {
    return this.patch('metadata', payload)
  }
  async mcp() {
    return this.post(`rpc/register_mcp`)
  }
  /*
   * Vessels API endpoint
   */
  async vessel_reg(payload: JSObj) {
    return this.post(`rpc/register_vessel`, payload)
  }

  async vessels() {
    return this.get(`vessels_view`)
  }

  async vessels_get(id: string) {
    return this.get(`vessel_view?vessel_id=eq.${id}`)
  }

  async vessel_get() {
    return this.get(`rpc/vessel_fn`)
  }

  async vessel_get_token(data: JSObj) {
    return this.vessel_reg(data)
  }

  async vessel_get_polar() {
    return this.get('metadata?select=polar:user_data->>polar,polar_updated_at:user_data->>polar_updated_at')
  }

  async vessel_settings() {
    return this.get('rpc/vessel_settings_fn')
  }

  async vessel_update(payload: JSObj) {
    return this.post('rpc/update_metadata_userdata_fn', payload)
  }

  async vessel_search_specs(query: string) {
    return this.post('rpc/search_vessel_specs_fn', { _query: query })
  }

  async vessel_search_specs_html(query: string) {
    return this.post('rpc/search_vessel_specs_html_fn', { _query: query })
  }

  async vessel_search_specs_id(query: string) {
    return this.post('rpc/get_vessel_specs_id_fn', { _post_id: query })
  }

  async vessel_activity() {
    return this.get('rpc/vessel_activity_fn')
  }

  async update_vessel_settings(payload: JSObj) {
    return this.post(`rpc/update_vessel_settings_fn`, payload)
  }
  /*
   * Logs API endpoint
   */
  async logs() {
    return this.get(`logs_view`)
  }

  async log_get(id: string) {
    return this.get(`log_view?id=eq.${id}`)
  }

  async log_update(id: string, payload: JSObj) {
    return this.patch(`logbook?id=eq.${id}`, payload)
  }

  async log_delete(id: string) {
    //return this.delete(`logbook?id=eq.${id}`)
    return this.post(`rpc/delete_logbook_fn`, { _id: id })
  }

  async log_update_trip_notes(payload: JSObj) {
    // _id INT,
    // update_string TTEXT -- ttext '["notes"@2024-11-07T18:40:45+00, ""@2024-11-07T18:41:45+00]'
    return this.post(`rpc/update_trip_notes_fn`, payload)
  }

  async log_delete_trip_entry_fn(payload: JSObj) {
    // _id INT,
    // update_string tstzspan -- tstzspan '[2024-11-07T18:40:45+00, 2024-11-07T18:41:45+00]'
    return this.post(`rpc/delete_trip_entry_fn`, payload)
  }

  async log_export_gpx(payload: JSObj) {
    this.setHeader('Accept', 'text/xml')
    const data = this.post(`rpc/export_logbook_gpx_trip_fn`, payload)
    this.setHeader('Accept', 'application/json')
    return data
  }

  async log_export_kml(payload: JSObj) {
    this.setHeader('Accept', 'text/xml')
    const data = this.post(`rpc/export_logbook_kml_trip_fn`, payload)
    this.setHeader('Accept', 'application/json')
    return data
  }

  async log_export_geojson(payload: JSObj) {
    return this.post(`rpc/export_logbook_geojson_trip_fn`, payload)
  }

  async timelapse(payload: JSObj) {
    return this.post(`rpc/timelapse_fn`, payload)
  }

  async timelapse_trips_by_linestring(payload: JSObj) {
    return this.get(`rpc/export_logbooks_geojson_linestring_trips_fn?${payload}`)
  }

  async timelapse_by_points(payload: JSObj) {
    return this.post(`rpc/timelapse2_fn`, payload)
  }

  async timelapse_trips_by_points(payload: JSObj) {
    return this.get(`rpc/export_logbooks_geojson_point_trips_fn?${payload}`)
  }

  async timelapse_record(payload: JSObj) {
    return this.post(`rpc/maplapse_record_fn`, payload)
  }

  async logs_export_gpx(payload: JSObj) {
    this.setHeader('Accept', 'text/xml')
    const data = this.post(`rpc/export_logbooks_gpx_trips_fn`, payload)
    this.setHeader('Accept', 'application/json')
    return data
  }

  async logs_export_kml(payload: JSObj) {
    this.setHeader('Accept', 'text/xml')
    const data = this.post(`rpc/export_logbooks_kml_trips_fn`, payload)
    this.setHeader('Accept', 'application/json')
    return data
  }

  async logs_export_geojson(payload: JSObj) {
    return this.timelapse_trips_by_points(payload)
  }

  async update_observations(payload: JSObj) {
    return this.post(`rpc/update_logbook_observations_fn`, payload)
  }

  async logs_geojson() {
    return this.get(`log_view?select=geojson&geojson=not.is.null&order=started.desc&limit=10`)
  }

  async logs_merge(payload: JSObj) {
    return this.post(`rpc/merge_logbook_fn`, payload)
  }

  async logs_map(payload: JSObj, page = 1) {
    const limit = 100
    const offset = (page - 1) * limit

    this.setHeader('Prefer', 'count=exact')
    return this.get(
      `logs_geojson_view?select=geojson&geojson=not.is.null&order=starttimestamp.desc&limit=${limit}&offset=${offset}`,
    )
  }

  async logs_mapgl(payload: JSObj) {
    return this.post(`rpc/mapgl_fn`, payload)
  }

  async logs_tags() {
    return this.get(`rpc/logs_tags_fn`)
  }

  async logs_range(payload: JSObj) {
    return this.get(`log_view?${payload}`)
  }

  /*
   * Moorages API endpoint
   */
  async moorages() {
    return this.get(`moorages_view`)
  }

  async moorages_export_geojson() {
    return this.post('rpc/export_moorages_geojson_fn')
  }

  async moorages_export_gpx() {
    this.setHeader('Accept', 'text/xml')
    const data = this.get(`rpc/export_moorages_gpx_fn`)
    this.setHeader('Accept', 'application/json')
    return data
    //return this.post('rpc/export_moorages_gpx_fn')
  }

  async moorages_export_kml() {
    this.setHeader('Accept', 'text/xml')
    const data = this.get(`rpc/export_moorages_kml_fn`)
    this.setHeader('Accept', 'application/json')
    return data
    //return this.post('rpc/export_moorages_kml_fn')
  }

  async moorage_get(id: string) {
    return this.get(`moorage_view?id=eq.${id}`)
  }

  async moorage_update(id: string, payload: JSObj) {
    return this.patch(`moorages?id=eq.${id}`, payload)
  }

  async moorage_delete(id: string) {
    return this.delete(`moorages?id=eq.${id}`)
  }

  async find_log_from_moorage_fn(payload: JSObj) {
    return this.post('rpc/find_log_from_moorage_fn', payload)
  }

  async find_log_to_moorage_fn(payload: JSObj) {
    return this.post('rpc/find_log_to_moorage_fn', payload)
  }

  async moorages_stays(id: string) {
    return this.get(`moorages_stays_view?id=eq.${id}`)
  }

  async moorages_arrivals_departures(id: string) {
    return this.get(`logs_view?or=(_from_moorage_id.eq.${id},_to_moorage_id.eq.${id})`)
  }

  async notes_history() {
    return this.get('stays_explore_view')
  }

  async moorages_map(payload: JSObj, page = 1) {
    const limit = 100
    const offset = (page - 1) * limit

    this.setHeader('Prefer', 'count=exact')
    //this.setHeader('Range-Unit', 'items')
    //this.setHeader('Range', `${offset}-${offset + limit - 1}`)

    return this.get(`moorages_geojson_view?select=geojson&geojson=not.is.null&limit=${limit}&offset=${offset}`)
  }

  /*
   * Stays API endpoint
   */
  async stays() {
    return this.get(`stays_view`)
  }

  async stay_get(id: string) {
    return this.get(`stay_view?id=eq.${id}`)
  }

  async stay_update(id: string, payload: JSObj) {
    return this.patch(`stays?id=eq.${id}`, payload)
  }

  async stay_delete(id: string) {
    return this.delete(`stays?id=eq.${id}`)
  }

  async stays_map(payload: JSObj, page = 1) {
    const limit = 100
    const offset = (page - 1) * limit

    this.setHeader('Prefer', 'count=exact')
    //this.setHeader('Range-Unit', 'items')
    //this.setHeader('Range', `${offset}-${offset + limit - 1}`)
    return this.get(`stays_geojson_view?select=geojson&geojson=not.is.null&limit=${limit}&offset=${offset}`)
  }

  /*
   * Monitoring API endpoint
   */
  async monitoring() {
    return this.get(`monitoring_view`)
  }

  async monitoring2() {
    //return this.get(`monitoring_view2?key=ilike.${key}`)
    /*
    return this.get(
      `monitoring_view2?key=ilike(any).{tanks.%.capacity%,electrical.solar.%.panelPower,electrical.batteries%stateOfCharge}`,
    )
    */
    return this.get(`monitoring_view2`)
  }
  async monitoring_live() {
    return this.get(`monitoring_live`)
  }

  async explore() {
    return this.get(`metrics_explore_view`)
  }

  async history(payload: JSObj) {
    return this.post(`rpc/monitoring_history_fn`, payload)
  }
  /*
   * Stays at
   */
  async stays_at() {
    return this.get(`stays_at`)
  }

  /*
   * Charts API endpoint
   */
  async logs_by_day() {
    return this.get(`rpc/graph_logs_by_day_fn`)
  }
  async logs_by_week() {
    return this.get(`rpc/graph_logs_by_week_fn`)
  }
  async logs_by_month() {
    return this.get(`rpc/graph_logs_by_month_fn`)
  }
  async logs_by_year() {
    return this.get(`rpc/graph_logs_by_year_fn`)
  }
  async logs_by_year_week() {
    return this.get(`rpc/graph_logs_by_year_week_fn`)
  }
  async logs_by_year_month() {
    return this.get(`rpc/graph_logs_by_year_month_fn`)
  }
  async logs_by_month_day() {
    return this.get(`rpc/graph_logs_by_month_day_fn`)
  }
  async logs_network() {
    return this.get(`rpc/graph_logs_network_fn`)
  }

  /*
   * Stats API endpoint
   */
  async stats_logs(payload: JSObj) {
    return this.post(`rpc/stats_logs_fn`, payload)
  }
  async stats_moorages(payload: JSObj) {
    return this.post(`rpc/stats_stays_fn`, payload)
  }
  async stats(payload: JSObj) {
    return this.post(`rpc/stats_fn`, payload)
  }

  /*
   * Badges API endpoint
   */
  async badges() {
    return this.get(`rpc/badges_fn`)
  }

  /*
   * Event Logs API endpoint
   */
  async eventlogs() {
    return this.get(`eventlogs_view`)
  }

  /*
   * image update for vessel, stay, moorage, logbook
   */
  async image_update(payload: JSObj) {
    return this.post('rpc/manage_image_fn', payload)
  }

  async getPresignedUploadUrl(payload: JSObj) {
    return this.post('rpc/getpresigneduploadurl_fn', payload)
  }

  async getPresignedDeleteUrl(payload: JSObj) {
    return this.post('rpc/getpresigneddeleteurl_fn', payload)
  }
  /*
   * note update for stay, moorage, logbook
   */
  async note_update(id: string, payload: JSObj, type: string) {
    let data = null
    if (type === 'stay') data = this.patch(`stays?id=eq.${id}`, payload)
    else if (type === 'moorage') data = this.patch(`moorages?id=eq.${id}`, payload)
    else if (type === 'logbook') data = this.patch(`logbook?id=eq.${id}`, payload)
    else {
      console.error('Unknown type for note upload:', type)
      throw new Error('Unknown type for note upload: ' + type)
    }
    return data
  }

  /*
   * Logs
   *
   * */
  get log() {
    return {
      all: () => this.get(`logs_view`),
      get: (id: string) => this.get(`log_view?id=eq.${id}`),
      delete: (id: string) => this.delete(`log_view?id=eq.${id}`),
      update: (id: string, payload: JSObj) => this.patch(`logbook?id=eq.${id}`, payload),
    }
  }

  /*
   * Stays
   *
   * */
  get stay() {
    return {
      all: () => this.get(`stays_view`),
      get: (id: string) => this.get(`stay_view?id=eq.${id}`),
      delete: (id: string) => this.delete(`stay_view?id=eq.${id}`),
      update: (id: string, payload: JSObj) => this.patch(`stays?id=eq.${id}`, payload),
    }
  }

  /*
   * Moorages
   *
   * */
  get moorage() {
    return {
      all: () => this.get(`moorages_view`),
      get: (id: string) => this.get(`moorage_view?id=eq.${id}`),
      delete: (id: string) => this.delete(`moorage_view?id=eq.${id}`),
      update: (id: string, payload: JSObj) => this.patch(`moorages?id=eq.${id}`, payload),
    }
  }
}

export default ApiClient
