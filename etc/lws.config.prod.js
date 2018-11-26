const { dirs } = require('./common.js')

module.exports = {
  https: true,
  directory: dirs.dist,
  rewrite: [{
    from: '/app/*',
    to: '/app/index.html',
  }],
}
