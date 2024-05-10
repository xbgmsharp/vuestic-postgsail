class HttpClient {
  _baseURL
  _headers

  constructor(options = {}) {
    this._baseURL = options.baseURL || ''
    this._headers = options.headers || {}
  }

  async _fetchJSON(endpoint, options = {}) {
    const res = await fetch(this._baseURL + endpoint, {
      ...options,
      headers: this._headers,
    })

    if (res.status === 401) {
      // Unauthorized or token expired
      console.warn('Unauthorized or token expired')
      return 401
    }
    if (res.status === 551) {
      // No vessel register
      console.warn('No vessel register')
      return 551
    }
    if (res.status === 204) {
      // No Content on PATH method
      //console.warn('No Content')
      return true
    }
    if (!res.ok) throw new Error(res.statusText)
    const contentType = res.headers.get('content-type')
    if (res.status == 200 && contentType && contentType.indexOf('text/xml') === 0) {
      console.log(res.clone().text())
      return res.clone().text()
    }

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

  delHeader(key) {
    delete this._headers[key]
    return this
  }

  setBasicAuth(username, password) {
    this._headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`
    return this
  }

  setBearerAuth(token, keepLoggedIn) {
    this.token = token
    this._headers.Authorization = token ? `Bearer ${token}` : ''
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
