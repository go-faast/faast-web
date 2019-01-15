/* eslint-env browser */

import uuid from 'uuid/v4'
import qs from 'query-string'
import fetch from 'cross-fetch'

import log from 'Utilities/log'
import { retry } from 'Utilities/helpers'

const concurrentTracker: { [id: string]: Promise<any> } = {}

function dropConcurrent(promiseCreator: () => Promise<any>, id: string) {
  let current = concurrentTracker[id]
  if (current) {
    log.debug(`Dropping concurrent request ${id}`)
    return current
  }
  current = promiseCreator()
    .then((result) => {
      delete concurrentTracker[id]
      return result
    })
    .catch((e) => {
      delete concurrentTracker[id]
      throw e
    })
  concurrentTracker[id] = current
  return current
}

export type FetchBody = { [k: string]: any } | null

export type FetchParams = { [k: string]: any } | null

export type FetchHeaders = { [k: string]: string }

export interface FetchOptions {
  retries?: number
  retryDelay?: number
  retryMultiplier?: number
  allowConcurrent?: boolean
  headers?: FetchHeaders,
  json?: string
}

export const fetchJson = (
  method: string,
  path: string,
  body?: FetchBody,
  params?: FetchParams,
  options: FetchOptions = {},
): Promise<any> => {
  params = params || {}
  const {
    retries = 0,
    retryDelay = 1000,
    retryMultiplier = 2,
    allowConcurrent = true, // If false, prevent requests with same path from occuring concurrently
  } = options
  const doFetchJson = () => Promise.resolve().then(() => {
    let encodedParams = {}
    if (path.includes('?')) {
      const parsed = qs.parseUrl(path)
      path = parsed.url
      encodedParams = parsed.query || {}
    }
    const allParams = {
      ...(method === 'GET' ? { _: Date.now() } : {}),
      ...encodedParams,
      ...params,
    }
    const allParamsString = qs.stringify(allParams)
    const fullPath = path + (allParamsString ? '?' + allParamsString : '')

    const headers: FetchHeaders = {
      ...(options.headers || {}),
      Accept: 'application/json',
    }
    let bodyString: string
    if (method !== 'GET' && body) {
      const newBody: FetchBody = {}
      for (const key in body) {
        if (typeof body[key] === 'string') {
          newBody[key] = body[key].trim()
        } else {
          newBody[key] = body[key]
        }
      }
      bodyString = JSON.stringify(newBody)
      headers['Content-Type'] = 'application/json'
    }
    const performFetch = () => fetch(fullPath, { method, headers, body: bodyString })
      .then((response) => {
        try {
          return response.json()
        } catch (err) {
          throw new Error(`${response.status}: ${response.statusText}`)
        }
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error)
        }
        return data
      })
    const requestId = `[${uuid().slice(0, 8)}]`
    const requestMessage = `${requestId} Requesting ${method} ${fullPath}`
    if (body) {
      log.debug(requestMessage, body)
    } else {
      log.debug(requestMessage)
    }
    const beforeRetry = (attemptsLeft: number, delay: number, e: Error) => log.debug(
      `${requestId} Request failed. Waiting ${delay}ms then retrying ${attemptsLeft} more times. ` +
      `Caused by error: ${e.message}`)
    return retry(performFetch, { retries, delay: retryDelay, multiplier: retryMultiplier, before: beforeRetry })
      .then((result: any) => {
        log.debug(`${requestId} Request success.`, result)
        return result
      })
      .catch((e: Error) => {
        log.error(`${requestId} Request failed. Error: ${e.message}`)
        throw e
      })
  })
  if (!allowConcurrent) {
    return dropConcurrent(doFetchJson, `${method} ${path}`)
  }
  return doFetchJson()
}

export const fetchGet = (path: string, params?: FetchParams, options?: FetchOptions) =>
  fetchJson('GET', path, undefined, params, options)

export const fetchPost = (path: string, body?: FetchBody, params?: FetchParams, options?: FetchOptions) =>
  fetchJson('POST', path, body, params, options)

export const fetchDelete = (path: string, body?: FetchBody, params?: FetchParams, options?: FetchOptions) =>
  fetchJson('DELETE', path, body, params, options)
