/* eslint-env browser */

import uuid from 'uuid/v4'
import qs from 'query-string'

import log from 'Utilities/log'
import { delay } from 'Utilities/helpers'

function retry(promiseCreator, retryCount, retryDelay, retryMultiplier, onRetry) {
  if (retryCount <= 0) {
    return promiseCreator()
  }
  return promiseCreator()
    .catch((e) => {
      if (typeof onRetry === 'function') {
        onRetry(retryCount, retryDelay, e)
      }
      return delay(retryDelay)
        .then(() => retry(promiseCreator, retryCount - 1, retryDelay * retryMultiplier, retryMultiplier, onRetry))
    })
}

export const fetchJson = (
  method,
  path,
  body,
  params = {},
  options = {},
) => {
  const {
    retries = 0,
    retryDelay = 1000,
    retryMultiplier = 2,
  } = options
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
  const fetchOptions = {
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
    fetchOptions.body = JSON.stringify(newBody)
    fetchOptions.headers['Content-Type'] = 'application/json'
  }
  const doFetch = () => fetch(fullPath, fetchOptions)
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
  const requestId = `[${uuid().slice(0, 8)}]`
  log.debug(`${requestId} Requesting ${method} ${fullPath}`, body)
  const onRetry = (attemptsLeft, delay, e) => log.debug(`${requestId} Request failed. Waiting ${delay}ms then retrying ${attemptsLeft} more times. Caused by error: ${e.message}`)
  return retry(doFetch, retries, retryDelay, retryMultiplier, onRetry)
    .then((result) => {
      log.debug(`${requestId} Request success.`, result)
      return result
    })
    .catch((e) => {
      log.error(`${requestId} Request failed. Error: ${e.message}`)
      throw e
    })
}

export const fetchGet = (path, params, options) => fetchJson('GET', path, null, params, options)

export const fetchPost = (path, body, params, options) => fetchJson('POST', path, body, params, options)

export const fetchDelete = (path, body, params, options) => fetchJson('DELETE', path, body, params, options)
