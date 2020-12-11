/**
 * Note: don't use es6
 * Note: Only put basic config relating to runtime environment in here
 * because it's used by webpack and react-static build processes as well as the
 * bundled app
 */

const DEFAULT_NODE_ENV = 'production'
let NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  NODE_ENV = DEFAULT_NODE_ENV
}
const isDev = NODE_ENV === 'development'
const isProd = NODE_ENV === 'production'
const isIpfs = process.env.IPFS === 'true'
const isMocking = process.env.MOCK === 'true'
const DEPLOY_ENV = process.env.DEPLOY_ENV || 'local' // can be production, staging, develop, or local

// Leave empty when not deploying behind a specific domain
const siteRoot = process.env.SITE_ROOT || ''

module.exports = {
  NODE_ENV,
  DEPLOY_ENV,
  nodeEnv: NODE_ENV,
  isDev,
  isProd,
  isIpfs,
  isMocking,
  siteRoot,
  siteUrl: siteRoot || 'https://faa.st',
  apiUrl: process.env.API_URL || 'https://api.faa.st',
  logLevel: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  auth0: {
    domain: DEPLOY_ENV == 'production' ? 'faast.eu.auth0.com' : 'faast-staging.eu.auth0.com',
    clientId: DEPLOY_ENV == 'production' ? '6rTS34Q5qU8x7Tr6CKNPjFEJu0NJ7Xjf' : 'WUE4HYOZO4xIHoiGYAhDqw0txRuwvFsG',
    callbackUrl: isDev ? 'http://localhost:8080/app/makers/login/auth/callback' : `${siteRoot}/app/makers/login/auth/callback`,
    audience: DEPLOY_ENV == 'production' ? 'https://api.faa.st' : 'https://testapi.faa.st',
    logoutURL: DEPLOY_ENV == 'production' ? 'https://faa.st/app/makers/login' : 'http://localhost:8080/app/makers/login',
  }
}
