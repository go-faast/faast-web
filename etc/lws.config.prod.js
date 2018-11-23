const { dirs, useHttp } = require('./common.js')

module.exports = {
  https: !useHttp,
  directory: dirs.dist,
  rewrite: [{
    from: '/app/*',
    to: '/app/index.html',
  }],
}
