/* eslint-env browser */

import log from 'Utilities/log'

export const fetchGet = (path) => {
  const querySeparator = path.includes('?') ? '&' : '?'
  const newPath = `${path}${querySeparator}cachebuster=${Date.now().toString()}`
  log.debug(`requesting GET ${newPath}`)
  return fetch(newPath, {
    method: 'get',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then((response) => {
    try {
      return response.json()
    } catch (err) {
      throw new Error(response.status)
    }
  })
}

export const fetchPost = (path, body) => {
  const newBody = {}
  for (const key in body) {
    if (typeof body[key] === 'string') {
      newBody[key] = body[key].trim()
    } else {
      newBody[key] = body[key]
    }
  }
  log.debug(`requesting POST ${path}`)
  return (
    fetch(path, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBody)
    })
    .then((response) => {
      try {
        return response.json()
      } catch (err) {
        throw new Error(response.status)
      }
    })
  )
}
