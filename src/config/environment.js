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
const siteRoot = process.env.SITE_ROOT || 'https://faa.st'

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
}
