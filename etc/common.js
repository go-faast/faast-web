const path = require('path')
const envConfig = require('../src/config/environment')

// only used in development, prod is always https
const useHttps = process.env.HTTPS === 'true'
const useHttp = process.env.HTTPS === 'false'

const dirs = {
  root: path.resolve(__dirname, '..')
}

dirs.dist = path.join(dirs.root, 'dist')
dirs.src = path.join(dirs.root, 'src')
dirs.res = path.join(dirs.root, 'res')
dirs.test = path.join(dirs.root, 'test')
dirs.testE2e = path.join(dirs.test, 'e2e')
dirs.testE2eReports = path.join(dirs.testE2e, 'reports')
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
const localesOutputPath = 'locales'
const imgOutputPath = path.join(staticOutputPath, 'img')
const fontOutputPath = path.join(staticOutputPath, 'font')
const fileOutputPath = path.join(staticOutputPath, 'file')
const vendorOutputPath = path.join(staticOutputPath, 'vendor')

module.exports = Object.assign({}, envConfig, {
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
  localesOutputPath
})
