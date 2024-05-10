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

  /*
   * Vessels API endpoint
   */
  async vessel_reg(payload: JSObj) {
    return this.post(`rpc/register_vessel`, payload)
  }

  async vessels() {
    return this.get(`vessels_view`)
  }

  async vessel_get() {
    return this.get(`rpc/vessel_fn`)
  }

  async vessel_get_token(data: JSObj) {
    return this.vessel_reg(data)
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

  async log_export_gpx(payload: JSObj) {
    this.setHeader('Accept', 'text/xml')
    const data = this.post(`rpc/export_logbook_gpx_fn`, payload)
    this.setHeader('Accept', 'application/json')
    return data
  }

  async log_export_kml(payload: JSObj) {
    this.setHeader('Accept', 'text/xml')
    const data = this.post(`rpc/export_logbook_kml_fn`, payload)
    this.setHeader('Accept', 'application/json')
    return data
  }

  async log_export_geojson(payload: JSObj) {
    return this.post(`rpc/export_logbook_geojson_fn`, payload)
  }

  async timelapse(payload: JSObj) {
    return this.post(`rpc/timelapse_fn`, payload)
  }

  async timelapse_by_points(payload: JSObj) {
    return this.post(`rpc/timelapse2_fn`, payload)
  }

  async logs_export_gpx(payload: JSObj) {
    this.setHeader('Accept', 'text/xml')
    const data = this.post(`rpc/export_logbooks_gpx_fn`, payload)
    this.setHeader('Accept', 'application/json')
    return data
  }

  async logs_export_kml(payload: JSObj) {
    this.setHeader('Accept', 'text/xml')
    const data = this.post(`rpc/export_logbooks_kml_fn`, payload)
    this.setHeader('Accept', 'application/json')
    return data
  }

  async logs_export_geojson(payload: JSObj) {
    return this.post(`rpc/timelapse_fn`, payload)
  }

  async update_observations(payload: JSObj) {
    return this.post(`rpc/update_logbook_observations_fn`, payload)
  }

  async logs_geojson() {
    return this.get(`logbook?select=track_geojson&track_geojson=not.is.null&order=_from_time.desc&limit=10`)
  }

  async logs_merge(payload: JSObj) {
    return this.post(`rpc/merge_logbook_fn`, payload)
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

  async explore() {
    return this.get(`explore_view`)
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
  async total_info() {
    return this.get(`total_info_view`)
  }
  async logs_by_month() {
    return this.get(`rpc/logs_by_month_fn`)
  }
  async logs_by_year() {
    return this.get(`rpc/logs_by_month_fn`)
  }

  /*
   * Stats API endpoint
   */
  async stats_logs_view() {
    return this.get(`stats_logs_view`)
  }
  async stats_moorages_view() {
    return this.get(`stats_moorages_view`)
  }
  async stats_logs(payload: JSObj) {
    return this.post(`rpc/stats_logs_fn`, payload)
  }

  /*
   * Badges API endpoint
   */
  async badges() {
    return this.get(`badges_view`)
  }

  /*
   * Event Logs API endpoint
   */
  async eventlogs() {
    return this.get(`eventlogs_view`)
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
