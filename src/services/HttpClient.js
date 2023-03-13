import { useRouter } from 'vue-router'

class HttpClient {
  constructor(options = {}) {
    this._baseURL = options.baseURL || ''
    this._headers = options.headers || {}
    this.router = useRouter()
  }

  async _fetchJSON(endpoint, options = {}) {
    const res = await fetch(this._baseURL + endpoint, {
      ...options,
      headers: this._headers,
    })

    if (res.status === 401) {
      // Unauthorized or token expired
      console.warn('Unauthorized or token expired', res, this, this.router)
      this.router.push({ name: 'logout', params: { is401: true } })
    }
    if (res.status === 551) {
      // No vessel register
      console.warn('No vessel register')
      this.router.push({ name: 'boat-new' })
    }
    if (!res.ok) throw new Error(res.statusText)

    if (options.parseResponse !== false && res.status !== 204) return res.json()

    return undefined
  }

  setHeader(key, value) {
    this._headers[key] = value
    return this
  }

  getHeader(key) {
    return this._headers[key]
  }

  setBasicAuth(username, password) {
    this._headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`
    return this
  }

  setBearerAuth(token) {
    this.token = token
    this._headers.Authorization = `Bearer ${token}`
    return this
  }

  get(endpoint, options = {}) {
    return this._fetchJSON(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  post(endpoint, body, options = {}) {
    return this._fetchJSON(endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
      method: 'POST',
    })
  }

  put(endpoint, body, options = {}) {
    return this._fetchJSON(endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
      method: 'PUT',
    })
  }

  patch(endpoint, operations, options = {}) {
    return this._fetchJSON(endpoint, {
      parseResponse: false,
      ...options,
      body: JSON.stringify(operations),
      method: 'PATCH',
    })
  }

  delete(endpoint, options = {}) {
    return this._fetchJSON(endpoint, {
      parseResponse: false,
      ...options,
      method: 'DELETE',
    })
  }
}

export default HttpClient
