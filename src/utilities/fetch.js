/* eslint-env browser */

import log from 'Utilities/log'

export const fetchJson = (method, path, body) => {
  if (method !== 'POST') {
    const querySeparator = path.includes('?') ? '&' : '?'
    path = `${path}${querySeparator}cachebuster=${Date.now().toString()}`
  }
  log.debug(`requesting ${method} ${path}`)
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
  return fetch(path, options)
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

export const fetchGet = (path) => fetchJson('GET', path)

export const fetchPost = (path, body) => fetchJson('POST', path, body)

export const fetchDelete = (path, body) => fetchJson('DELETE', path, body)
