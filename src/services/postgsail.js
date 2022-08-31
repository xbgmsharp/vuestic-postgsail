/*
 * Service that fetch and parse data from PostgSail API.
 *
 */
import axios from 'axios'
import router from '../router'

class PostgSail {
  /*
   * Create PostgSail instance.
   */
  constructor() {
    this.app_url = import.meta.env.VITE_PGSAIL_URL
    this.token = localStorage.getItem('token')

    this.authAPI = axios.create({
      baseURL: this.app_url + '/',
    })

    this.API = axios.create({
      baseURL: this.app_url + '/',
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
    })

    this.check()

    this.API.interceptors.response.use(
      (response) => {
        console.log('interceptors response', response)
        return response
      },
      (error) => {
        console.log('interceptors error', error)
        if (error.response.status === 401) {
          router.push('/login', { params: { is401: true } })
        }
        throw error
      },
    )
  }

  /*
   * Check API URL.
   */
  check() {
    if (!navigator.onLine || this.app_url == '' || this.app_url == null) {
      console.log(`PostgSail, NetworkError when attempting to fetch resource.`)
    }
  }

  /*
   * Methods API endpoint
   */

  login(payload) {
    return this.authAPI.post(`rpc/login`, payload)
  }

  async signin(payload) {
    return this.authAPI.post(`rpc/signup`, payload)
  }

  async vessel_reg(data) {
    const response = await fetch(`rpc/register_vessel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: data,
    })
    return await response.json()
  }

  async vessel_get() {
    return this.API.get(`vessel`)
  }

  async vessel_get_token() {
    return this.API.get(`vessel_token`)
  }

  async logs() {
    return this.API.get(`logs_view`)
  }

  async log_get(id) {
    return this.API.get(`log_view?id=eq.${id}`)
  }

  async log_update(id, payload) {
    return this.API.put(`log_view?id=eq.${id}`, payload)
  }
}

export default PostgSail
