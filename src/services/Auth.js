import { WebAuth } from 'auth0-js'

import config from 'Config'
const { auth0: authConfig } = config

const REQUESTED_SCOPES = 'read:current_user update:current_user_metadata'

const KEY_ID_TOKEN = 'auth:idToken'
const KEY_ACCESS_TOKEN = 'auth:accessToken'
const KEY_EXPIRES_AT = 'auth:expiresAt'
const KEY_ACCESS_SCOPES = 'auth:accessScopes'

/** Store auth session information in local storage */
function setSession(authResult) {
  // Set the time that the access token will expire at
  const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
  // If no scopes are in result, all requested scopes were granted
  const scopes = authResult.scope || REQUESTED_SCOPES || ''
  localStorage.setItem(KEY_ID_TOKEN, authResult.idToken)
  localStorage.setItem(KEY_ACCESS_TOKEN, authResult.accessToken)
  localStorage.setItem(KEY_EXPIRES_AT, expiresAt)
  localStorage.setItem(KEY_ACCESS_SCOPES, JSON.stringify(scopes))
}

/** Clear auth session information from local storage */
function clearSession() {
  localStorage.removeItem(KEY_ACCESS_TOKEN)
  localStorage.removeItem(KEY_ID_TOKEN)
  localStorage.removeItem(KEY_EXPIRES_AT)
  localStorage.removeItem(KEY_ACCESS_SCOPES)
}

/** Get auth session information from local storage */
export function getSession() {
  return {
    accessToken: localStorage.getItem(KEY_ACCESS_TOKEN),
    idToken: localStorage.getItem(KEY_ID_TOKEN),
    expiresAt: JSON.parse(localStorage.getItem(KEY_EXPIRES_AT) || '0'),
    accessScopes: JSON.parse(localStorage.getItem(KEY_ACCESS_SCOPES) || '""').split(' '),
  }
}

export function isAuthenticated() {
  // Check whether the current time is past the 
  // access token's expiry time
  const { expiresAt } = getSession()
  const result = new Date().getTime() < expiresAt
  return result
}

export function hasPermission(...permissions) {
  const { accessScopes } = getSession()
  return permissions.every(perm => 
    accessScopes.some(scope => (
      perm instanceof RegExp
        ? perm.test(scope)
        : perm === scope)))
}

export default class Auth {

  constructor() {
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.handleCallback = this.handleCallback.bind(this)
    this.isAuthenticated = isAuthenticated
    this.hasPermission = hasPermission
    this.auth0 = new WebAuth({
      domain: authConfig.domain,
      clientID: authConfig.clientId,
      redirectUri: authConfig.callbackUrl,
      audience: authConfig.audience,
      responseType: 'token id_token',
      scope: REQUESTED_SCOPES
    })
  }

  login() {
    console.log('Auth#login')
    this.auth0.authorize()
  }

  handleCallback() {
    console.log('Auth#handleCallback')
    return new Promise((resolve, reject) => 
      this.auth0.parseHash((err, authResult) => {
        if (err) {
          console.error('Auth#handleCallback:error', err)
          return reject(err)
        }
        if (authResult && authResult.accessToken && authResult.idToken) {
          console.log('Auth#handleCallback:success', authResult)
          setSession(authResult)
          return resolve(authResult)
        } else {
          console.error('Auth#handleCallback:failed', authResult)
          return reject(new Error('Parsed auth hash is invalid'))
        }
      }))
  }

  logout() {
    console.log('Auth#logout')
    clearSession()
  }
}