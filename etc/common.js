const path = require('path')

const DEFAULT_NODE_ENV = 'production'
let NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  NODE_ENV = DEFAULT_NODE_ENV
}
const isDev = NODE_ENV === 'development'
const isIpfs = process.env.IPFS === 'true'
const isMocking = Boolean(process.env.MOCK)
const useHttps = process.env.HTTPS === 'true'
const useHttp = process.env.HTTPS === 'false'

const dirs = {
  root: path.resolve(__dirname, '..')
}

dirs.dist = path.join(dirs.root, 'dist')
dirs.src = path.join(dirs.root, 'src')
dirs.res = path.join(dirs.root, 'res')
dirs.test = path.join(dirs.root, 'test')
dirs.nodeModules = path.join(dirs.root, 'node_modules')
dirs.site = path.join(dirs.src, 'site')
dirs.app = path.join(dirs.src, 'app')

dirs.build = path.join(dirs.root, 'build')
dirs.buildApp = path.join(dirs.build, 'app')
dirs.buildSite = path.join(dirs.build, 'site')

const appPath = 'app'

const bundleOutputPath = 'bundle'
const faviconOutputPath = 'favicon'
const staticOutputPath = 'static'
const imgOutputPath = path.join(staticOutputPath, 'img')
const fontOutputPath = path.join(staticOutputPath, 'font')
const fileOutputPath = path.join(staticOutputPath, 'file')
const vendorOutputPath = path.join(staticOutputPath, 'vendor')

const siteRoot = process.env.SITE_ROOT || (process.env.NETLIFY_PROD === 'true' ? process.env.URL : '') // Leave empty when not deploying behind a domain

module.exports = {
  NODE_ENV,
  isDev,
  isIpfs,
  isMocking,
  useHttps,
  useHttp,
  dirs,
  appPath,
  bundleOutputPath,
  faviconOutputPath,
  staticOutputPath,
  imgOutputPath,
  fontOutputPath,
  fileOutputPath,
  vendorOutputPath,
  siteRoot,
}
