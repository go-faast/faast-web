/* eslint-env browser */

import log from 'Utilities/log'
import qs from 'query-string'

export const fetchJson = (method, path, body, params = {}) => {
  let encodedParams = {}
  if (path.includes('?')) {
    const parsed = qs.parseUrl(path)
    path = parsed.url
    encodedParams = parsed.query || {}
  }
  const allParams = {
    ...(method === 'GET' ? { '_': Date.now() } : {}),
    ...encodedParams,
    ...params,
  }
  const allParamsString = qs.stringify(allParams)
  const fullPath = path + (allParamsString ? '?' + allParamsString : '')
  const options = {
    method: method,
    headers: {
      'Accept': 'application/json'
    }
  }
  if (method !== 'GET' && body) {
    const newBody = {}
    for (const key in body) {
      if (typeof body[key] === 'string') {
        newBody[key] = body[key].trim()
      } else {
        newBody[key] = body[key]
      }
    }
    options.body = JSON.stringify(newBody)
    options.headers['Content-Type'] = 'application/json'
  }
  log.debug(`requesting ${method} ${fullPath}`)
  return fetch(fullPath, options)
  .then((response) => {
    try {
      return response.json()
    } catch (err) {
      throw new Error(response.status)
    }
  })
  .then((data) => {
    if (data.error) {
      throw new Error(data.error)
    }
    return data
  })
}

export const fetchGet = (path, params) => fetchJson('GET', path, null, params)

export const fetchPost = (path, body, params) => fetchJson('POST', path, body, params)

export const fetchDelete = (path, body, params) => fetchJson('DELETE', path, body, params)
