const { useHttps } = require('./common.js')

const proto = useHttps ? 'https' : 'http'
const appDomain = `${proto}://localhost:8080`
const siteDomain = `${proto}://localhost:3000`

module.exports = {
  https: useHttps,
  hostname: 'localhost',
  rewrite: [{
    from: '/app',
    to: `${appDomain}/app`,
  }, {
    from: '/app/*',
    to: `${appDomain}/app/$1`,
  }, {
    from: '/*',
    to: `${siteDomain}/$1`,
  }],
}
