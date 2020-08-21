const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  filenameHashing: false,
  productionSourceMap: false,
  configureWebpack: {
    devtool: 'source-map'
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          autoprefixer({
            browsers: ['Android >= 4.0', 'iOS >= 7']
          }),
          pxtorem({
            rootValue: 16,
            propList: ['*']
          })
        ]
      },
      less: {
        lessOptions: {
          modifyVars: {
            'animation-duration-base': '0.05s'
          }
        }
      }
    }
  }
}