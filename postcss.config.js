module.exports = {
  plugins: [
    require('precss'),
    require('autoprefixer')({ browsers: ['last 3 versions', '> 1%'] }),
  ],
}
